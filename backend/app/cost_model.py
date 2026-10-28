from typing import Dict, Any, List, Optional, Tuple
from app.schemas import (
    CostModelParameters,
    KernelAnalysisFacts,
    CostBreakdown,
    CandidateStrategy,
    StrategyRecommendation,
    ChartSeriesItem,
    SensitivityItem
)

class AnalyticalCostModel:
    """
    Transparent analytical cost model comparing CPU-only execution with Near-Memory Computing (NMC).
    Uses millisecond (ms) units consistently.
    All formulas and constants are explicit, configurable, and mathematically balanced so that
    sum of breakdown components equals estimated total latency with 100% precision.
    """

    @staticmethod
    def _calc_layout_cost(
        kernel_id: str,
        is_bandwidth_bound: bool,
        bytes_read: float,
        params: CostModelParameters
    ) -> Tuple[float, float]:
        """
        Calculates (variable_layout_ms, overhead_layout_ms).
        Unary kernels (ReLU) incur zero layout collision overhead.
        Interleaved/striped kernels incur layout rearrangement.
        """
        if kernel_id in ["relu"]:
            return 0.0, 0.0
        elif kernel_id in ["gemv", "vector_add", "vadd", "vec_add", "elementwise_mul", "axpy", "fused_scale_add"]:
            var_ms = (bytes_read * 0.35) / (params.layout_conversion_bandwidth_gbps * 1e6)
            oh_ms = params.layout_conversion_overhead_ms
            return var_ms, oh_ms
        elif kernel_id == "reduction":
            var_ms = (bytes_read * 0.20) / (params.layout_conversion_bandwidth_gbps * 1e6)
            oh_ms = params.layout_conversion_overhead_ms * 0.5
            return var_ms, oh_ms
        else:
            if is_bandwidth_bound:
                var_ms = (bytes_read * 0.30) / (params.layout_conversion_bandwidth_gbps * 1e6)
                oh_ms = params.layout_conversion_overhead_ms
            else:
                var_ms = 0.0
                oh_ms = params.layout_conversion_overhead_ms * 0.5
            return var_ms, oh_ms

    @classmethod
    def _evaluate_raw_costs(
        cls,
        kernel_id: str,
        is_bandwidth_bound: bool,
        ops: float,
        bytes_read: float,
        bytes_written: float,
        total_bytes: float,
        params: CostModelParameters
    ) -> Tuple[float, float, Optional[float]]:
        """
        Single source of truth evaluating total execution costs in milliseconds (ms)
        for (CPU-only, Direct NMC, Transformed NMC).
        """
        # 1. CPU-Only
        cpu_comp = ops / (params.cpu_compute_gflops * 1e6)
        cpu_mem = total_bytes / (params.cpu_effective_bandwidth_gbps * 1e6)
        cpu_total = round(cpu_comp + cpu_mem, 5)

        # 2. Direct NMC
        nmc_comp = ops / (params.nmc_compute_gflops * 1e6)
        nmc_int_mem = total_bytes / (params.nmc_effective_bandwidth_gbps * 1e6)
        pure_xfer = (bytes_read + bytes_written) / (params.host_link_bandwidth_gbps * 1e6)
        layout_var, layout_oh = cls._calc_layout_cost(kernel_id, is_bandwidth_bound, bytes_read, params)
        sync = params.sync_events * params.synchronization_overhead_ms
        link_oh = params.host_to_nmc_overhead_ms + params.nmc_to_host_overhead_ms
        nmc_total = round((nmc_comp + nmc_int_mem) + pure_xfer + (layout_var + layout_oh) + sync + link_oh, 5)

        # 3. Transformed Candidate
        trans_total = None
        if kernel_id in ["relu", "fused_scale_add", "axpy"]:
            fused_bytes = total_bytes * 0.65
            fused_int_mem = fused_bytes / (params.nmc_effective_bandwidth_gbps * 1e6)
            fused_xfer = ((bytes_read * 0.85) + bytes_written) / (params.host_link_bandwidth_gbps * 1e6)
            fused_layout = (layout_var + layout_oh) * 0.70
            fused_oh = link_oh + 0.008
            trans_total = round((nmc_comp + fused_int_mem) + fused_xfer + fused_layout + sync + fused_oh, 5)
        elif kernel_id == "gemv":
            tiled_int_mem = (total_bytes * 0.40) / (params.nmc_effective_bandwidth_gbps * 1e6)
            tiled_xfer = (bytes_written + (bytes_read * 0.35)) / (params.host_link_bandwidth_gbps * 1e6)
            tiled_layout = (layout_var + layout_oh) * 0.50
            tiled_oh = link_oh + 0.008
            trans_total = round((nmc_comp + tiled_int_mem) + tiled_xfer + tiled_layout + sync + tiled_oh, 5)

        return cpu_total, nmc_total, trans_total

    @staticmethod
    def evaluate_candidates(
        kernel_id: str,
        facts: KernelAnalysisFacts,
        params: CostModelParameters
    ) -> List[CandidateStrategy]:
        if kernel_id in ["vadd", "vec_add"]:
            kernel_id = "vector_add"

        candidates: List[CandidateStrategy] = []

        ops = facts.estimated_operations
        bytes_read = facts.estimated_bytes_read
        bytes_written = facts.estimated_bytes_written
        total_bytes = facts.total_bytes_moved

        # -------------------------------------------------------------
        # 1. CPU-Only Strategy
        # Formula: CPU_total = CPU_compute + CPU_memory
        # -------------------------------------------------------------
        cpu_compute_ms = round(ops / (params.cpu_compute_gflops * 1e6), 5)
        cpu_memory_ms = round(total_bytes / (params.cpu_effective_bandwidth_gbps * 1e6), 5)
        cpu_total_ms = round(cpu_compute_ms + cpu_memory_ms, 5)

        cpu_breakdown = CostBreakdown(
            compute_ms=cpu_compute_ms,
            memory_or_transfer_ms=cpu_memory_ms,
            layout_conversion_ms=0.0,
            synchronization_ms=0.0,
            overhead_ms=0.0
        )

        candidates.append(CandidateStrategy(
            strategy="CPU-only",
            valid=True,
            estimated_total_ms=cpu_total_ms,
            speedup_vs_cpu=1.0,
            components_ms=cpu_breakdown,
            dominant_factor="Memory-bound on CPU bus" if cpu_memory_ms > cpu_compute_ms else "Compute-bound on CPU ALU",
            notes="Standard CPU execution relying on host L1-L3 caches and memory bus."
        ))

        # -------------------------------------------------------------
        # 2. Direct NMC Offload
        # Formula:
        # NMC_total = (compute + internal_mem) + transfer_data + layout + sync + link_overhead
        # Components are disjoint and their sum equals estimated_total_ms exactly.
        # -------------------------------------------------------------
        nmc_compute_ms = ops / (params.nmc_compute_gflops * 1e6)
        nmc_internal_mem_ms = total_bytes / (params.nmc_effective_bandwidth_gbps * 1e6)
        comp_bank_ms = round(nmc_compute_ms + nmc_internal_mem_ms, 5)

        # Pure link transfer (excluding DMA launch/dispatch overhead)
        pure_transfer_ms = round((bytes_read + bytes_written) / (params.host_link_bandwidth_gbps * 1e6), 5)

        layout_var, layout_oh = AnalyticalCostModel._calc_layout_cost(
            kernel_id, facts.is_bandwidth_bound, bytes_read, params
        )
        layout_ms = round(layout_var + layout_oh, 5)

        sync_ms = round(params.sync_events * params.synchronization_overhead_ms, 5)
        link_overhead_ms = round(params.host_to_nmc_overhead_ms + params.nmc_to_host_overhead_ms, 5)

        nmc_total_ms = round(comp_bank_ms + pure_transfer_ms + layout_ms + sync_ms + link_overhead_ms, 5)
        speedup_nmc = round((cpu_total_ms / nmc_total_ms), 3) if nmc_total_ms > 0 else 0.0

        nmc_breakdown = CostBreakdown(
            compute_ms=comp_bank_ms,
            memory_or_transfer_ms=pure_transfer_ms,
            layout_conversion_ms=layout_ms,
            synchronization_ms=sync_ms,
            overhead_ms=link_overhead_ms
        )

        candidates.append(CandidateStrategy(
            strategy="Direct NMC offload",
            valid=True,
            estimated_total_ms=nmc_total_ms,
            speedup_vs_cpu=speedup_nmc,
            components_ms=nmc_breakdown,
            dominant_factor="Host-Device Link Transfer" if pure_transfer_ms + link_overhead_ms > comp_bank_ms else "Near-Memory Execution",
            notes="Directly maps kernel instructions to PIM processing units across DRAM banks."
        ))

        # -------------------------------------------------------------
        # 3. NMC + Loop Fusion
        # Eligible only for kernels like ReLU or Fused AXPY
        # -------------------------------------------------------------
        if kernel_id in ["relu", "fused_scale_add", "axpy"]:
            fused_bytes = total_bytes * 0.65
            fused_internal_mem = fused_bytes / (params.nmc_effective_bandwidth_gbps * 1e6)
            fused_comp_ms = round(nmc_compute_ms + fused_internal_mem, 5)
            fused_transfer_ms = round(((bytes_read * 0.85) + bytes_written) / (params.host_link_bandwidth_gbps * 1e6), 5)
            fused_layout_ms = round(layout_ms * 0.70, 5)
            fused_instr_oh = 0.008  # small instruction cache footprint
            fused_total_oh = round(link_overhead_ms + fused_instr_oh, 5)
            fused_total_ms = round(fused_comp_ms + fused_transfer_ms + fused_layout_ms + sync_ms + fused_total_oh, 5)
            speedup_fused = round((cpu_total_ms / fused_total_ms), 3) if fused_total_ms > 0 else 0.0

            candidates.append(CandidateStrategy(
                strategy="NMC + Loop Fusion",
                valid=True,
                estimated_total_ms=fused_total_ms,
                speedup_vs_cpu=speedup_fused,
                components_ms=CostBreakdown(
                    compute_ms=fused_comp_ms,
                    memory_or_transfer_ms=fused_transfer_ms,
                    layout_conversion_ms=fused_layout_ms,
                    synchronization_ms=sync_ms,
                    overhead_ms=fused_total_oh
                ),
                dominant_factor="Optimized Near-Memory Stream",
                notes="Fuses operation with memory load to retain intermediate values in PIM local registers."
            ))
        else:
            candidates.append(CandidateStrategy(
                strategy="NMC + Loop Fusion",
                valid=False,
                invalidation_reason=f"Kernel '{kernel_id}' does not have fusible loop pairs; cannot apply loop fusion.",
                estimated_total_ms=0.0,
                speedup_vs_cpu=0.0,
                components_ms=CostBreakdown(compute_ms=0, memory_or_transfer_ms=0, layout_conversion_ms=0, synchronization_ms=0, overhead_ms=0),
                dominant_factor="N/A",
                notes="Legality check failed: in-memory fusion requires compatible loop boundaries and lack of reduction dependencies."
            ))

        # -------------------------------------------------------------
        # 4. NMC + Loop Tiling (Bank Blocking)
        # Eligible only for kernels with multi-dimensional reuse (e.g., GEMV)
        # -------------------------------------------------------------
        if kernel_id == "gemv":
            tiled_internal_mem = (total_bytes * 0.40) / (params.nmc_effective_bandwidth_gbps * 1e6)
            tiled_comp_ms = round(nmc_compute_ms + tiled_internal_mem, 5)
            tiled_transfer_ms = round((bytes_written + (bytes_read * 0.35)) / (params.host_link_bandwidth_gbps * 1e6), 5)
            tiled_layout_ms = round(layout_ms * 0.50, 5)
            tiled_loop_oh = 0.008  # loop counter & block stepping overhead
            tiled_total_oh = round(link_overhead_ms + tiled_loop_oh, 5)
            tiled_total_ms = round(tiled_comp_ms + tiled_transfer_ms + tiled_layout_ms + sync_ms + tiled_total_oh, 5)
            speedup_tiled = round((cpu_total_ms / tiled_total_ms), 3) if tiled_total_ms > 0 else 0.0

            candidates.append(CandidateStrategy(
                strategy="NMC + Tiling",
                valid=True,
                estimated_total_ms=tiled_total_ms,
                speedup_vs_cpu=speedup_tiled,
                components_ms=CostBreakdown(
                    compute_ms=tiled_comp_ms,
                    memory_or_transfer_ms=tiled_transfer_ms,
                    layout_conversion_ms=tiled_layout_ms,
                    synchronization_ms=sync_ms,
                    overhead_ms=tiled_total_oh
                ),
                dominant_factor="Bank-Buffered Locality",
                notes="Tiles matrix rows and columns across PIM banks to fit within 64KB WRAM buffers."
            ))
        else:
            candidates.append(CandidateStrategy(
                strategy="NMC + Tiling",
                valid=False,
                invalidation_reason=f"1D streaming kernel '{kernel_id}' does not have temporal reuse; tiling adds loop overhead without cache benefit.",
                estimated_total_ms=0.0,
                speedup_vs_cpu=0.0,
                components_ms=CostBreakdown(compute_ms=0, memory_or_transfer_ms=0, layout_conversion_ms=0, synchronization_ms=0, overhead_ms=0),
                dominant_factor="N/A",
                notes="Legality check failed: loop tiling requires reuse across multiple iteration dimensions."
            ))

        return candidates

    @staticmethod
    def recommend(
        candidates: List[CandidateStrategy],
        facts: KernelAnalysisFacts
    ) -> StrategyRecommendation:
        valid_candidates = [c for c in candidates if c.valid]
        if not valid_candidates:
            return StrategyRecommendation(
                strategy="CPU-only",
                estimated_cost_ms=0.0,
                speedup_vs_cpu=1.0,
                reason="No valid candidate found.",
                key_tradeoffs=["Fallback to standard CPU."]
            )

        # Pick candidate with lowest estimated total execution time
        best = min(valid_candidates, key=lambda c: c.estimated_total_ms)
        cpu_cand = next((c for c in candidates if c.strategy == "CPU-only"), valid_candidates[0])

        speedup = (cpu_cand.estimated_total_ms / best.estimated_total_ms) if best.estimated_total_ms > 0 else 1.0

        tradeoffs: List[str] = []
        if best.strategy == "CPU-only":
            reason = (
                f"CPU-only execution is selected ({best.estimated_total_ms:.3f} ms). "
                f"Even though Near-Memory Computing offers higher internal DRAM bandwidth, "
                f"the host-device transfer overhead, data layout conversion, and synchronization barriers "
                f"surpass the compute benefit for this workload size."
            )
            tradeoffs.append("Avoids host-to-device PCIe/CXL transfer overhead entirely.")
            tradeoffs.append("Eliminates bank-interleaved data layout reorganization costs.")
            tradeoffs.append("Best suited when data already resides in host L2/L3 caches or when payload is small.")
        elif best.strategy == "Direct NMC offload":
            reason = (
                f"Direct NMC offload is recommended ({best.estimated_total_ms:.3f} ms, {speedup:.2f}x speedup). "
                f"The kernel has low arithmetic intensity ({facts.arithmetic_intensity:.3f} FLOP/B) and high data volume, "
                f"allowing NMC's massive internal DRAM bank bandwidth to drastically outperform CPU memory bus limits."
            )
            tradeoffs.append("Leverages high internal DRAM bank bandwidth (eliminating off-chip bus bottleneck).")
            tradeoffs.append("Requires initial host-to-device data transfer and synchronization barrier.")
            tradeoffs.append(f"High data volume ({facts.total_bytes_moved / 1024 / 1024:.2f} MB) amortizes dispatch overheads.")
        elif best.strategy == "NMC + Loop Fusion":
            reason = (
                f"NMC with Loop Fusion is recommended ({best.estimated_total_ms:.3f} ms, {speedup:.2f}x speedup). "
                f"Fusing operations eliminates intermediate DRAM round-trips and keeps intermediate operands in PIM registers."
            )
            tradeoffs.append("Eliminates intermediate memory traffic between consecutive loop iterations.")
            tradeoffs.append("Maximizes compute density per DRAM bank cycle.")
            tradeoffs.append("Requires compiler code-generation support for unified loop kernels.")
        elif best.strategy == "NMC + Tiling":
            reason = (
                f"NMC with Loop Tiling is recommended ({best.estimated_total_ms:.3f} ms, {speedup:.2f}x speedup). "
                f"Tiling rows and columns partitions data into bank-local buffers, maximizing reuse and avoiding bank conflicts."
            )
            tradeoffs.append("Exploits reuse on broadcast vector X inside bank-local SRAM/WRAM.")
            tradeoffs.append("Eliminates DRAM bank access collisions across parallel PIM channels.")
            tradeoffs.append("Adds minor index arithmetic overhead in the inner loop.")
        else:
            reason = f"Candidate '{best.strategy}' yields the minimum estimated execution time."
            tradeoffs.append("Analytical model predicts lowest total latency.")

        return StrategyRecommendation(
            strategy=best.strategy,
            estimated_cost_ms=round(best.estimated_total_ms, 5),
            speedup_vs_cpu=round(speedup, 2),
            reason=reason,
            key_tradeoffs=tradeoffs
        )

    @classmethod
    def generate_chart_data(
        cls,
        kernel_id: str,
        facts: KernelAnalysisFacts,
        params: CostModelParameters
    ) -> Tuple[List[ChartSeriesItem], List[SensitivityItem], Optional[int], str]:
        """
        Generates genuine scaling and sensitivity data points derived directly
        from the cost model formulas across problem sizes and bandwidth values,
        tailored dynamically to the kernel's exact arithmetic intensity and memory footprint.
        """
        if kernel_id in ["vadd", "vec_add"]:
            kernel_id = "vector_add"

        scaling: List[ChartSeriesItem] = []
        
        # Marginal slope rate calculation for analytical crossover detection
        it = max(facts.iterations, 1)
        ops_per_it = facts.estimated_operations / it
        bytes_per_it = facts.total_bytes_moved / it
        read_per_it = facts.estimated_bytes_read / it
        written_per_it = facts.estimated_bytes_written / it

        layout_var_it, layout_oh_fixed = cls._calc_layout_cost(
            kernel_id, facts.is_bandwidth_bound, facts.estimated_bytes_read, params
        )
        layout_var_per_it = layout_var_it / it

        # Marginal per-iteration slopes (ms/it)
        cpu_marginal = (ops_per_it / (params.cpu_compute_gflops * 1e6)) + (bytes_per_it / (params.cpu_effective_bandwidth_gbps * 1e6))
        nmc_marginal = (
            (ops_per_it / (params.nmc_compute_gflops * 1e6)) +
            (bytes_per_it / (params.nmc_effective_bandwidth_gbps * 1e6)) +
            ((read_per_it + written_per_it) / (params.host_link_bandwidth_gbps * 1e6)) +
            layout_var_per_it
        )

        fixed_overhead = (
            params.host_to_nmc_overhead_ms +
            params.nmc_to_host_overhead_ms +
            layout_oh_fixed +
            (params.sync_events * params.synchronization_overhead_ms)
        )

        crossover_elements: Optional[int] = None
        crossover_label: str = "No Crossover (Compute-Bound)"

        if cpu_marginal > nmc_marginal:
            crossover_calc = int(fixed_overhead / (cpu_marginal - nmc_marginal))
            if crossover_calc < 10_000:
                crossover_elements = max(1000, round(crossover_calc / 500) * 500)
            elif crossover_calc < 100_000:
                crossover_elements = round(crossover_calc / 5_000) * 5_000
            elif crossover_calc < 1_000_000:
                crossover_elements = round(crossover_calc / 25_000) * 25_000
            else:
                crossover_elements = round(crossover_calc / 100_000) * 100_000

            if crossover_elements >= 1_000_000:
                crossover_label = f"Crossover point ~{crossover_elements / 1_000_000:.2f}M Elements"
            else:
                crossover_label = f"Crossover point ~{crossover_elements // 1000:,}K Elements"
        else:
            crossover_elements = None
            crossover_label = "No Crossover (CPU strictly faster across scales)"

        # Construct problem sizes dynamically around this specific kernel's crossover point
        if crossover_elements:
            cx = crossover_elements
            raw_sizes = [
                max(5_000, int(cx * 0.1)),
                max(20_000, int(cx * 0.4)),
                cx,  # Exact Crossover Point
                int(cx * 2.0),
                int(cx * 4.0),
                int(cx * 8.0),
            ]
            if facts.iterations not in raw_sizes:
                raw_sizes.append(facts.iterations)
        else:
            raw_sizes = [
                10_000, 50_000, 200_000, 500_000, 1_000_000, 2_000_000, 4_000_000
            ]
            if facts.iterations not in raw_sizes:
                raw_sizes.append(facts.iterations)

        test_sizes = sorted(list(set(raw_sizes)))

        for sz in test_sizes:
            if kernel_id == "gemv":
                dim = int(sz ** 0.5)
                dim = max(16, (dim // 16) * 16)
                rows = dim
                cols = dim
                sz_ops = 2.0 * rows * cols
                sz_bytes_read = (rows * cols * 4.0) + (cols * 4.0)
                sz_bytes_written = rows * 4.0
                sz_total_bytes = sz_bytes_read + sz_bytes_written
            elif kernel_id == "reduction":
                sz_ops = float(sz)
                sz_bytes_read = sz * 4.0
                sz_bytes_written = 4.0  # scalar scalar output
                sz_total_bytes = sz_bytes_read + sz_bytes_written
            else:
                ratio = sz / facts.iterations if facts.iterations > 0 else 1.0
                sz_ops = facts.estimated_operations * ratio
                sz_bytes_read = facts.estimated_bytes_read * ratio
                sz_bytes_written = facts.estimated_bytes_written * ratio
                sz_total_bytes = sz_bytes_read + sz_bytes_written

            cpu_total, nmc_total, trans_total = cls._evaluate_raw_costs(
                kernel_id, facts.is_bandwidth_bound, sz_ops, sz_bytes_read, sz_bytes_written, sz_total_bytes, params
            )

            scaling.append(ChartSeriesItem(
                input_size=sz,
                cpu_ms=round(cpu_total, 4),
                nmc_ms=round(nmc_total, 4),
                transformed_ms=round(trans_total, 4) if trans_total is not None else None
            ))

        # Sensitivity analysis: sweep internal NMC bandwidth from 30 GB/s to 260 GB/s
        # ensuring the active hardware parameter bandwidth is precisely included
        sensitivity: List[SensitivityItem] = []
        bw_points = sorted(list(set([30.0, 50.0, 80.0, 110.0, 140.0, 160.0, 180.0, 220.0, 260.0, float(params.nmc_effective_bandwidth_gbps)])))
        
        cpu_cost_fixed = round((facts.estimated_operations / (params.cpu_compute_gflops * 1e6)) + (facts.total_bytes_moved / (params.cpu_effective_bandwidth_gbps * 1e6)), 4)
        
        layout_var, layout_oh = cls._calc_layout_cost(kernel_id, facts.is_bandwidth_bound, facts.estimated_bytes_read, params)
        layout_cost = layout_var + layout_oh
        pure_transfer = (facts.estimated_bytes_read + facts.estimated_bytes_written) / (params.host_link_bandwidth_gbps * 1e6)
        fixed_link_and_sync = (
            params.host_to_nmc_overhead_ms +
            params.nmc_to_host_overhead_ms +
            (params.sync_events * params.synchronization_overhead_ms)
        )
        nmc_comp_fixed = facts.estimated_operations / (params.nmc_compute_gflops * 1e6)

        for bw in bw_points:
            nmc_int_mem = facts.total_bytes_moved / (bw * 1e6)
            nmc_total = round(nmc_comp_fixed + nmc_int_mem + pure_transfer + layout_cost + fixed_link_and_sync, 4)

            sensitivity.append(SensitivityItem(
                bandwidth_gbps=bw,
                cpu_ms=cpu_cost_fixed,
                nmc_ms=nmc_total
            ))

        return scaling, sensitivity, crossover_elements, crossover_label
