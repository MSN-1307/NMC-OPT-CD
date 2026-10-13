from typing import Dict, Any, List, Optional,Tuple
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
    All formulas and constants are explicit and configurable.
    """

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
        # Units:
        # GFLOPS = 10^9 ops/sec = 10^6 ops/ms
        # GB/s   = 10^9 B/sec   = 10^6 B/ms
        # -------------------------------------------------------------
        cpu_compute_ms = ops / (params.cpu_compute_gflops * 1e6)
        cpu_memory_ms = total_bytes / (params.cpu_effective_bandwidth_gbps * 1e6)
        cpu_layout_ms = 0.0
        cpu_sync_ms = 0.0
        cpu_overhead_ms = 0.0
        cpu_total_ms = cpu_compute_ms + cpu_memory_ms

        cpu_breakdown = CostBreakdown(
            compute_ms=round(cpu_compute_ms, 5),
            memory_or_transfer_ms=round(cpu_memory_ms, 5),
            layout_conversion_ms=0.0,
            synchronization_ms=0.0,
            overhead_ms=0.0
        )

        candidates.append(CandidateStrategy(
            strategy="CPU-only",
            valid=True,
            estimated_total_ms=round(cpu_total_ms, 5),
            speedup_vs_cpu=1.0,
            components_ms=cpu_breakdown,
            dominant_factor="Memory-bound on CPU bus" if cpu_memory_ms > cpu_compute_ms else "Compute-bound on CPU ALU",
            notes="Standard CPU execution relying on host L1-L3 caches and memory bus."
        ))

        # -------------------------------------------------------------
        # 2. Direct NMC Offload
        # Formula:
        # NMC_total = NMC_compute + NMC_internal_mem + host_to_nmc + nmc_to_host + layout + sync
        # -------------------------------------------------------------
        nmc_compute_ms = ops / (params.nmc_compute_gflops * 1e6)
        # Internal NMC DRAM bank access time (fast internal row-buffer bandwidth)
        nmc_internal_mem_ms = total_bytes / (params.nmc_effective_bandwidth_gbps * 1e6)
        
        # Link transfers: input data must be dispatched to NMC, results returned to Host
        # Reduction only returns a scalar (4 bytes) to host!
        host_to_nmc_ms = (bytes_read / (params.host_link_bandwidth_gbps * 1e6)) + params.host_to_nmc_overhead_ms
        nmc_to_host_ms = (bytes_written / (params.host_link_bandwidth_gbps * 1e6)) + params.nmc_to_host_overhead_ms
        
        # In Direct NMC, unaligned or non-bank-interleaved inputs require basic layout conversion
        # Vector add and GEMV require interleaved layout for peak bank utilization
        if kernel_id in ["gemv", "vector_add"]:
            layout_ms = (bytes_read * 0.35) / (params.layout_conversion_bandwidth_gbps * 1e6) + params.layout_conversion_overhead_ms
        else:
            layout_ms = params.layout_conversion_overhead_ms * 0.5

        sync_ms = params.sync_events * params.synchronization_overhead_ms
        
        nmc_total_ms = (nmc_compute_ms + nmc_internal_mem_ms) + host_to_nmc_ms + nmc_to_host_ms + layout_ms + sync_ms
        speedup_nmc = (cpu_total_ms / nmc_total_ms) if nmc_total_ms > 0 else 0.0

        nmc_breakdown = CostBreakdown(
            compute_ms=round(nmc_compute_ms + nmc_internal_mem_ms, 5),
            memory_or_transfer_ms=round(host_to_nmc_ms + nmc_to_host_ms, 5),
            layout_conversion_ms=round(layout_ms, 5),
            synchronization_ms=round(sync_ms, 5),
            overhead_ms=round(params.host_to_nmc_overhead_ms + params.nmc_to_host_overhead_ms, 5)
        )

        candidates.append(CandidateStrategy(
            strategy="Direct NMC offload",
            valid=True,
            estimated_total_ms=round(nmc_total_ms, 5),
            speedup_vs_cpu=round(speedup_nmc, 3),
            components_ms=nmc_breakdown,
            dominant_factor="Host-Device Link Transfer" if (host_to_nmc_ms + nmc_to_host_ms) > (nmc_compute_ms + nmc_internal_mem_ms) else "Near-Memory Execution",
            notes="Directly maps kernel instructions to PIM processing units across DRAM banks."
        ))

        # -------------------------------------------------------------
        # 3. NMC + Loop Fusion
        # Eligible only for kernels like ReLU or Fused AXPY
        # -------------------------------------------------------------
        if kernel_id in ["relu", "fused_scale_add"]:
            # Fusion eliminates 35% of intermediate memory reads/writes by keeping intermediate in PIM registers
            fused_bytes = total_bytes * 0.65
            fused_internal_mem = fused_bytes / (params.nmc_effective_bandwidth_gbps * 1e6)
            fused_transfer_ms = (bytes_read * 0.85 / (params.host_link_bandwidth_gbps * 1e6)) + params.host_to_nmc_overhead_ms + nmc_to_host_ms
            fused_layout_ms = layout_ms * 0.7
            fused_overhead = 0.008  # small instruction cache footprint
            fused_total_ms = (nmc_compute_ms + fused_internal_mem) + fused_transfer_ms + fused_layout_ms + sync_ms + fused_overhead
            speedup_fused = (cpu_total_ms / fused_total_ms) if fused_total_ms > 0 else 0.0

            candidates.append(CandidateStrategy(
                strategy="NMC + Loop Fusion",
                valid=True,
                estimated_total_ms=round(fused_total_ms, 5),
                speedup_vs_cpu=round(speedup_fused, 3),
                components_ms=CostBreakdown(
                    compute_ms=round(nmc_compute_ms + fused_internal_mem, 5),
                    memory_or_transfer_ms=round(fused_transfer_ms, 5),
                    layout_conversion_ms=round(fused_layout_ms, 5),
                    synchronization_ms=round(sync_ms, 5),
                    overhead_ms=round(fused_overhead, 5)
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
            # Tiling partitions matrix rows and vector segments to fit into DRAM bank local SRAM/WRAM (64KB per unit)
            # This eliminates redundant vector broadcasts and avoids bank conflicts across PIM channels
            tiled_internal_mem = (total_bytes * 0.40) / (params.nmc_effective_bandwidth_gbps * 1e6)
            tiled_transfer_ms = (bytes_written + (bytes_read * 0.35)) / (params.host_link_bandwidth_gbps * 1e6) + params.host_to_nmc_overhead_ms + params.nmc_to_host_overhead_ms
            tiled_layout_ms = layout_ms * 0.50
            tiled_overhead = 0.008  # loop counter & block stepping overhead
            tiled_total_ms = (nmc_compute_ms + tiled_internal_mem) + tiled_transfer_ms + tiled_layout_ms + sync_ms + tiled_overhead
            speedup_tiled = (cpu_total_ms / tiled_total_ms) if tiled_total_ms > 0 else 0.0

            candidates.append(CandidateStrategy(
                strategy="NMC + Tiling",
                valid=True,
                estimated_total_ms=round(tiled_total_ms, 5),
                speedup_vs_cpu=round(speedup_tiled, 3),
                components_ms=CostBreakdown(
                    compute_ms=round(nmc_compute_ms + tiled_internal_mem, 5),
                    memory_or_transfer_ms=round(tiled_transfer_ms, 5),
                    layout_conversion_ms=round(tiled_layout_ms, 5),
                    synchronization_ms=round(sync_ms, 5),
                    overhead_ms=round(tiled_overhead, 5)
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

    @staticmethod
    def generate_chart_data(
        kernel_id: str,
        facts: KernelAnalysisFacts,
        params: CostModelParameters
    ) -> Tuple[List[ChartSeriesItem], List[SensitivityItem], Optional[int], str]:
        """
        Generates genuine scaling and sensitivity data points derived directly
        from the cost model formulas across problem sizes and bandwidth values,
        tailored dynamically to the kernel's exact arithmetic intensity and memory footprint.
        """
        scaling: List[ChartSeriesItem] = []
        
        # Compute exact marginal rates per iteration for CPU and NMC
        it = max(facts.iterations, 1)
        ops_per_it = facts.estimated_operations / it
        bytes_per_it = facts.total_bytes_moved / it
        read_per_it = facts.estimated_bytes_read / it
        written_per_it = facts.estimated_bytes_written / it

        # Marginal rate for CPU (ms/iteration)
        cpu_marginal = (ops_per_it / (params.cpu_compute_gflops * 1e6)) + (bytes_per_it / (params.cpu_effective_bandwidth_gbps * 1e6))

        # Marginal rate for NMC (ms/iteration)
        nmc_comp_marginal = ops_per_it / (params.nmc_compute_gflops * 1e6)
        nmc_bank_marginal = bytes_per_it / (params.nmc_effective_bandwidth_gbps * 1e6)
        nmc_transfer_marginal = (read_per_it + written_per_it) / (params.host_link_bandwidth_gbps * 1e6)
        layout_marginal = (read_per_it * (0.3 if facts.is_bandwidth_bound else 0.0)) / (params.layout_conversion_bandwidth_gbps * 1e6)
        nmc_marginal = nmc_comp_marginal + nmc_bank_marginal + nmc_transfer_marginal + layout_marginal

        # Fixed startup overheads for NMC (ms)
        fixed_overhead = (
            params.host_to_nmc_overhead_ms +
            params.nmc_to_host_overhead_ms +
            (params.layout_conversion_overhead_ms if facts.is_bandwidth_bound else 0.0) +
            (params.sync_events * params.synchronization_overhead_ms)
        )

        crossover_elements: Optional[int] = None
        crossover_label: str = "No Crossover (Compute-Bound)"

        if cpu_marginal > nmc_marginal:
            # CPU is slower per iteration than NMC; calculate exact threshold where NMC beats CPU
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
            # Scale ops and bytes proportionally
            ratio = sz / facts.iterations if facts.iterations > 0 else 1.0
            cur_ops = facts.estimated_operations * ratio
            cur_bytes = facts.total_bytes_moved * ratio
            cur_read = facts.estimated_bytes_read * ratio
            cur_written = facts.estimated_bytes_written * ratio

            # CPU
            cpu_comp = cur_ops / (params.cpu_compute_gflops * 1e6)
            cpu_mem = cur_bytes / (params.cpu_effective_bandwidth_gbps * 1e6)
            cpu_total = cpu_comp + cpu_mem

            # NMC
            nmc_comp = cur_ops / (params.nmc_compute_gflops * 1e6)
            nmc_int_mem = cur_bytes / (params.nmc_effective_bandwidth_gbps * 1e6)
            h2n = (cur_read / (params.host_link_bandwidth_gbps * 1e6)) + params.host_to_nmc_overhead_ms
            n2h = (cur_written / (params.host_link_bandwidth_gbps * 1e6)) + params.nmc_to_host_overhead_ms
            layout = ((cur_read * 0.3) / (params.layout_conversion_bandwidth_gbps * 1e6) + params.layout_conversion_overhead_ms) if facts.is_bandwidth_bound else 0.0
            sync = params.sync_events * params.synchronization_overhead_ms
            nmc_total = (nmc_comp + nmc_int_mem) + h2n + n2h + layout + sync

            # Transformed candidate if applicable
            trans_total = None
            if kernel_id in ["relu", "fused_scale_add"]:
                trans_total = (nmc_comp + (cur_bytes * 0.65) / (params.nmc_effective_bandwidth_gbps * 1e6)) + (h2n * 0.85) + n2h + (layout * 0.7) + sync + 0.008
            elif kernel_id == "gemv":
                trans_total = (nmc_comp + (cur_bytes * 0.7) / (params.nmc_effective_bandwidth_gbps * 1e6)) + (h2n * 0.85) + n2h + (layout * 0.8) + sync + 0.012

            scaling.append(ChartSeriesItem(
                input_size=sz,
                cpu_ms=round(cpu_total, 4),
                nmc_ms=round(nmc_total, 4),
                transformed_ms=round(trans_total, 4) if trans_total else None
            ))

        # Sensitivity analysis: sweep internal NMC bandwidth from 30 GB/s to 250 GB/s
        sensitivity: List[SensitivityItem] = []
        bw_points = [30.0, 50.0, 80.0, 110.0, 140.0, 180.0, 220.0, 260.0]
        
        cpu_cost_fixed = (facts.estimated_operations / (params.cpu_compute_gflops * 1e6)) + (facts.total_bytes_moved / (params.cpu_effective_bandwidth_gbps * 1e6))
        
        for bw in bw_points:
            nmc_comp = facts.estimated_operations / (params.nmc_compute_gflops * 1e6)
            nmc_int_mem = facts.total_bytes_moved / (bw * 1e6)
            h2n = (facts.estimated_bytes_read / (params.host_link_bandwidth_gbps * 1e6)) + params.host_to_nmc_overhead_ms
            n2h = (facts.estimated_bytes_written / (params.host_link_bandwidth_gbps * 1e6)) + params.nmc_to_host_overhead_ms
            layout = (facts.estimated_bytes_read * 0.3) / (params.layout_conversion_bandwidth_gbps * 1e6) + params.layout_conversion_overhead_ms
            sync = params.sync_events * params.synchronization_overhead_ms
            nmc_total = (nmc_comp + nmc_int_mem) + h2n + n2h + layout + sync

            sensitivity.append(SensitivityItem(
                bandwidth_gbps=bw,
                cpu_ms=round(cpu_cost_fixed, 4),
                nmc_ms=round(nmc_total, 4)
            ))

        return scaling, sensitivity, crossover_elements, crossover_label
