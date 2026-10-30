// Element-wise Vector Multiplication
// Streaming Array Multiplication
void elementwise_mul(const float* A, const float* B, float* C, int N) {
    #pragma loop_bound min(100) max(16777216)
    for (int i = 0; i < N; ++i) {
        C[i] = A[i] * B[i];
    }
}
