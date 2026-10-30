# Datasets & Computational Kernels

This directory contains the computational C benchmark kernels, synthetic workload generation utilities, and preprocessing specifications utilized by **NMC-Opt Studio**.

---

## 1. Directory Structure

```
datasets/
|-- benchmarks/
|   |-- vector_add.c         # Streaming element-wise vector addition (A + B = C)
|   |-- gemv.c               # Dense Matrix-Vector product (A * X = Y)
|   |-- relu.c               # Non-linear activation (max(0, X))
|   |-- axpy.c               # Fused scale-and-add (alpha * X + Y)
|   |-- reduction.c          # Parallel global sum reduction
|   `-- elementwise_mul.c    # Streaming element-wise multiplication (A * B = C)
|-- generate_datasets.py     # Synthetic dataset generator for physical array testing
`-- README.md                # Dataset & kernel documentation
```

---

## 2. Kernel Characteristics & Operational Intensity

| Kernel ID | Computational Complexity | Memory Footprint (Float32) | Arithmetic Intensity (FLOP/Byte) | Classification | Optimal Placement |
|:---|:---|:---|:---|:---|:---|
| `vector_add` | $O(N)$ (1 FLOP/elem) | $3 \times 4N$ bytes | **0.083** | Strongly Bandwidth-Bound | **Near-Memory (NMC)** |
| `elementwise_mul`| $O(N)$ (1 FLOP/elem) | $3 \times 4N$ bytes | **0.083** | Strongly Bandwidth-Bound | **Near-Memory (NMC)** |
| `relu` | $O(N)$ (1 FLOP/elem) | $2 \times 4N$ bytes | **0.125** | Strongly Bandwidth-Bound | **Near-Memory (NMC)** |
| `axpy` | $O(N)$ (2 FLOP/elem) | $3 \times 4N$ bytes | **0.167** | Bandwidth-Bound | **Near-Memory (NMC)** |
| `reduction` | $O(N)$ (1 FLOP/elem) | $1 \times 4N$ bytes | **0.250** | Collective Bound | **Hybrid Split** |
| `gemv` | $O(N \cdot M)$ (2 FLOP/elem) | $(N \cdot M + M + N) \times 4$ | **0.500** | Structured Reuse | **NMC + Loop Tiling** |

---

## 3. Preprocessing & Synthetic Generation

To generate raw binary memory buffers for trace simulation or native memory throughput experiments:

```bash
# Generate 1,000,000-element vectors and 2048x2048 matrix
python datasets/generate_datasets.py --scale 1000000 --rows 2048 --cols 2048
```

This populates `datasets/generated/` with:
- `input_vector_A_1000000.bin` (4.0 MB)
- `input_vector_B_1000000.bin` (4.0 MB)
- `input_matrix_GEMV_2048x2048.bin` (16.0 MB)

---

## 4. Evaluating with the Compiler Engine

Any kernel from `datasets/benchmarks/` can be analyzed directly via the CLI:

```bash
# Evaluate custom vector_add kernel at 2M element scale
python backend/cli.py --custom datasets/benchmarks/vector_add.c --size 2000000

# Evaluate custom GEMV kernel with 2048x2048 dimensions
python backend/cli.py --custom datasets/benchmarks/gemv.c --rows 2048 --cols 2048
```
