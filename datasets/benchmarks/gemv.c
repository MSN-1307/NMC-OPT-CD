// Dense Matrix-Vector Multiplication (GEMV)
// 2D Loop Nest: AI ~ 0.5 FLOP/Byte; amenable to bank-level row tiling
void gemv_kernel(const float* A, const float* X, float* Y, int N, int M) {
    for (int i = 0; i < N; ++i) {
        float sum = 0.0f;
        for (int j = 0; j < M; ++j) {
            sum += A[i * M + j] * X[j];
        }
        Y[i] = sum;
    }
}
