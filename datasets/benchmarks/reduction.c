// Vector Sum Reduction Kernel
// Collective Reduction with Host Aggregation
float vector_reduction(const float* A, int N) {
    float sum = 0.0f;
    for (int i = 0; i < N; ++i) {
        sum += A[i];
    }
    return sum;
}
