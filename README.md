# NMC-Opt Studio: An Adaptive Data-Movement-Aware Compiler Optimization Workbench

> **Compiler Design / Near-Memory Computing (NMC) Educational Simulator**  
> An interactive workbench demonstrating how an optimizing compiler evaluates conventional CPU execution versus Near-Memory Computing (NMC / PIM) by treating data movement as a first-class optimization metric.

---

## Key Features

1. **Home Navigation Hub (`HomeView`):**
   - High-impact landing page guiding you to all modules, quick-start workflow, and educational explainers on the "Memory Wall".
2. **Optimization Workbench (`WorkbenchView`):**
   - Real-time kernel analysis on 5 built-in benchmarks (Vector Add, Reduction, ReLU, GEMV, Fused AXPY) plus custom loop analysis.
   - Dynamic problem dimension tuning (scale slider up to 10M elements, matrix $N \times M$ controls).
   - Executive compiler decision engine displaying recommended target, speedup factor, and key architectural tradeoffs.
3. **Custom C Kernel File Upload (`FileUploadModal`):**
   - Drag-and-drop or browse `.c`, `.cpp`, `.h`, `.txt` loop files.
   - Pre-loaded sample templates (1D Stencil, AXPY, Dot Product) with instant AST loop analysis.
4. **Dedicated Analytics & Interactive Graphs (`AnalyticsView`):**
   - **Strategy Latency Comparison:** Multi-target execution time comparison with component tooltips.
   - **Problem Size Scaling & Crossover:** Identifies exact workload scale where NMC surpasses CPU performance.
   - **Component Cost Breakdown:** Stacked visualization separating computation from PCIe link transfer, layout rearrangement, and synchronization.
   - **Internal DRAM Bandwidth Sensitivity:** Analyzes crossover shift as internal DRAM bank bandwidth varies from 30 to 260 GB/s.
5. **Interactive Project Execution & CLI Guide (`ExecutionGuideView`):**
   - Live status cards for FastAPI (`http://localhost:8008`) and Vite (`http://localhost:5173`).
   - Copyable Windows PowerShell startup commands.
   - Built-in interactive browser CLI diagnostics sandbox for running test pings, pytest simulations, and CLI analyzes.
6. **Compiler Copilot & AI Chat (`ChatView`):**
   - Context-aware compiler assistant that answers questions on PIM concepts, Arithmetic Intensity, the IMTP paper, DRAM bank interleaving, and why CPU won vs NMC for your active kernel.
7. **7-Stage Compiler Decision Pipeline (`PipelineView`):**
   - Inspect every compiler phase: `Source Code` ➔ `Validation` ➔ `Loop/Memory Analysis` ➔ `Simplified SSA IR` ➔ `Cost Modeling` ➔ `Strategy Evaluation` ➔ `Recommendation`.
   - Complete SSA Intermediate Representation (IR) table with line numbers, opcodes, operands, and compiler notes.
8. **Interactive Memory Movement & Bank Layout Simulator (`MemoryLayoutView`):**
   - Conceptual step-by-step interactive simulator with Auto-Play, Step, and Reset controls.
   - Visualizes Host DDR RAM, PCIe/CXL link packets, Bank-Interleaving layout transformation, and 8 parallel in-DRAM PIM bank ALUs.
9. **Authentication & Profile Management (`LoginModal`):**
   - 1-click demo profiles (Student Alex Chen, Researcher Dr. Priya Nair, Faculty Prof. Miller) and custom sign-in with persistent `localStorage` session state.
10. **Light & Dark Mode Support:**
    - Seamless toggle between clean daylight theme and sleek dark mode across all charts, cards, and navigation.

---

## Getting Started on Windows

### Prerequisites
- **Python 3.10+** (Python 3.14+ supported)
- **Node.js 18+** (Node.js 24+ supported) with `npm`

---

### Step 1: Start the Backend (FastAPI)

Open PowerShell:

```powershell
cd "d:\SEM 5\CD LAB\NMC-OPT\backend"
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload
```

- API Docs: [http://localhost:8008/docs](http://localhost:8008/docs)
- Health Check: [http://localhost:8008/api/health](http://localhost:8008/api/health)

---

### Step 2: Start the Frontend (React + Vite)

Open a second PowerShell terminal:

```powershell
cd "d:\SEM 5\CD LAB\NMC-OPT\frontend"
npm install
npm run dev
```

Open your browser at:  
**`http://localhost:5173`**

---

## Running Automated Tests

To run the backend unit tests for kernel analysis, cost formulas, and optimization decisions:

```powershell
python -m pytest backend/tests
```

To run the frontend production build check:

```powershell
cd frontend
npm run build
```

---

## Citations and Research Context
1. **IMTP: Search-based Code Generation for In-memory Tensor Programs**  
   Yongwon Shin, Dookyung Kang, Hyojin Sung (arXiv:2412.19630, 2024).
2. **Near-Memory Computing: Past, Present, and Future**  
   G. Singh, L. Chelini, S. Corda, et al. (*Microprocessors and Microsystems*, 2019).
3. **Computing with Near Data**  
   X. Tang, M. T. Kandemir, H. Zhao, M. Jung, M. Karakoy (*ACM SIGMETRICS PER*, 2019).
