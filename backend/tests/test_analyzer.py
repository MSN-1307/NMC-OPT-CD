import pytest
from app.analyzer import KernelAnalyzer

def test_vector_add_facts():
    facts, transforms, warnings = KernelAnalyzer.analyze("vector_add", input_size=1_000_000)
    assert facts.iterations == 1_000_000
    assert facts.estimated_operations == 1_000_000
    # 2 reads of float32 (4B) = 8MB read, 1 write = 4MB written
    assert facts.estimated_bytes_read == 8_000_000
    assert facts.estimated_bytes_written == 4_000_000
    assert facts.total_bytes_moved == 12_000_000
    assert facts.is_bandwidth_bound is True
    assert facts.arithmetic_intensity < 0.2

def test_reduction_facts():
    facts, transforms, warnings = KernelAnalyzer.analyze("reduction", input_size=2_000_000)
    assert facts.iterations == 2_000_000
    assert facts.estimated_operations == 2_000_000
    assert facts.estimated_bytes_read == 8_000_000
    # reduction scalar write is 4 bytes
    assert facts.estimated_bytes_written == 4

def test_gemv_facts():
    facts, transforms, warnings = KernelAnalyzer.analyze("gemv", input_size=1_000_000, matrix_rows=1000, matrix_cols=1000)
    assert facts.iterations == 1_000_000
    # 2 ops per element (MAC)
    assert facts.estimated_operations == 2_000_000
    tiling_transform = next((t for t in transforms if "Tiling" in t.name), None)
    assert tiling_transform is not None
    assert tiling_transform.eligible is True
