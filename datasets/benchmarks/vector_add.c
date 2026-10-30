// Vector Addition Kernel (Streaming Element-wise)
// Memory Bandwidth Bound: AI = 0.083 FLOP/Byte
void vector_add(const float* A, const float* B, float* C, int N) {
    #pragma loop_bound min(100) max(10000000)
    for (int i = 0; i < N; ++i) {
        C[i] = A[i] + B[i];
    }
}
