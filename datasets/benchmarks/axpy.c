// Fused AXPY Kernel (alpha * X[i] + Y[i])
// Fused Scale and Vector Add
void axpy(float alpha, const float* X, float* Y, int N) {
    #pragma loop_bound min(100) max(16777216)
    for (int i = 0; i < N; ++i) {
        Y[i] = alpha * X[i] + Y[i];
    }
}
