# NMC-Opt Studio: Compiler Analytical Cost Model Methodology

## 1. Project Framing
**NMC-Opt Studio** is an interactive compiler-analysis workbench designed to demonstrate how optimizing compilers make placement decisions for Near-Memory Computing (NMC) and Processing-in-Memory (PIM) architectures.

Instead of treating execution time solely as a function of arithmetic operation count, this workbench elevates **data movement** to a primary optimization objective.

---

## 2. Analytical Cost Model Formulation

To ensure dimensional consistency and transparency, all component latencies are computed in **milliseconds (ms)** using explicit first-principles formulas:

### A. Conventional CPU Execution Baseline
```
Latency_CPU = Compute_CPU + Memory_CPU
```
Where:
- $\text{Compute\_CPU} = \frac{\text{Operations}}{\text{CPU\_GFLOPS} \times 10^6}$
- $\text{Memory\_CPU} = \frac{\text{TotalBytesMoved}}{\text{CPU\_Effective\_Bandwidth\_GBps} \times 10^6}$

### B. Direct Near-Memory Computing (NMC) Offload
```
Latency_NMC = Compute_NMC + Memory_DRAM_Internal + T_HostToNMC + T_NMCToHost + T_Layout + T_Sync
```
Where:
- $\text{Compute\_NMC} = \frac{\text{Operations}}{\text{NMC\_Compute\_GFLOPS} \times 10^6}$ (using simple near-bank PIM ALUs)
- $\text{Memory\_DRAM\_Internal} = \frac{\text{TotalBytesMoved}}{\text{NMC\_DRAM\_Bank\_Bandwidth\_GBps} \times 10^6}$
- $\text{T\_HostToNMC} = \frac{\text{BytesRead}}{\text{Host\_Link\_Bandwidth\_GBps} \times 10^6} + \text{Overhead\_Launch}$
- $\text{T\_NMCToHost} = \frac{\text{BytesWritten}}{\text{Host\_Link\_Bandwidth\_GBps} \times 10^6} + \text{Overhead\_Launch}$
- $\text{T\_Layout} = \frac{\text{BytesRead} \times \alpha}{\text{Layout\_Bandwidth\_GBps} \times 10^6} + \text{Overhead\_Layout}$ (for bank-interleaved alignment)
- $\text{T\_Sync} = \text{Sync\_Events} \times \text{Sync\_Cost\_Per\_Event}$

### C. Eligible In-Memory Compiler Transformations
1. **Loop Fusion (`NMC + Loop Fusion`):**
   - Eliminates intermediate DRAM round-trips for chained element-wise kernels (e.g. ReLU, AXPY).
   - Reduces DRAM traffic by retaining values in local PIM registers.
2. **Loop Tiling (`NMC + Tiling`):**
   - Applied to multi-dimensional loops like GEMV ($N \times M$).
   - Partitions matrix rows and vectors into bank-local scratchpad/WRAM buffers (e.g. 64KB per unit) to avoid bank collisions and repeated vector broadcast overheads.

---

## 3. Academic Research Grounding

1. **IMTP: Search-based Code Generation for In-memory Tensor Programs**
   - *Yongwon Shin, Dookyung Kang, Hyojin Sung (arXiv:2412.19630, Dec 2024)*
   - Motivated compiler concerns regarding host/PIM boundary management, DRAM bank tiling, and boundary-check overheads on UPMEM DRAM-PIM.
2. **Near-Memory Computing: Past, Present, and Future**
   - *G. Singh, L. Chelini, S. Corda, et al. (Microprocessors & Microsystems, 2019)*
   - Surveys taxonomy, high internal bandwidth of 3D-stacked and 2D DRAM PIM, and analytical modeling.
3. **Computing with Near Data**
   - *X. Tang, M. T. Kandemir, H. Zhao, M. Jung, M. Karakoy (ACM SIGMETRICS PER, 2019)*
   - Explores compiler-driven recomputation to minimize host-device data movement.
