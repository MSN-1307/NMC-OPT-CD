import re
from typing import Tuple, List, Optional
from app.schemas import KernelAnalysisFacts, TransformationEligibility, BenchmarkMetadata
from app.benchmarks import BUILTIN_BENCHMARKS, get_benchmark

class KernelAnalyzer:
    """
    Analyzes supported loop kernels without executing code.
    Extracts loop structure, estimated operations, memory footprints,
    arithmetic intensity, and transformation eligibility.
    """

    @staticmethod
    def analyze(
        benchmark_id: str,
        input_size: int,
        matrix_rows: Optional[int] = None,
        matrix_cols: Optional[int] = None,
        custom_source: Optional[str] = None
    ) -> Tuple[KernelAnalysisFacts, List[TransformationEligibility], List[str]]:
        warnings: List[str] = []
        element_bytes = 4  # standard 32-bit float
        data_type = "float32"

        # Determine benchmark / custom
        is_custom = benchmark_id == "custom" or (custom_source is not None and len(custom_source.strip()) > 0)
        
        if is_custom and custom_source:
            # Analyze custom loop source code
            src = custom_source
            
            # Detect loops
            loop_match = re.search(r'for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z_0-9]+)\s*;\s*(?:\+\+\1|\1\+\+)\s*\)', src)
            iterations = input_size
            loop_bounds = f"i in [0, {iterations}) [Parsed from custom loop]"
            
            # Count arithmetic operators
            ops_per_iteration = 0
            for op in ['+', '-', '*', '/', '>', '<', '==']:
                ops_per_iteration += src.count(op)
            ops_per_iteration = max(1, ops_per_iteration)
            estimated_ops = iterations * ops_per_iteration
            
            # Detect array reads and writes
            # Patterns like A[i], arr[i]
            array_accesses = re.findall(r'([a-zA-Z_]\w*)\s*\[\s*[a-zA-Z_0-9\+\-\*\s]+\s*\]', src)
            unique_arrays = list(set(array_accesses))
            
            # Detect write target on LHS of assignment
            lhs_matches = re.findall(r'([a-zA-Z_]\w*)\s*\[[^\]]+\]\s*=', src)
            writes_count = len(lhs_matches) if lhs_matches else 1
            reads_count = max(1, len(array_accesses) - writes_count)
            
            # Detect reduction (e.g. sum += ...)
            is_reduction = bool(re.search(r'\+=\s*|\*=\s*|sum\s*=', src))
            
            if is_reduction:
                estimated_bytes_read = iterations * reads_count * element_bytes
                estimated_bytes_written = element_bytes
                memory_access_pattern = "Custom Loop with Reduction Accumulator"
                reuse_factor = 1.0
            else:
                estimated_bytes_read = iterations * reads_count * element_bytes
                estimated_bytes_written = iterations * writes_count * element_bytes
                memory_access_pattern = "Custom Streaming Pointwise Array Operation"
                reuse_factor = 1.0
                
            total_bytes = estimated_bytes_read + estimated_bytes_written
            warnings.append(f"Custom loop ingested: parsed {len(unique_arrays)} distinct array references and {ops_per_iteration} ops/iter.")
            bm_id = "custom"
            bm_name = "Custom User Kernel"
            
        else:
            ID_ALIASES = {
                "vadd": "vector_add",
                "vec_add": "vector_add",
                "vector_addition": "vector_add",
                "sum": "reduction",
                "reduce": "reduction",
            }
            norm_id = ID_ALIASES.get(benchmark_id, benchmark_id)
            if norm_id in BUILTIN_BENCHMARKS:
                bm = BUILTIN_BENCHMARKS[norm_id]
                bm_id = bm.id
                bm_name = bm.name
            else:
                bm = BUILTIN_BENCHMARKS["vector_add"]
                bm_id = bm.id
                bm_name = bm.name
                warnings.append(f"Unrecognized benchmark ID '{benchmark_id}'. Defaulted to Vector Addition.")

        # Determine iterations and matrix dimensions for builtins
        if not is_custom:
            if bm_id == "gemv":
                if matrix_rows and matrix_cols:
                    rows = matrix_rows
                    cols = matrix_cols
                else:
                    dim = int(input_size ** 0.5)
                    dim = max(16, (dim // 16) * 16)
                    rows = dim
                    cols = dim
                
                iterations = rows * cols
                loop_bounds = f"outer: i in [0, {rows}), inner: j in [0, {cols}) (N={rows}, M={cols})"
                estimated_ops = 2 * iterations
                bytes_matrix = rows * cols * element_bytes
                bytes_vector_x = cols * element_bytes
                bytes_vector_y = rows * element_bytes
                
                estimated_bytes_read = bytes_matrix + bytes_vector_x
                estimated_bytes_written = bytes_vector_y
                total_bytes = estimated_bytes_read + estimated_bytes_written
                reuse_factor = float(rows)
                memory_access_pattern = "2D Row-Major Matrix Scan + Repeated Vector Broadcast"
                
            elif bm_id == "vector_add":
                iterations = input_size
                loop_bounds = f"i in [0, {iterations})"
                estimated_ops = iterations
                estimated_bytes_read = 2 * iterations * element_bytes
                estimated_bytes_written = iterations * element_bytes
                total_bytes = estimated_bytes_read + estimated_bytes_written
                reuse_factor = 1.0
                memory_access_pattern = "Streaming Contiguous Sequential"
                
            elif bm_id == "reduction":
                iterations = input_size
                loop_bounds = f"i in [0, {iterations})"
                estimated_ops = iterations
                estimated_bytes_read = iterations * element_bytes
                estimated_bytes_written = element_bytes
                total_bytes = estimated_bytes_read + estimated_bytes_written
                reuse_factor = 1.0
                memory_access_pattern = "Streaming Sequential with Accumulator Register"
                
            elif bm_id == "relu":
                iterations = input_size
                loop_bounds = f"i in [0, {iterations})"
                estimated_ops = iterations
                estimated_bytes_read = iterations * element_bytes
                estimated_bytes_written = iterations * element_bytes
                total_bytes = estimated_bytes_read + estimated_bytes_written
                reuse_factor = 1.0
                memory_access_pattern = "Streaming Contiguous Pointwise"
                
            elif bm_id == "fused_scale_add":
                iterations = input_size
                loop_bounds = f"i in [0, {iterations})"
                estimated_ops = 2 * iterations
                estimated_bytes_read = 2 * iterations * element_bytes
                estimated_bytes_written = iterations * element_bytes
                total_bytes = estimated_bytes_read + estimated_bytes_written
                reuse_factor = 1.0
                memory_access_pattern = "Streaming Dual-Input Pointwise"
                
            else:
                iterations = input_size
                loop_bounds = f"i in [0, {iterations})"
                estimated_ops = iterations
                estimated_bytes_read = iterations * element_bytes * 2
                estimated_bytes_written = iterations * element_bytes
                total_bytes = estimated_bytes_read + estimated_bytes_written
                reuse_factor = 1.0
                memory_access_pattern = "Sequential Array Access"

        # Calculate Arithmetic Intensity (FLOPs / Byte)
        arithmetic_intensity = (estimated_ops / total_bytes) if total_bytes > 0 else 0.0
        
        # In general, if arithmetic intensity < 1.0 FLOP/Byte, kernel is strictly memory-bandwidth bound
        is_bandwidth_bound = arithmetic_intensity < 1.0

        facts = KernelAnalysisFacts(
            loop_bounds=loop_bounds,
            iterations=iterations,
            estimated_operations=estimated_ops,
            estimated_bytes_read=estimated_bytes_read,
            estimated_bytes_written=estimated_bytes_written,
            total_bytes_moved=total_bytes,
            arithmetic_intensity=round(arithmetic_intensity, 4),
            memory_access_pattern=memory_access_pattern,
            reuse_factor=round(reuse_factor, 2),
            is_bandwidth_bound=is_bandwidth_bound,
            data_type=data_type,
            element_bytes=element_bytes
        )

        # Evaluate transformation eligibility according to compiler rules
        transformations: List[TransformationEligibility] = []
        
        # 1. Loop Fusion
        if bm_id in ["relu", "fused_scale_add"]:
            transformations.append(TransformationEligibility(
                name="Loop Fusion",
                eligible=True,
                reason="Kernel has simple pointwise iteration space without loop-carried dependencies; can fuse producer/consumer loops to eliminate intermediate memory traffic.",
                potential_benefit="Reduces round-trip DRAM access by caching intermediate variables in Near-Memory registers."
            ))
        else:
            transformations.append(TransformationEligibility(
                name="Loop Fusion",
                eligible=False,
                reason=f"Kernel '{bm_name}' lacks consecutive fusible loops or presents reduction/reduction-tree dependency.",
                potential_benefit="None for standalone kernel."
            ))

        # 2. Loop Tiling (Blocking)
        if bm_id == "gemv":
            transformations.append(TransformationEligibility(
                name="Loop Tiling (Bank Blocking)",
                eligible=True,
                reason="Nested iteration space (N x M) with reusable vector X. Tiling matrix rows and vector segments allows fitting slices into local NMC bank buffers (e.g. 64KB WRAM).",
                potential_benefit="Reduces bank conflict stalls and exploits temporal locality on vector X."
            ))
        else:
            transformations.append(TransformationEligibility(
                name="Loop Tiling (Bank Blocking)",
                eligible=False,
                reason="Streaming 1D kernel accesses elements once with zero temporal reuse; tiling adds index calculation overhead without cache reuse benefit.",
                potential_benefit="None for 1D streaming workloads."
            ))

        # 3. Bank Interleaving
        transformations.append(TransformationEligibility(
            name="DRAM Bank Interleaving",
            eligible=True,
            reason="Can partition array elements contiguously across distinct DRAM PIM banks (e.g. 16 or 64 banks) to maximize internal parallel memory bandwidth.",
            potential_benefit="Maximizes internal aggregate DRAM throughput by distributing reads evenly across bank channels."
        ))

        return facts, transformations, warnings
