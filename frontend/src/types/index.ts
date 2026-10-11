export interface CostModelParameters {
  cpu_compute_gflops: number;
  cpu_effective_bandwidth_gbps: number;
  nmc_compute_gflops: number;
  nmc_effective_bandwidth_gbps: number;
  host_to_nmc_overhead_ms: number;
  nmc_to_host_overhead_ms: number;
  host_link_bandwidth_gbps: number;
  layout_conversion_overhead_ms: number;
  layout_conversion_bandwidth_gbps: number;
  synchronization_overhead_ms: number;
  sync_events: number;
}

export interface BenchmarkMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  default_size: number;
  data_type: string;
  element_bytes: number;
  source_code: string;
  matrix_supported: boolean;
  supported_transforms: string[];
}

export interface KernelAnalysisFacts {
  loop_bounds: string;
  iterations: number;
  estimated_operations: number;
  estimated_bytes_read: number;
  estimated_bytes_written: number;
  total_bytes_moved: number;
  arithmetic_intensity: number;
  memory_access_pattern: string;
  reuse_factor: number;
  is_bandwidth_bound: boolean;
  data_type: string;
  element_bytes: number;
}

export interface IRInstruction {
  line: number;
  label?: string | null;
  opcode: string;
  operands: string;
  comment: string;
}

export interface TransformationEligibility {
  name: string;
  eligible: boolean;
  reason: string;
  potential_benefit: string;
}

export interface CostBreakdown {
  compute_ms: number;
  memory_or_transfer_ms: number;
  layout_conversion_ms: number;
  synchronization_ms: number;
  overhead_ms: number;
}

export interface CandidateStrategy {
  strategy: string;
  valid: boolean;
  invalidation_reason?: string | null;
  estimated_total_ms: number;
  speedup_vs_cpu: number;
  components_ms: CostBreakdown;
  dominant_factor: string;
  notes: string;
}

export interface StrategyRecommendation {
  strategy: string;
  estimated_cost_ms: number;
  speedup_vs_cpu: number;
  reason: string;
  key_tradeoffs: string[];
}

export interface ChartSeriesItem {
  input_size: number;
  cpu_ms: number;
  nmc_ms: number;
  transformed_ms?: number | null;
}

export interface SensitivityItem {
  bandwidth_gbps: number;
  cpu_ms: number;
  nmc_ms: number;
}

export interface AnalysisRequest {
  benchmark_id: string;
  input_size: number;
  matrix_rows?: number | null;
  matrix_cols?: number | null;
  custom_source?: string | null;
  parameters: CostModelParameters;
}

export interface AnalysisResponse {
  kernel_id: string;
  kernel_name: string;
  source_code: string;
  analysis: KernelAnalysisFacts;
  simplified_ir: IRInstruction[];
  ir_text: string;
  transformations: TransformationEligibility[];
  candidates: CandidateStrategy[];
  recommendation: StrategyRecommendation;
  chart_scaling: ChartSeriesItem[];
  chart_sensitivity: SensitivityItem[];
  crossover_elements?: number | null;
  crossover_point_label?: string | null;
  assumptions: string[];
  warnings: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'Student' | 'Researcher' | 'Faculty';
  avatarInitials: string;
  isLoggedIn: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface StrategyCostItem {
  strategy: string;
  compute_ms: number;
  transfer_ms: number;
  layout_ms: number;
  sync_ms: number;
  total_ms: number;
}

export interface KernelBreakdownResult {
  kernel_id: string;
  kernel_name: string;
  strategies: StrategyCostItem[];
}

export interface KernelSpeedupResult {
  kernel_id: string;
  kernel_name: string;
  chosen_strategy: string;
  speedup_vs_cpu: number;
  speedup_vs_naive_nmc: number;
  cpu_ms: number;
  naive_nmc_ms: number;
  chosen_ms: number;
}

export interface CrossoverPoint {
  n: number;
  n_label: string;
  cpu_ms: number;
  nmc_ms: number;
  nmc_transform_ms: number;
  chosen: string;
}

export interface KernelCrossoverResult {
  kernel_id: string;
  kernel_name: string;
  points: CrossoverPoint[];
}

export interface DecisionMapPoint {
  kernel_id: string;
  kernel_name: string;
  n: number;
  n_label: string;
  chosen_strategy: string;
  speedup_vs_cpu: number;
}

export interface ResearchKernelMetadata {
  id: string;
  name: string;
  category: string;
  source_code: string;
  arithmetic_intensity: number;
  primary_reason: string;
  crossover_n_label: string;
}

export interface ResearchGraphsRequest {
  parameters?: CostModelParameters;
  breakdown_n?: number;
  speedup_n?: number;
  sizes?: number[];
}

export interface Fig4aItem {
  tile_size: number;
  kernel_latency_ms: number;
  is_optimal: boolean;
}

export interface Fig4bItem {
  tile_shape: string;
  h2d_ms: number;
  kernel_ms: number;
  d2h_ms: number;
  host_reduction_ms: number;
  total_ms: number;
  is_optimal: boolean;
}

export interface Fig4cItem {
  dpu_count: number;
  tile_shape: string;
  h2d_ms: number;
  kernel_ms: number;
  d2h_ms: number;
  host_reduction_ms: number;
  total_ms: number;
  is_optimal: boolean;
}

export interface Fig9Item {
  op_id: string;
  op_name: string;
  elements: number;
  prim: number;
  prim_e: number;
  prim_search: number;
  simple_pim?: number | null;
  imtp: number;
  h2d_ratio: number;
  kernel_ratio: number;
  after_kernel_ratio: number;
}

export interface Fig10Item {
  op_type: string;
  model: string;
  config_label: string;
  prim: number;
  prim_search: number;
  imtp: number;
}

export interface Fig11Point {
  spatial_dim: number;
  speedup_vs_prim: number;
  speedup_vs_prim_search: number;
}

export interface IMTPSuiteResponse {
  fig4a_caching_tiles: Fig4aItem[];
  fig4b_gemv_tiling: Fig4bItem[];
  fig4c_gemv_512: Fig4cItem[];
  fig4c_gemv_8192: Fig4cItem[];
  fig9a_tensor_4mb: Fig9Item[];
  fig9b_tensor_256mb: Fig9Item[];
  fig10a_gptj_mtv: Fig10Item[];
  fig10b_gptj_mmtv: Fig10Item[];
  fig11_mmtv_scatter: Fig11Point[];
}

export interface ResearchGraphsResponse {
  parameters: CostModelParameters;
  breakdown_n: number;
  speedup_n: number;
  sizes: number[];
  size_labels: string[];
  kernels: ResearchKernelMetadata[];
  cost_breakdown: KernelBreakdownResult[];
  speedup_comparison: KernelSpeedupResult[];
  crossover_curves: KernelCrossoverResult[];
  decision_map: DecisionMapPoint[];
  executive_summary: string;
  architectural_reasons: Record<string, string>;
  imtp_suite?: IMTPSuiteResponse;
}

