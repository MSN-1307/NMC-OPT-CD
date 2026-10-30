// Rectified Linear Unit (ReLU) Activation
// Streaming Element-wise Non-linear Operator
void relu_kernel(const float* X, float* Y, int N) {
    for (int i = 0; i < N; ++i) {
        Y[i] = (X[i] > 0.0f) ? X[i] : 0.0f;
    }
}
