import pytest
from app.analyzer import KernelAnalyzer
from app.cost_model import AnalyticalCostModel
from app.schemas import CostModelParameters

def test_cost_model_vector_add_positive():
    facts, _, _ = KernelAnalyzer.analyze("vector_add", input_size=5_000_000)
    params = CostModelParameters()
    candidates = AnalyticalCostModel.evaluate_candidates("vector_add", facts, params)
    
    cpu_cand = next(c for c in candidates if c.strategy == "CPU-only")
    nmc_cand = next(c for c in candidates if c.strategy == "Direct NMC offload")
    
    assert cpu_cand.valid is True
    assert cpu_cand.estimated_total_ms > 0
    assert cpu_cand.components_ms.compute_ms > 0
    assert cpu_cand.components_ms.memory_or_transfer_ms > 0
    
    assert nmc_cand.valid is True
    assert nmc_cand.estimated_total_ms > 0
    assert nmc_cand.components_ms.compute_ms > 0
    assert nmc_cand.components_ms.memory_or_transfer_ms > 0

def test_cpu_wins_under_high_transfer_overhead():
    facts, _, _ = KernelAnalyzer.analyze("vector_add", input_size=10_000)
    # Huge overhead makes NMC unfavorable for tiny input size
    params = CostModelParameters(
        host_to_nmc_overhead_ms=5.0,
        nmc_to_host_overhead_ms=5.0,
        layout_conversion_overhead_ms=5.0,
        synchronization_overhead_ms=2.0
    )
    candidates = AnalyticalCostModel.evaluate_candidates("vector_add", facts, params)
    recommendation = AnalyticalCostModel.recommend(candidates, facts)
    
    assert recommendation.strategy == "CPU-only"

def test_nmc_wins_under_large_bandwidth_bound_workload():
    facts, _, _ = KernelAnalyzer.analyze("vector_add", input_size=10_000_000)
    params = CostModelParameters(
        cpu_effective_bandwidth_gbps=20.0,
        nmc_effective_bandwidth_gbps=200.0,
        host_link_bandwidth_gbps=64.0,
        host_to_nmc_overhead_ms=0.01,
        nmc_to_host_overhead_ms=0.01
    )
    candidates = AnalyticalCostModel.evaluate_candidates("vector_add", facts, params)
    recommendation = AnalyticalCostModel.recommend(candidates, facts)
    
    assert "NMC" in recommendation.strategy
