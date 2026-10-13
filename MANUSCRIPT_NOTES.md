# NMC-Opt Studio Manuscript: Notes & Revision Guide

**Deliverable:** Publication-Quality, Editable Microsoft Word Manuscript  
**Final Document Location:** `D:\SEM 5\CD LAB\NMC-OPT\NMC_Opt_Studio_Manuscript.docx`  
**Secondary Location:** `D:\SEM 5\CD LAB\NMC-OPT\docs\NMC_Opt_Studio_Manuscript.docx`  
**Project Repository:** [https://github.com/MSN-1307/NMC-OPT-CD](https://github.com/MSN-1307/NMC-OPT-CD)  

---

## 1. Summary of Major Technical Corrections Made to the Rough Manuscript

In accordance with academic rigor, compiler design syllabus requirements, and repository reality, the following major technical corrections and improvements were made:

| # | Rough Manuscript Flaw / Gap | Correction in Final Word Manuscript (`.docx`) | Rationale / Grounding |
| :-: | :--- | :--- | :--- |
| **1** | **Scope Framing as Computer Architecture**<br>The rough draft framed the paper largely as a hardware/computer architecture study with standalone DRAM die topics. | **Strictly Focused on Compiler Design**<br>Re-anchored all discussions to compiler intermediate representations, static loop analysis, data-movement-aware cost modeling, transformation legality, and target selection. | Architecture topics are discussed solely where necessary to explain the compiler's target selection problem and cost model. |
| **2** | **Overstated System Capabilities**<br>The rough draft claimed the software is a production compiler generating physical LLVM machine code and physical UPMEM binaries. | **Honest System Characterization**<br>Accurately characterizes NMC-Opt Studio as an interactive, educational compiler analysis workbench and analytical cost-modeling testbed. | Code audit confirms the repository implements an analytical cost model and instructional SSA-like IR generator without a real LLVM backend. |
| **3** | **Unverified Hardware Measurements**<br>The rough draft presented simulated cycle-accurate latencies ($1.26\times$–$1.66\times$ speedup, $79.5\%$ energy savings) as empirical findings. | **Formal Result Placeholders**<br>Replaced fabricated experimental findings with formal, professionally formatted result placeholders (`Table 2`, `Figure 7` to `Figure 10`). | Preserves academic integrity. Specifies exact independent/dependent variables and protocols for future hardware testing. |
| **4** | **Accurate Integration of CAIRO & IMTP**<br>The rough draft conflated CAIRO and IMTP with our repository code. | **Accurate Citation & Distinction**<br>Accurately characterizes CAIRO (Hadidi et al., 2017) as an instruction-level atomic offloader and IMTP (Shin et al., 2024) as a TVM search-based tensor compiler, demonstrating our distinct workbench contribution. | Both papers are cited accurately according to their true contributions without exaggerating our codebase. |
| **5** | **Author & Submission Placeholders**<br>The rough draft omitted editable author blocks or used static names. | **Editable Author Placeholders**<br>Inserted standard academic placeholders (`[Author Name(s)]`, `[Department/Institution]`, `[Email]`, `[Guide/Supervisor]`, `[Date]`). | Enables the student to easily personalize the draft before submission. |
| **6** | **Template Compliance**<br>The rough draft had inconsistent section lengths. | **Strict Template Compliance**<br>Matched all specified line counts in the Abstract and Conclusion, included minimum 5 diagrams, 6 equations, 2 algorithms, 1 parameter table, and 30 verified references (2018–2024). | Satisfies all constraints from the professor's 3-page manuscript template. |

---

## 2. Checklist of Evidence and Figures to Supply Later

When physical hardware testing (e.g., on real UPMEM PIM-DIMMs or cycle-accurate MacSim/SST simulators) is conducted, replace the corresponding placeholders in the `.docx` file:

### A. Author and Submission Block
- [ ] Replace `[Author Name(s) — To be inserted]` with your full name(s) and student ID(s).
- [ ] Replace `[Department of Computer Science and Engineering, Institution Name]` with your university details.
- [ ] Replace `[Email Address(es)]` with your academic email.
- [ ] Replace `[Under the Guidance of: Supervisor / Professor Name]` with your faculty guide's name.

### B. Experimental Results & Data Placeholders
- [ ] **Table 2 Placeholder:**  
  *Measured Execution Latencies and Speedups Across Physical Hardware Testbed*  
  - Measure execution latency of CPU baseline (with OpenMP & AVX-512) and PIM execution across $N = 10^4, 10^5, 10^6, 10^7$ on physical hardware.  
  - Compute empirical speedup and replace placeholder with final numeric table.
- [ ] **Figure 7 Placeholder:**  
  *Hardware Execution Time Scaling vs Analytical Cost Model Predictions*  
  - Plot measured execution time (scatter points) against analytical model lines for Vector Add and GEMV to demonstrate model accuracy.
- [ ] **Figure 8 Placeholder:**  
  *Empirical Memory Bus Traffic and Subsystem Energy Consumption*  
  - Collect memory counter data (e.g., via Intel PCM or hardware power probes) showing off-chip bus traffic and energy savings.
- [ ] **Figure 9 Placeholder:**  
  *Measured Workload Crossover Thresholds vs Closed-Form Cost Model Predictions*  
  - Measure empirical crossover points for kernels with varying arithmetic intensity and compare against Equation 6 predictions.
- [ ] **Figure 10 Placeholder:**  
  *Hardware Sensitivity to Interconnect Link Bandwidth Variations*  
  - Evaluate speedup across varying link bandwidths (PCIe Gen3, Gen4, Gen5) and plot sensitivity curves.

---

## 3. Verified Repository Features Documented in Manuscript

1. **Frontend (`frontend/src/`):**
   - React 18, Vite, TypeScript, TailwindCSS, Recharts.
   - Interactive views: `WorkbenchView`, `AnalyticsView`, `PipelineView`, `MemoryLayoutView`, `BenchmarkSuiteView`, `MethodologyView`, and `ChatView` (Compiler Copilot).
2. **Backend (`backend/app/`):**
   - Python 3.12, FastAPI, Pydantic.
   - `analyzer.py`: Ingests C-like loops via regular expression matching, extracts iterations, arithmetic operations, array reads/writes, and evaluates transformation legality.
   - `ir.py`: Synthesizes simplified SSA-like three-address code with basic blocks (`entry`, `loop.cond`, `loop.body`, `loop.inc`, `exit`), phi nodes, and memory pointers (`gep`).
   - `cost_model.py`: Implements first-principles equations for CPU compute, host DDR memory, NMC compute, internal DRAM bank access, PCIe link transfer, layout conversion, and synchronization.
   - `optimizer.py`: Coordinates the compiler pipeline, ranks strategies, and calculates closed-form crossover thresholds.
