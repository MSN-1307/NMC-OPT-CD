# Project Documentation & Research Publications

This directory houses the formal technical documentation, academic manuscripts, methodology specifications, and novelty reports for **NMC-Opt Studio**.

---

## 1. Documentation Index

| Document | Format | Description |
|:---|:---:|:---|
| [**NMC-OPT-Manuscript.pdf**](./NMC-OPT-Manuscript.pdf) | PDF | **Academic Research Manuscript (Draft 2)** – Full research publication documenting motivation, compiler IR architecture, analytical cost modeling, and empirical speedups. |
| [**NMC-OPT-Manuscript-IEEE.pdf**](./NMC-OPT-Manuscript-IEEE.pdf) | PDF | **IEEE Two-Column Formatted Manuscript** – Standard conference-ready publication format. |
| [**NMC_Opt_Execution_Guide.pdf**](./NMC_Opt_Execution_Guide.pdf) | PDF | **System Execution & User Guide** – Complete operational instructions for CLI and Web Workbench. |
| [**NMC_Opt_Methodology_Document.pdf**](./NMC_Opt_Methodology_Document.pdf) | PDF | **Compiler & Hardware Methodology** – Detailed derivation of memory bus constraints, TSV bandwidth, and first-principles equations. |
| [**NMC_Opt_Novelty_Document.pdf**](./NMC_Opt_Novelty_Document.pdf) | PDF | **Novelty & Contribution Analysis** – Highlights differentiation from legacy CPU-only compilation and fixed offload heuristics. |
| [**architecture_diagram.png**](./architecture_diagram.png) | Image | **System Architecture Blueprint** – Visual diagram of C AST analysis, IR generation, and bank-level dispatch. |

---

## 2. LaTeX Source Code Package (Overleaf Compilable)

* **Location:** [`docs/NMC-OPT-Manuscript-LaTeX.zip`](./NMC-OPT-Manuscript-LaTeX.zip)
* **Status:** ✅ **Available & Verified**
* **Package Structure:**
  - `main.tex` (Root IEEE Access / Template driver)
  - `sections/` (`01_introduction.tex`, `02_related_work.tex`, `03_proposed_system.tex`, `04_results.tex`, `05_conclusion_backmatter.tex`, `06_references.tex`, `07_biographies.tex`)
  - `figures/` (Full vector & raster diagrams: `fig01` through `fig14` covering architecture, pipeline, striping, roofline, breakdowns)
  - `logo/` & `photos/` (IEEE logos and author biography assets)
* **Compilation:** Directly importable into [Overleaf](https://www.overleaf.com/) or local TeX Live/MiKTeX distribution (`pdflatex main.tex`).

---

## 3. Demo Video Reference

* **Duration:** 4 to 7 minutes
* **Demonstration Coverage:**
  1. Live C code ingestion and AST loop analysis
  2. Multi-tier cost model evaluation and roofline placement
  3. Interactive 3D DRAM memory vault visualization
  4. Sensitivity analysis and CLI pipeline execution
* **Video Link:** *[Insert Video URL upon publication / submission]*
