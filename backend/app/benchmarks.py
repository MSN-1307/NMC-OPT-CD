from typing import List, Dict
from app.schemas import BenchmarkMetadata

BUILTIN_BENCHMARKS: Dict[str, BenchmarkMetadata] = {
    "vector_add": BenchmarkMetadata(
        id="vector_add",
        name="Vector Addition (VADD)",
        category="Streaming Element-wise",
        description="Streaming array addition C[i] = A[i] + B[i]. Highly memory bandwidth bound with arithmetic intensity 0.083 FLOP/B.",
        default_size=2_000_000,
        data_type="float32",
        element_bytes=4,
        source_code="""// Vector Addition Kernel
void vector_add(const float* A, const float* B, float* C, int N) {
    #pragma loop_bound min(100) max(10000000)
    for (int i = 0; i < N; ++i) {
        C[i] = A[i] + B[i];
    }
}""",
        matrix_supported=False,
        supported_transforms=["Vectorization", "Loop Unrolling"]
    ),
    "reduction": BenchmarkMetadata(
        id="reduction",
        name="Vector Sum Reduction",
        category="Collective / Reduction",
        description="Parallel global reduction sum += A[i]. Produces per-bank partial sums near memory and aggregates final scalar on host CPU.",
        default_size=4_000_000,
        data_type="float32",
        element_bytes=4,
        source_code="""// Vector Sum Reduction Kernel
float vector_reduction(const float* A, int N) {
    float sum = 0.0f;
    for (int i = 0; i < N; ++i) {
        sum += A[i];
    }
    return sum;
}""",
        matrix_supported=False,
        supported_transforms=["Tree Reduction", "Partial-Sum Split"]
    ),
    "relu": BenchmarkMetadata(
        id="relu",
        name="ReLU Activation",
        category="Activation / Unary",
        description="Non-linear activation Y[i] = max(0.0f, X[i]). Low arithmetic intensity; ideal candidate for loop fusion with adjacent layers.",
        default_size=2_500_000,
        data_type="float32",
        element_bytes=4,
        source_code="""// Rectified Linear Unit (ReLU)
void relu_kernel(const float* X, float* Y, int N) {
    for (int i = 0; i < N; ++i) {
        Y[i] = (X[i] > 0.0f) ? X[i] : 0.0f;
    }
}""",
        matrix_supported=False,
        supported_transforms=["Loop Fusion", "Branchless CMOV"]
    ),
    "gemv": BenchmarkMetadata(
        id="gemv",
        name="Matrix-Vector Product (GEMV)",
        category="Dense Linear Algebra",
        description="Dense matrix-vector multiplication Y[i] += A[i][j] * X[j]. Outer loop over rows N, inner reduction over cols M. Benefit from row-tiling near DRAM banks.",
        default_size=4_194_304, # e.g. 2048 x 2048
        data_type="float32",
        element_bytes=4,
        source_code="""// Matrix-Vector Multiplication (GEMV)
void gemv_kernel(const float* A, const float* X, float* Y, int N, int M) {
    for (int i = 0; i < N; ++i) {
        float sum = 0.0f;
        for (int j = 0; j < M; ++j) {
            sum += A[i * M + j] * X[j];
        }
        Y[i] = sum;
    }
}""",
        matrix_supported=True,
        supported_transforms=["Loop Tiling", "Bank Interleaving"]
    ),
    "axpy": BenchmarkMetadata(
        id="axpy",
        name="AXPY (Scaled Vector Add)",
        category="Fused Element-wise",
        description="Fused scale and vector add: Y[i] = alpha * X[i] + Y[i]. Evaluates loop fusion to reduce DRAM round-trips.",
        default_size=2_000_000,
        data_type="float32",
        element_bytes=4,
        source_code="""// Fused AXPY Kernel (alpha * X[i] + Y[i])
void axpy(float alpha, const float* X, float* Y, int N) {
    #pragma loop_bound min(100) max(16777216)
    for (int i = 0; i < N; ++i) {
        Y[i] = alpha * X[i] + Y[i];
    }
}""",
        matrix_supported=False,
        supported_transforms=["Loop Fusion", "FMA Coalescing", "Bank Striping"]
    ),
    "elementwise_mul": BenchmarkMetadata(
        id="elementwise_mul",
        name="Element-wise Vector Multiply",
        category="Streaming Element-wise",
        description="Streaming array multiplication C[i] = A[i] * B[i]. Memory bandwidth bound with arithmetic intensity 0.083 FLOP/B.",
        default_size=2_000_000,
        data_type="float32",
        element_bytes=4,
        source_code="""// Element-wise Vector Multiplication
void elementwise_mul(const float* A, const float* B, float* C, int N) {
    #pragma loop_bound min(100) max(16777216)
    for (int i = 0; i < N; ++i) {
        C[i] = A[i] * B[i];
    }
}""",
        matrix_supported=False,
        supported_transforms=["Bank Interleaving", "Vectorization"]
    ),
    "fused_scale_add": BenchmarkMetadata(
        id="fused_scale_add",
        name="AXPY / Scaled Vector Add",
        category="Fused Element-wise",
        description="Fused scale and vector add: Y[i] = alpha * X[i] + Y[i]. Evaluates loop fusion to reduce DRAM round-trips.",
        default_size=2_000_000,
        data_type="float32",
        element_bytes=4,
        source_code="""// Fused AXPY Kernel (Loop Fusion eligible)
void axpy_kernel(float alpha, const float* X, float* Y, int N) {
    for (int i = 0; i < N; ++i) {
        Y[i] = alpha * X[i] + Y[i];
    }
}""",
        matrix_supported=False,
        supported_transforms=["Loop Fusion", "FMA Coalescing"]
    )
}

def get_all_benchmarks() -> List[BenchmarkMetadata]:
    # Return unique canonical benchmarks
    seen = set()
    res = []
    for bm in BUILTIN_BENCHMARKS.values():
        if bm.id not in seen and bm.id != "fused_scale_add":
            seen.add(bm.id)
            res.append(bm)
    return res

def get_benchmark(benchmark_id: str) -> BenchmarkMetadata:
    if benchmark_id == "fused_scale_add":
        return BUILTIN_BENCHMARKS["axpy"]
    if benchmark_id in BUILTIN_BENCHMARKS:
        return BUILTIN_BENCHMARKS[benchmark_id]
    # Return vector_add as default
    return BUILTIN_BENCHMARKS["vector_add"]
