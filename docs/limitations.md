# Limitations and Scope Disclosure

## 1. Educational Simulator Scope
NMC-Opt Studio is an educational, analytical compiler optimization simulator. It does **not** claim to be a cycle-accurate hardware emulator (such as gem5-PIM) or a full production DRAM-PIM toolchain (such as the proprietary UPMEM LLVM backend).

## 2. Key Limitations
- **Analytical Approximation:** Execution latencies and bandwidth saturation curves are derived from first-principles analytical formulas. Physical DRAM microarchitectural effects (refresh cycles, row-buffer conflicts, temperature throttling) are abstracted into effective bandwidth parameters.
- **Interconnect Assumptions:** Interconnect contention (PCIe Gen5/CXL) is represented through configurable effective bandwidth and DMA dispatch overhead constants.
- **Language Subset:** The workbench analyzes a documented subset of canonical C loops. It deliberately does not accept arbitrary pointer arithmetic, recursive functions, or dynamic heap structures.
- **Simulated vs. Measured Results:** All speedup numbers and millisecond metrics produced by the workbench are analytical model estimates, not physical hardware measurements.
- **Transformation Legality:** Compiler transformations (such as loop fusion or tiling) are strictly guarded by legality checks and are marked ineligible when dependency constraints are violated.
