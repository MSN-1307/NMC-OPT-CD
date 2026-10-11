from typing import Optional
from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    KernelAnalysisFacts
)
from app.benchmarks import get_benchmark
from app.analyzer import KernelAnalyzer
from app.ir import IRGenerator
from app.cost_model import AnalyticalCostModel

class NMCOptimizerEngine:
    """
    Main compiler optimization and decision pipeline orchestrator.
    Executes stages:
    Source -> Validation -> Kernel Analysis -> Simplified IR -> Cost Model -> Candidates -> Recommendation
    """

    @classmethod
    def run_pipeline(cls, request: AnalysisRequest) -> AnalysisResponse:
        bm = get_benchmark(request.benchmark_id)
        
        # 1. Loop and Memory Access Analysis
        facts, transformations, warnings = KernelAnalyzer.analyze(
            benchmark_id=request.benchmark_id,
            input_size=request.input_size,
            matrix_rows=request.matrix_rows,
            matrix_cols=request.matrix_cols,
            custom_source=request.custom_source
        )

        # 2. Simplified SSA Intermediate Representation
        instructions, ir_text = IRGenerator.generate(request.benchmark_id, facts)

        # 3. Candidate Strategy Evaluation
        candidates = AnalyticalCostModel.evaluate_candidates(
            kernel_id=request.benchmark_id,
            facts=facts,
            params=request.parameters
        )

        # 4. Recommendation Engine
        recommendation = AnalyticalCostModel.recommend(candidates, facts)

        # 5. Chart series generation (scaling & sensitivity)
        chart_scaling, chart_sensitivity, crossover_elements, crossover_label = AnalyticalCostModel.generate_chart_data(
            kernel_id=request.benchmark_id,
            facts=facts,
            params=request.parameters
        )

        # Documented Model Assumptions
        assumptions = [
            f"Analytical Cost Model: All reported times in milliseconds (ms) calculated using explicit first-principles equations.",
            f"CPU Model: Effective compute = {request.parameters.cpu_compute_gflops:.1f} GFLOPS, Host DRAM bandwidth = {request.parameters.cpu_effective_bandwidth_gbps:.1f} GB/s.",
            f"NMC Model: Aggregate Near-Memory compute = {request.parameters.nmc_compute_gflops:.1f} GFLOPS, Internal DRAM bank bandwidth = {request.parameters.nmc_effective_bandwidth_gbps:.1f} GB/s.",
            f"Interconnect: Host <-> NMC PCIe/CXL link bandwidth = {request.parameters.host_link_bandwidth_gbps:.1f} GB/s with {request.parameters.host_to_nmc_overhead_ms:.3f} ms dispatch overhead.",
            f"Data Layout: Bank reorganization modeled at {request.parameters.layout_conversion_bandwidth_gbps:.1f} GB/s with {request.parameters.layout_conversion_overhead_ms:.3f} ms overhead.",
            "Honesty Notice: All figures are analytical estimates for compiler educational exploration and do not claim physical silicon measurements."
        ]

        if facts.iterations < 50_000 and recommendation.strategy != "CPU-only":
            warnings.append("Workload size is relatively small; PCIe/CXL dispatch overheads may dominate on actual physical hardware.")

        kernel_id = "custom" if (request.benchmark_id == "custom" or request.custom_source) else bm.id
        kernel_name = "Custom User Kernel" if (request.benchmark_id == "custom" or request.custom_source) else bm.name
        src_code = request.custom_source if (request.benchmark_id == "custom" and request.custom_source) else bm.source_code

        return AnalysisResponse(
            kernel_id=kernel_id,
            kernel_name=kernel_name,
            source_code=src_code,
            analysis=facts,
            simplified_ir=instructions,
            ir_text=ir_text,
            transformations=transformations,
            candidates=candidates,
            recommendation=recommendation,
            chart_scaling=chart_scaling,
            chart_sensitivity=chart_sensitivity,
            crossover_elements=crossover_elements,
            crossover_point_label=crossover_label,
            assumptions=assumptions,
            warnings=warnings
        )
