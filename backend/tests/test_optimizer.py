import pytest
from app.schemas import AnalysisRequest, CostModelParameters
from app.optimizer import NMCOptimizerEngine

def test_full_pipeline_vector_add():
    req = AnalysisRequest(
        benchmark_id="vector_add",
        input_size=1_000_000,
        parameters=CostModelParameters()
    )
    res = NMCOptimizerEngine.run_pipeline(req)
    assert res.kernel_id == "vector_add"
    assert len(res.candidates) >= 3
    assert len(res.simplified_ir) > 5
    assert len(res.chart_scaling) > 0
    assert len(res.chart_sensitivity) > 0
    assert res.recommendation.strategy in ["CPU-only", "Direct NMC offload", "NMC + Loop Fusion", "NMC + Tiling"]

def test_full_pipeline_gemv_tiling_eligibility():
    req = AnalysisRequest(
        benchmark_id="gemv",
        input_size=1_000_000,
        matrix_rows=1000,
        matrix_cols=1000,
        parameters=CostModelParameters()
    )
    res = NMCOptimizerEngine.run_pipeline(req)
    tiled_cand = next(c for c in res.candidates if c.strategy == "NMC + Tiling")
    assert tiled_cand.valid is True
    assert tiled_cand.estimated_total_ms > 0
