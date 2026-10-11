import { CostModelParameters, BenchmarkMetadata } from '../types';

export const DEFAULT_PARAMETERS: CostModelParameters = {
  cpu_compute_gflops: 45.0,
  cpu_effective_bandwidth_gbps: 28.0,
  nmc_compute_gflops: 32.0,
  nmc_effective_bandwidth_gbps: 160.0,
  host_to_nmc_overhead_ms: 0.02,
  nmc_to_host_overhead_ms: 0.02,
  host_link_bandwidth_gbps: 64.0,
  layout_conversion_overhead_ms: 0.02,
  layout_conversion_bandwidth_gbps: 48.0,
  synchronization_overhead_ms: 0.01,
  sync_events: 1,
};

export const FALLBACK_BENCHMARKS: BenchmarkMetadata[] = [
  {
    id: 'vector_add',
    name: 'Vector Addition (VADD)',
    category: 'Streaming Element-wise',
    description: 'Streaming array addition C[i] = A[i] + B[i]. Highly memory bandwidth bound with arithmetic intensity 0.083 FLOP/B.',
    default_size: 2000000,
    data_type: 'float32',
    element_bytes: 4,
    source_code: `// Vector Addition Kernel
void vector_add(const float* A, const float* B, float* C, int N) {
    #pragma loop_bound min(100) max(10000000)
    for (int i = 0; i < N; ++i) {
        C[i] = A[i] + B[i];
    }
}`,
    matrix_supported: false,
    supported_transforms: ['Vectorization', 'Loop Unrolling'],
  },
  {
    id: 'reduction',
    name: 'Vector Sum Reduction',
    category: 'Collective / Reduction',
    description: 'Parallel global reduction sum += A[i]. Produces per-bank partial sums near memory and aggregates final scalar on host CPU.',
    default_size: 4000000,
    data_type: 'float32',
    element_bytes: 4,
    source_code: `// Vector Sum Reduction Kernel
float vector_reduction(const float* A, int N) {
    float sum = 0.0f;
    for (int i = 0; i < N; ++i) {
        sum += A[i];
    }
    return sum;
}`,
    matrix_supported: false,
    supported_transforms: ['Tree Reduction', 'Partial-Sum Split'],
  },
  {
    id: 'relu',
    name: 'ReLU Activation',
    category: 'Activation / Unary',
    description: 'Non-linear activation Y[i] = max(0.0f, X[i]). Low arithmetic intensity; ideal candidate for loop fusion with adjacent layers.',
    default_size: 2500000,
    data_type: 'float32',
    element_bytes: 4,
    source_code: `// Rectified Linear Unit (ReLU)
void relu_kernel(const float* X, float* Y, int N) {
    for (int i = 0; i < N; ++i) {
        Y[i] = (X[i] > 0.0f) ? X[i] : 0.0f;
    }
}`,
    matrix_supported: false,
    supported_transforms: ['Loop Fusion', 'Branchless CMOV'],
  },
  {
    id: 'gemv',
    name: 'Matrix-Vector Product (GEMV)',
    category: 'Dense Linear Algebra',
    description: 'Dense matrix-vector multiplication Y[i] += A[i][j] * X[j]. Outer loop over rows N, inner reduction over cols M. Benefit from row-tiling near DRAM banks.',
    default_size: 4194304,
    data_type: 'float32',
    element_bytes: 4,
    source_code: `// Matrix-Vector Multiplication (GEMV)
void gemv_kernel(const float* A, const float* X, float* Y, int N, int M) {
    for (int i = 0; i < N; ++i) {
        float sum = 0.0f;
        for (int j = 0; j < M; ++j) {
            sum += A[i * M + j] * X[j];
        }
        Y[i] = sum;
    }
}`,
    matrix_supported: true,
    supported_transforms: ['Loop Tiling', 'Bank Interleaving'],
  },
  {
    id: 'fused_scale_add',
    name: 'AXPY / Scaled Vector Add',
    category: 'Fused Element-wise',
    description: 'Fused scale and vector add: Y[i] = alpha * X[i] + Y[i]. Evaluates loop fusion to reduce DRAM round-trips.',
    default_size: 2000000,
    data_type: 'float32',
    element_bytes: 4,
    source_code: `// Fused AXPY Kernel (Loop Fusion eligible)
void axpy_kernel(float alpha, const float* X, float* Y, int N) {
    for (int i = 0; i < N; ++i) {
        Y[i] = alpha * X[i] + Y[i];
    }
}`,
    matrix_supported: false,
    supported_transforms: ['Loop Fusion', 'FMA Coalescing'],
  },
];
