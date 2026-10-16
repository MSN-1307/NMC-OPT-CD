import argparse
import sys
import json
import os

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas import AnalysisRequest, CostModelParameters
from app.optimizer import NMCOptimizerEngine
from app.benchmarks import BUILTIN_BENCHMARKS

def main():
    parser = argparse.ArgumentParser(
        description="NMC-Opt Studio: Near-Memory Computing Compiler Optimization Workbench CLI"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--benchmark",
        choices=list(BUILTIN_BENCHMARKS.keys()),
        help="Select a built-in benchmark kernel (e.g., vector_add, gemv, relu, axpy, reduction, elementwise_mul)"
    )
    group.add_argument(
        "--custom",
        type=str,
        help="Path to a custom C source file containing a single computational loop"
    )
    
    parser.add_argument(
        "--size",
        type=int,
        default=2_000_000,
        help="Workload scale (total element count, default: 2,000,000)"
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=2048,
        help="Matrix row count for GEMV kernels (default: 2048)"
    )
    parser.add_argument(
        "--cols",
        type=int,
        default=2048,
        help="Matrix column count for GEMV kernels (default: 2048)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON analysis result"
    )

    args = parser.parse_args()

    custom_code = None
    kernel_id = args.benchmark
    if args.custom:
        if not os.path.exists(args.custom):
            print(f"Error: Custom source file not found at '{args.custom}'", file=sys.stderr)
            sys.exit(1)
        with open(args.custom, "r", encoding="utf-8") as f:
            custom_code = f.read()
        kernel_id = "custom"

    request = AnalysisRequest(
        benchmark_id=kernel_id,
        input_size=args.size,
        matrix_rows=args.rows,
        matrix_cols=args.cols,
        custom_source=custom_code,
        parameters=CostModelParameters()
    )

    try:
        response = NMCOptimizerEngine.run_pipeline(request)
    except Exception as e:
        print(f"Optimization pipeline execution error: {e}", file=sys.stderr)
        sys.exit(1)

    if args.json:
        print(response.model_dump_json(indent=2))
        return

    # Formatted Technical Report
    print("=" * 80)
    print("NMC-OPT STUDIO COMPILER OPTIMIZATION ENGINE")
    print("=" * 80)
    print(f"Target Kernel         : {response.kernel_name} ({response.kernel_id})")
    print(f"Workload Scale (N)    : {args.size:,} elements")
    print(f"Arithmetic Intensity  : {response.analysis.arithmetic_intensity:.4f} FLOP/Byte")
    print(f"Total Traffic Volume  : {response.analysis.total_bytes_moved / (1024 * 1024):.2f} MB")
    print(f"Access Pattern        : {response.analysis.memory_access_pattern}")
    print(f"Memory Bottleneck     : {'YES (Bandwidth-Bound)' if response.analysis.is_bandwidth_bound else 'NO (Compute-Bound)'}")
    print("-" * 80)
    print("OPTIMIZATION VERDICT & PLACEMENT MATRIX")
    print("-" * 80)
    print(f"Selected Strategy     : {response.recommendation.strategy}")
    print(f"Estimated Latency     : {response.recommendation.estimated_cost_ms:.4f} ms")
    print(f"Speedup vs Host CPU   : {response.recommendation.speedup_vs_cpu:.2f}x")
    print(f"Decision Rationale    : {response.recommendation.reason}")
    print("-" * 80)
    print("STRATEGY COST BREAKDOWN (ms)")
    print("-" * 80)
    print(f"{'Strategy':<25} | {'Total (ms)':<10} | {'Compute':<10} | {'Mem/Transfer':<12} | {'Speedup':<8}")
    print("-" * 75)
    for cand in response.candidates:
        c = cand.components_ms
        print(f"{cand.strategy:<25} | {cand.estimated_total_ms:<10.4f} | {c.compute_ms:<10.4f} | {c.memory_or_transfer_ms:<12.4f} | {cand.speedup_vs_cpu:<8.2f}x")
    print("-" * 80)
    print("INTERMEDIATE REPRESENTATION (SSA QUADRUPLES)")
    print("-" * 80)
    for inst in response.simplified_ir:
        lbl = f"[{inst.label}] " if inst.label else "      "
        print(f"{lbl}L{inst.line:<3}: {inst.opcode:<15} {inst.operands:<25} ; {inst.comment}")
    print("=" * 80)

if __name__ == "__main__":
    main()
