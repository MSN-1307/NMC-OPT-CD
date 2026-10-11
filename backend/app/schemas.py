from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CostModelParameters(BaseModel):
    cpu_compute_gflops: float = Field(default=45.0, description="CPU peak/effective compute throughput in GFLOPS", ge=1.0)
    cpu_effective_bandwidth_gbps: float = Field(default=28.0, description="CPU host memory effective streaming bandwidth in GB/s", ge=1.0)
    nmc_compute_gflops: float = Field(default=32.0, description="Near-Memory compute throughput in GFLOPS (across PIM units)", ge=1.0)
    nmc_effective_bandwidth_gbps: float = Field(default=160.0, description="Internal NMC DRAM bank aggregate bandwidth in GB/s", ge=1.0)
    host_to_nmc_overhead_ms: float = Field(default=0.02, description="Host-to-NMC transfer setup & DMA dispatch overhead in ms", ge=0.0)
    nmc_to_host_overhead_ms: float = Field(default=0.02, description="NMC-to-Host transfer setup & DMA dispatch overhead in ms", ge=0.0)
    host_link_bandwidth_gbps: float = Field(default=64.0, description="PCIe Gen5 / CXL link bandwidth between host CPU and NMC module in GB/s", ge=1.0)
    layout_conversion_overhead_ms: float = Field(default=0.02, description="Data layout rearrangement kernel launch overhead in ms", ge=0.0)
    layout_conversion_bandwidth_gbps: float = Field(default=48.0, description="Bandwidth for strided-to-bank-interleaved layout conversion in GB/s", ge=1.0)
    synchronization_overhead_ms: float = Field(default=0.01, description="Synchronization barrier overhead in ms per event", ge=0.0)
    sync_events: int = Field(default=1, description="Number of synchronization points required", ge=1)

class BenchmarkMetadata(BaseModel):
    id: str
    name: str
    category: str
    description: str
    default_size: int
    data_type: str = "float32"
    element_bytes: int = 4
    source_code: str
    matrix_supported: bool = False
    supported_transforms: List[str]

class KernelAnalysisFacts(BaseModel):
    loop_bounds: str
    iterations: int
    estimated_operations: int
    estimated_bytes_read: int
    estimated_bytes_written: int
    total_bytes_moved: int
    arithmetic_intensity: float  # FLOPs per Byte
    memory_access_pattern: str   # Streaming / Strided / Matrix-Row
    reuse_factor: float          # average read reuse
    is_bandwidth_bound: bool
    data_type: str
    element_bytes: int

class IRInstruction(BaseModel):
    line: int
    label: Optional[str] = None
    opcode: str
    operands: str
    comment: str

class TransformationEligibility(BaseModel):
    name: str
    eligible: bool
    reason: str
    potential_benefit: str

class CostBreakdown(BaseModel):
    compute_ms: float
    memory_or_transfer_ms: float
    layout_conversion_ms: float
    synchronization_ms: float
    overhead_ms: float

class CandidateStrategy(BaseModel):
    strategy: str
    valid: bool
    invalidation_reason: Optional[str] = None
    estimated_total_ms: float
    speedup_vs_cpu: float
    components_ms: CostBreakdown
    dominant_factor: str
    notes: str

class StrategyRecommendation(BaseModel):
    strategy: str
    estimated_cost_ms: float
    speedup_vs_cpu: float
    reason: str
    key_tradeoffs: List[str]

class ChartSeriesItem(BaseModel):
    input_size: int
    cpu_ms: float
    nmc_ms: float
    transformed_ms: Optional[float] = None

class SensitivityItem(BaseModel):
    bandwidth_gbps: float
    cpu_ms: float
    nmc_ms: float

class AnalysisRequest(BaseModel):
    benchmark_id: str
    input_size: int = Field(..., ge=100, le=100_000_000)
    matrix_rows: Optional[int] = Field(default=None, ge=4, le=65536)
    matrix_cols: Optional[int] = Field(default=None, ge=4, le=65536)
    custom_source: Optional[str] = None
    parameters: CostModelParameters = Field(default_factory=CostModelParameters)

class AnalysisResponse(BaseModel):
    kernel_id: str
    kernel_name: str
    source_code: str
    analysis: KernelAnalysisFacts
    simplified_ir: List[IRInstruction]
    ir_text: str
    transformations: List[TransformationEligibility]
    candidates: List[CandidateStrategy]
    recommendation: StrategyRecommendation
    chart_scaling: List[ChartSeriesItem]
    chart_sensitivity: List[SensitivityItem]
    crossover_elements: Optional[int] = None
    crossover_point_label: Optional[str] = None
    assumptions: List[str]
    warnings: List[str]

class ChatRequest(BaseModel):
    message: str
    kernel_id: Optional[str] = "vector_add"
    kernel_name: Optional[str] = None
    input_size: Optional[int] = 2_000_000
    source_code: Optional[str] = None
    recommendation: Optional[str] = None
    speedup_vs_cpu: Optional[float] = None
    estimated_cost_ms: Optional[float] = None
    arithmetic_intensity: Optional[float] = None
    is_bandwidth_bound: Optional[bool] = None
    loop_bounds: Optional[str] = None
    memory_access_pattern: Optional[str] = None
    total_bytes_moved: Optional[int] = None
    estimated_operations: Optional[int] = None
    crossover_elements: Optional[int] = None
    dominant_factor: Optional[str] = None
    transformations: Optional[List[dict]] = None
    candidates: Optional[List[dict]] = None
    parameters: Optional[CostModelParameters] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []

# ==============================================================================
# Research Paper Graphs Evaluation Schemas
# ==============================================================================

class StrategyCostItem(BaseModel):
    strategy: str  # "CPU", "NMC", "NMC + transform"
    compute_ms: float
    transfer_ms: float
    layout_ms: float
    sync_ms: float
    total_ms: float

class KernelBreakdownResult(BaseModel):
    kernel_id: str
    kernel_name: str
    strategies: List[StrategyCostItem]

class KernelSpeedupResult(BaseModel):
    kernel_id: str
    kernel_name: str
    chosen_strategy: str
    speedup_vs_cpu: float
    speedup_vs_naive_nmc: float
    cpu_ms: float
    naive_nmc_ms: float
    chosen_ms: float

class CrossoverPoint(BaseModel):
    n: int
    n_label: str
    cpu_ms: float
    nmc_ms: float
    nmc_transform_ms: float
    chosen: str

class KernelCrossoverResult(BaseModel):
    kernel_id: str
    kernel_name: str
    points: List[CrossoverPoint]

class DecisionMapPoint(BaseModel):
    kernel_id: str
    kernel_name: str
    n: int
    n_label: str
    chosen_strategy: str  # "CPU", "NMC", "NMC + transform"
    speedup_vs_cpu: float

class ResearchGraphsRequest(BaseModel):
    parameters: Optional[CostModelParameters] = None
    breakdown_n: int = 4_194_304   # 2^22 elements
    speedup_n: int = 16_777_216    # 2^24 elements
    sizes: Optional[List[int]] = None

class ResearchKernelMetadata(BaseModel):
    id: str
    name: str
    category: str
    source_code: str
    arithmetic_intensity: float
    primary_reason: str
    crossover_n_label: str

class Fig4aItem(BaseModel):
    tile_size: int
    kernel_latency_ms: float
    is_optimal: bool = False

class Fig4bItem(BaseModel):
    tile_shape: str
    h2d_ms: float
    kernel_ms: float
    d2h_ms: float
    host_reduction_ms: float
    total_ms: float
    is_optimal: bool = False

class Fig4cItem(BaseModel):
    dpu_count: int
    tile_shape: str
    h2d_ms: float
    kernel_ms: float
    d2h_ms: float
    host_reduction_ms: float
    total_ms: float
    is_optimal: bool = False

class Fig9Item(BaseModel):
    op_id: str
    op_name: str
    elements: int
    prim: float = 1.0
    prim_e: float
    prim_search: float
    simple_pim: Optional[float] = None
    imtp: float
    h2d_ratio: float = 0.15
    kernel_ratio: float = 0.70
    after_kernel_ratio: float = 0.15

class Fig10Item(BaseModel):
    op_type: str  # "MTV" or "MMTV"
    model: str    # "GPT-J 6B" or "GPT-J 30B"
    config_label: str
    prim: float = 1.0
    prim_search: float
    imtp: float

class Fig11Point(BaseModel):
    spatial_dim: int
    speedup_vs_prim: float
    speedup_vs_prim_search: float

class IMTPSuiteResponse(BaseModel):
    fig4a_caching_tiles: List[Fig4aItem]
    fig4b_gemv_tiling: List[Fig4bItem]
    fig4c_gemv_512: List[Fig4cItem]
    fig4c_gemv_8192: List[Fig4cItem]
    fig9a_tensor_4mb: List[Fig9Item]
    fig9b_tensor_256mb: List[Fig9Item]
    fig10a_gptj_mtv: List[Fig10Item]
    fig10b_gptj_mmtv: List[Fig10Item]
    fig11_mmtv_scatter: List[Fig11Point]

class ResearchGraphsResponse(BaseModel):
    parameters: CostModelParameters
    breakdown_n: int
    speedup_n: int
    sizes: List[int]
    size_labels: List[str]
    kernels: List[ResearchKernelMetadata]
    cost_breakdown: List[KernelBreakdownResult]
    speedup_comparison: List[KernelSpeedupResult]
    crossover_curves: List[KernelCrossoverResult]
    decision_map: List[DecisionMapPoint]
    executive_summary: str
    architectural_reasons: Dict[str, str]
    imtp_suite: Optional[IMTPSuiteResponse] = None

