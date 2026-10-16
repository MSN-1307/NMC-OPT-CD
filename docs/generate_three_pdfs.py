import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Dynamic Canvas for Running Header & Footer
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (Pages > 1)
        if self._pageNumber > 1:
            doc_title = getattr(self, "doc_title", "NMC-Opt Studio Technical Documentation")
            self.drawString(54, letter[1] - 36, doc_title.upper())
            self.setFont("Helvetica", 8)
            self.drawRightString(letter[0] - 54, letter[1] - 36, "COMPILER DESIGN & RESEARCH")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer
        self.setFont("Helvetica", 8)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 34, page_str)
        self.drawString(54, 34, "NMC-OPT STUDIO — ADAPTIVE DATA-MOVEMENT-AWARE COMPILER WORKBENCH")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 46, letter[0] - 54, 46)
        self.restoreState()

def create_methodology_canvas(title):
    class CustomCanvas(NumberedCanvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.doc_title = title
    return CustomCanvas

def get_base_styles():
    styles = getSampleStyleSheet()
    
    custom_styles = {
        'DocTitle': ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a"),
            alignment=0,
            spaceAfter=6
        ),
        'DocSubtitle': ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#0284c7"),
            alignment=0,
            spaceAfter=14
        ),
        'MetaBox': ParagraphStyle(
            'MetaBox',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#334155")
        ),
        'SecHeading': ParagraphStyle(
            'SecHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True
        ),
        'SubHeading': ParagraphStyle(
            'SubHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#0369a1"),
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True
        ),
        'Body': ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#1e293b"),
            spaceAfter=6
        ),
        'CustomBullet': ParagraphStyle(
            'CustomBullet',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=colors.HexColor("#1e293b"),
            leftIndent=12,
            firstLineIndent=-8,
            spaceAfter=3
        ),
        'CodeBlock': ParagraphStyle(
            'CodeBlock',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=8,
            leading=10.5,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=4
        ),
        'CalloutText': ParagraphStyle(
            'CalloutText',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#1e293b")
        ),
        'TableHeader': ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.white,
            alignment=0
        ),
        'TableCell': ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10.5,
            textColor=colors.HexColor("#1e293b"),
            alignment=0
        ),
        'TableCellBold': ParagraphStyle(
            'TableCellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10.5,
            textColor=colors.HexColor("#0f172a"),
            alignment=0
        )
    }
    for k, v in custom_styles.items():
        styles.add(v)
    return styles

def build_callout(text, style, border_color="#0284c7", bg_color="#f0f9ff"):
    p = Paragraph(text, style)
    t = Table([[p]], colWidths=[letter[0] - 108])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor(border_color)),
        ('LINELEFT', (0,0), (0,0), 3.5, colors.HexColor(border_color)),
    ]))
    return t

def build_code_box(code_lines, style):
    paragraphs = [Paragraph(line.replace(" ", "&nbsp;"), style) for line in code_lines]
    t = Table([[paragraphs]], colWidths=[letter[0] - 108])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    return t

# =========================================================================
# 1. METHODOLOGY DOCUMENT BUILDER
# =========================================================================
def build_methodology_pdf(output_path):
    styles = get_base_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story = []

    # Title & Metadata
    story.append(Paragraph("NMC-Opt Studio: Compiler Analytical Cost Model & Target Placement Methodology", styles['DocTitle']))
    story.append(Paragraph("Rigorous Formulation of Data-Movement-Aware Target Selection for Near-Memory Computing", styles['DocSubtitle']))
    
    meta_text = "<b>Author / Research Team:</b> Compiler Design & Computer Systems Engineering Group<br/>" \
                "<b>Artifact Status:</b> Formal Academic Specification & Research Methodology Document<br/>" \
                "<b>Repository Source:</b> https://github.com/MSN-1307/NMC-OPT-CD | <b>Target Architecture:</b> Host CPU vs 16-Bank PIM"
    story.append(build_callout(meta_text, styles['MetaBox'], border_color="#0284c7", bg_color="#f8fafc"))
    story.append(Spacer(1, 10))

    # Section 1: Executive Framing
    story.append(Paragraph("1. Executive Problem Framing: The Memory Wall in Modern Compilers", styles['SecHeading']))
    story.append(Paragraph(
        "Modern high-performance compilers (e.g., GCC, LLVM) employ sophisticated intermediate representations and loop optimization passes "
        "designed primarily around arithmetic operation counts, instruction-level parallelism (ILP), and register pressure. However, in "
        "memory-bound scientific and machine learning workloads, performance and energy consumption are overwhelmingly dominated by "
        "off-chip data movement across physical interconnects (PCIe Gen5, CXL 3.0, and DDR5 multi-channel buses). This discrepancy—the classical "
        "<b>Memory Wall</b>—imposes a critical throughput barrier for kernels with low arithmetic intensity.", styles['Body']
    ))
    story.append(Paragraph(
        "Near-Memory Computing (NMC) and Processing-In-Memory (PIM) architectures place Data Processing Units (DPUs) directly adjacent to DRAM banks, "
        "offering ultra-wide aggregate memory bandwidth (e.g., 160+ GB/s across 16 internal banks) at very low physical energy costs. Despite these hardware "
        "capabilities, modern optimizing compilers lack native analytical cost models to autonomously partition loops between conventional host CPUs and in-memory "
        "DPUs. NMC-Opt Studio formalizes data movement as a first-class compiler optimization metric.", styles['Body']
    ))
    story.append(Spacer(1, 8))

    # Section 2: 7-Stage Compiler Decision Pipeline
    story.append(Paragraph("2. End-to-End Compiler Optimization Pipeline", styles['SecHeading']))
    story.append(Paragraph(
        "The compiler executes a deterministic seven-stage analytical pipeline that transforms raw C source loops into target placement decisions:", styles['Body']
    ))

    pipeline_table_data = [
        [Paragraph("Stage", styles['TableHeader']), Paragraph("Pipeline Phase", styles['TableHeader']), Paragraph("Compiler Functional Responsibility", styles['TableHeader'])],
        [Paragraph("1", styles['TableCellBold']), Paragraph("Source Intake", styles['TableCellBold']), Paragraph("Accepts canonical C loop constructs, function prototypes, and pragmas.", styles['TableCell'])],
        [Paragraph("2", styles['TableCellBold']), Paragraph("Syntactic Validation", styles['TableCellBold']), Paragraph("Runs pycparser AST syntax validation; verifies single-loop bound constraints.", styles['TableCell'])],
        [Paragraph("3", styles['TableCellBold']), Paragraph("AST Loop Profiling", styles['TableCellBold']), Paragraph("Computes trip counts, memory footprint (bytes read/written), and Arithmetic Intensity.", styles['TableCell'])],
        [Paragraph("4", styles['TableCellBold']), Paragraph("SSA IR Generation", styles['TableCellBold']), Paragraph("Lowers loop bodies into 3-address SSA quadruples (gep, load, store, fadd, fmul).", styles['TableCell'])],
        [Paragraph("5", styles['TableCellBold']), Paragraph("Cost Model Evaluation", styles['TableCellBold']), Paragraph("Applies first-principles equations to calculate T_cpu and T_nmc in milliseconds.", styles['TableCell'])],
        [Paragraph("6", styles['TableCellBold']), Paragraph("Placement Matrix", styles['TableCellBold']), Paragraph("Evaluates baseline and transformed candidate strategies (Fusion, Tiling).", styles['TableCell'])],
        [Paragraph("7", styles['TableCellBold']), Paragraph("Optimization Verdict", styles['TableCellBold']), Paragraph("Emits definitive offload target, expected speedup factor, and bottleneck audit.", styles['TableCell'])],
    ]
    t_pipe = Table(pipeline_table_data, colWidths=[36, 120, letter[0] - 108 - 156])
    t_pipe.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_pipe)
    story.append(Spacer(1, 10))

    # Section 3: Analytical Cost Formulation
    story.append(Paragraph("3. Analytical Cost Model Formulation", styles['SecHeading']))
    story.append(Paragraph(
        "All component execution latencies are formulated in <b>milliseconds (ms)</b> using explicit dimensional conversions (1 GFLOPS = 10^6 ops/ms; 1 GB/s = 10^6 B/ms):", styles['Body']
    ))

    eq_box = [
        "// A. Host CPU Execution Latency (ms)",
        "T_cpu = T_comp_cpu + T_mem_cpu",
        "T_comp_cpu = W / (Pi_cpu * 1e6)",
        "T_mem_cpu  = D / (Beta_cpu * 1e6)",
        "",
        "// B. Near-Memory Computing (NMC) Offload Latency (ms)",
        "T_nmc = T_comp_nmc + T_mem_nmc + T_link + T_layout + T_sync",
        "T_comp_nmc = W / (Pi_nmc * 1e6)",
        "T_mem_nmc  = D / (Beta_nmc * 1e6)",
        "T_link     = (D_read + D_write) / (Beta_link * 1e6) + t_h2d + t_d2h",
        "T_layout   = (D_read * alpha) / (Beta_layout * 1e6) + t_layout",
        "T_sync     = S * t_barrier"
    ]
    story.append(build_code_box(eq_box, styles['CodeBlock']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("4. Transformation Legality & Placement Decision Rule", styles['SecHeading']))
    story.append(Paragraph(
        "The compiler defines explicit legality preconditions before evaluating candidate transformations:", styles['Body']
    ))
    story.append(Paragraph("• <b>Loop Fusion (NMC + Loop Fusion):</b> Legal only when consecutive loops share identical trip counts and produce point-to-point element-wise outputs without loop-carried backward dependencies. Eliminates intermediate DRAM round trips.", styles['CustomBullet']))
    story.append(Paragraph("• <b>Loop Tiling (NMC + Tiling):</b> Legal exclusively on multi-dimensional loop nests (e.g., GEMV). Partitions matrix rows across independent DRAM banks, keeping vector elements resident in bank-local scratchpad memories.", styles['CustomBullet']))
    
    verdict_text = "<b>The Core Compiler Placement Decision Rule:</b><br/>" \
                   "Offload to In-Memory DPUs ONLY IF <b>T_nmc &lt; T_cpu</b> (which occurs when Arithmetic Intensity <b>I &lt; I_crossover</b>).<br/>" \
                   "If <i>I &ge; I_crossover</i>, compute overhead dominates over memory transfer savings, and the compiler retains the loop on the Host CPU."
    story.append(build_callout(verdict_text, styles['CalloutText'], border_color="#047857", bg_color="#f0fdf4"))
    story.append(Spacer(1, 10))

    # Section 5: 16-Bank Interleaved Memory Model
    story.append(Paragraph("5. 16-Bank Interleaved Memory Layout & Contention Model", styles['SecHeading']))
    story.append(Paragraph(
        "Physical DRAM is organized into multiple independent banks. Under naive contiguous allocation, stride-1 vector reads across parallel DPUs "
        "cause acute channel collisions and row-buffer conflicts. NMC-Opt Studio models bank interleaving where contiguous memory addresses "
        "are striped across 16 independent banks: <i>Bank_ID = (Address / Cache_Line_Size) mod 16</i>. This achieves peak aggregate internal "
        "throughput (160 GB/s) while charging an explicit compile-time layout transformation penalty (T_layout) for unaligned input data.", styles['Body']
    ))
    story.append(Spacer(1, 10))

    # Section 6: Research Foundations
    story.append(Paragraph("6. Research Foundations & Empirical Grounding", styles['SecHeading']))
    story.append(Paragraph(
        "NMC-Opt Studio's analytical models are validated against published findings in high-performance memory-centric literature:", styles['Body']
    ))
    story.append(Paragraph("1. <b>IMTP (arXiv:2412.19630, 2024):</b> Validates compiler-level host/PIM boundary management, bank-local scratchpad buffering, and boundary check overheads on UPMEM-like DRAM architectures.", styles['CustomBullet']))
    story.append(Paragraph("2. <b>Singh et al. (Microprocessors & Microsystems, 2019):</b> Confirms the 5x–10x internal memory bandwidth advantage of 3D-stacked and 2D DRAM PIM over host memory channels.", styles['CustomBullet']))
    story.append(Paragraph("3. <b>Classical Roofline Model (Williams et al., 2009):</b> Provides the theoretical operational intensity bound (FLOP/Byte) that governs the transition between memory-bound and compute-bound regimes.", styles['CustomBullet']))

    doc.build(story, canvasmaker=create_methodology_canvas("NMC-Opt Studio: Compiler Methodology Document"))
    print(f"Methodology PDF built: {output_path}")

# =========================================================================
# 2. NOVELTY DOCUMENT BUILDER
# =========================================================================
def build_novelty_pdf(output_path):
    styles = get_base_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story = []

    # Title & Metadata
    story.append(Paragraph("NMC-Opt Studio: Scientific Novelty & Architectural Innovations", styles['DocTitle']))
    story.append(Paragraph("Academic Research Contributions in Data-Movement-Aware Compiler Optimization", styles['DocSubtitle']))
    
    meta_text = "<b>Publication Category:</b> Academic Research Contributions & Innovation Audit<br/>" \
                "<b>Core Scope:</b> Compiler Design, Intermediate Representation, and Near-Memory Cost Modeling<br/>" \
                "<b>Repository:</b> https://github.com/MSN-1307/NMC-OPT-CD | <b>Target:</b> Heterogeneous CPU/PIM Systems"
    story.append(build_callout(meta_text, styles['MetaBox'], border_color="#7c3aed", bg_color="#faf5ff"))
    story.append(Spacer(1, 10))

    # Section 1: Executive Statement of Novelty
    story.append(Paragraph("1. Executive Statement of Novelty", styles['SecHeading']))
    story.append(Paragraph(
        "While Processing-In-Memory (PIM) and Near-Memory Computing (NMC) hardware prototypes (such as UPMEM DPU, Samsung HBM-PIM, and SK Hynix AiM) "
        "have demonstrated extraordinary bandwidth gains in hardware laboratories, software toolchains remain in their infancy. Existing compilers "
        "(e.g., GCC, Clang/LLVM) treat memory accesses as uniform-cost load/store operations, lacking the analytical machinery required to make "
        "autonomous offloading decisions between host CPUs and distributed in-memory compute units.", styles['Body']
    ))
    story.append(Paragraph(
        "<b>NMC-Opt Studio</b> bridges this fundamental software-hardware gap by introducing an adaptive, data-movement-aware compiler optimization "
        "workbench. The platform is not an ad-hoc hardware simulator, but an explicit compiler analytical framework that formalizes interconnect transit, "
        "bank interleaving, and layout reorganization costs directly inside the compiler optimization decision pass.", styles['Body']
    ))
    story.append(Spacer(1, 8))

    # Section 2: Five Core Research Innovations
    story.append(Paragraph("2. Five Core Research & Technical Innovations", styles['SecHeading']))

    innovations = [
        ("Innovation 1: Data-Movement-Aware Target Selection Matrix",
         "Traditional compilers optimize strictly for operation latency and register allocation. NMC-Opt Studio elevates interconnect data traffic (MB transferred) and operational intensity (FLOP/Byte) to first-class compiler objective functions. The compiler autonomously computes the crossover scale (N_crossover) where memory bandwidth savings surpass PCIe/CXL bus transfer overheads."),
        ("Innovation 2: Unified Heterogeneous SSA Intermediate Representation (IR)",
         "The framework introduces a specialized 3-address SSA IR that captures memory semantics across both host memory and distributed PIM banks. Standard IR instructions (load, store, fadd, gep) are augmented with bank-affinity annotations and explicit barrier synchronization instructions (sync_barrier) to expose physical bank interleaving to optimization passes."),
        ("Innovation 3: First-Principles Analytical Cost Engine with Interconnect Tax",
         "Unlike slow cycle-accurate hardware emulators (gem5-PIM) that require hours for single benchmark runs, NMC-Opt Studio uses a closed-form first-principles analytical cost model. It factors in host DMA dispatch overheads (t_h2d, t_d2h), physical link bandwidth constraints (PCIe Gen5 vs CXL), and barrier latency, delivering instantaneous, cycle-representative compiler verdicts."),
        ("Innovation 4: In-Memory Layout Reorganization & Bank Striping Model",
         "PIM speedup depends critically on avoiding bank channel contention. NMC-Opt Studio explicitly models the compile-time cost of converting contiguous host memory buffers into 16-bank interleaved layouts (T_layout), ensuring the compiler does not emit invalid offload decisions that assume unrealistic zero-cost data rearrangements."),
        ("Innovation 5: Context-Aware Compiler Copilot & Educational Workbench",
         "The platform integrates an interactive compiler decision walkthrough with a retrieval-augmented Compiler Copilot. The assistant grounds real-time interactive parameter adjustments (e.g., sweeping vector scale or interconnect width) in compiler design principles and peer-reviewed PIM literature.")
    ]

    for title, desc in innovations:
        story.append(Paragraph(title, styles['SubHeading']))
        story.append(Paragraph(desc, styles['Body']))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 6))

    # Section 3: State-of-the-Art Comparative Matrix
    story.append(Paragraph("3. State-of-the-Art Comparative Matrix", styles['SecHeading']))
    story.append(Paragraph(
        "The following matrix positions NMC-Opt Studio against prevailing software and simulation approaches:", styles['Body']
    ))

    comp_table_data = [
        [Paragraph("Capability / Dimension", styles['TableHeader']), Paragraph("GCC / Clang", styles['TableHeader']), Paragraph("UPMEM SDK", styles['TableHeader']), Paragraph("gem5-PIM", styles['TableHeader']), Paragraph("NMC-Opt Studio", styles['TableHeader'])],
        [Paragraph("Target Selection", styles['TableCellBold']), Paragraph("Host CPU only", styles['TableCell']), Paragraph("Manual developer pragma", styles['TableCell']), Paragraph("None (Trace driven)", styles['TableCell']), Paragraph("Autonomous Analytical Matrix", styles['TableCellBold'])],
        [Paragraph("Data Movement Model", styles['TableCellBold']), Paragraph("Zero link cost", styles['TableCell']), Paragraph("Manual host-device DMA", styles['TableCell']), Paragraph("Cycle-level link sim", styles['TableCell']), Paragraph("Explicit First-Principles Tax", styles['TableCellBold'])],
        [Paragraph("Bank Interleaving", styles['TableCellBold']), Paragraph("Ignored", styles['TableCell']), Paragraph("Manual bank scatter", styles['TableCell']), Paragraph("Hardware modeled", styles['TableCell']), Paragraph("Compile-time Layout Model", styles['TableCellBold'])],
        [Paragraph("Compilation Latency", styles['TableCellBold']), Paragraph("Milliseconds", styles['TableCell']), Paragraph("Seconds", styles['TableCell']), Paragraph("Hours (Slow sim)", styles['TableCell']), Paragraph("Real-Time (&lt;50 ms)", styles['TableCellBold'])],
        [Paragraph("Intermediate Rep.", styles['TableCellBold']), Paragraph("Standard SSA", styles['TableCell']), Paragraph("Clang LLVM IR", styles['TableCell']), Paragraph("None (Sim traces)", styles['TableCell']), Paragraph("Bank-Aware 3-Address SSA", styles['TableCellBold'])],
    ]
    t_comp = Table(comp_table_data, colWidths=[108, 90, 100, 95, 115])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#3b0764")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#faf5ff")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 10))

    # Section 4: Summary of Academic Impact
    story.append(Paragraph("4. Summary of Academic & Curricular Impact", styles['SecHeading']))
    story.append(Paragraph(
        "NMC-Opt Studio establishes that future compiler architectures must evolve beyond pure instruction scheduling to incorporate "
        "interconnect and memory topology awareness. By providing an open, fully inspectable, and reproducible software workbench, "
        "the project enables both compiler researchers and students to explore heterogeneous memory-centric computing with mathematical rigor.", styles['Body']
    ))

    doc.build(story, canvasmaker=create_methodology_canvas("NMC-Opt Studio: Scientific Novelty Document"))
    print(f"Novelty PDF built: {output_path}")

# =========================================================================
# 3. EXECUTION GUIDE BUILDER
# =========================================================================
def build_execution_guide_pdf(output_path):
    styles = get_base_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story = []

    # Title & Metadata
    story.append(Paragraph("NMC-Opt Studio: Installation, Configuration & Execution Guide", styles['DocTitle']))
    story.append(Paragraph("Complete Technical Operations Manual for Local Deployment and CLI Pipeline Execution", styles['DocSubtitle']))
    
    meta_text = "<b>Target Audience:</b> Software Engineers, Academic Evaluators, and Compiler Researchers<br/>" \
                "<b>Repository URL:</b> https://github.com/MSN-1307/NMC-OPT-CD | <b>Platform Compatibility:</b> Windows / Linux / macOS<br/>" \
                "<b>Prerequisites:</b> Python 3.10+, Node.js 18+, C Compiler (gcc/clang), and Git"
    story.append(build_callout(meta_text, styles['MetaBox'], border_color="#ea580c", bg_color="#fff7ed"))
    story.append(Spacer(1, 10))

    # Section 1: System Requirements
    story.append(Paragraph("1. System Prerequisites", styles['SecHeading']))
    story.append(Paragraph("Before initializing NMC-Opt Studio, verify that the following runtime environments are installed:", styles['Body']))
    story.append(Paragraph("• <b>Python:</b> Version 3.10 or higher (Python 3.11, 3.12, 3.13, and 3.14 verified). Ensure pip is updated.", styles['CustomBullet']))
    story.append(Paragraph("• <b>Node.js:</b> Version 18.0 or higher with npm (Node.js 20+ LTS recommended).", styles['CustomBullet']))
    story.append(Paragraph("• <b>C Compiler:</b> GCC (MinGW for Windows, GNU GCC for Linux) or Clang for native C kernel compilation audits.", styles['CustomBullet']))
    story.append(Paragraph("• <b>Git:</b> Version 2.30+ for repository cloning and version control.", styles['CustomBullet']))
    story.append(Spacer(1, 6))

    # Section 2: Repository Cloning
    story.append(Paragraph("2. Step 1: Repository Cloning & Directory Inspection", styles['SecHeading']))
    story.append(Paragraph("Clone the remote Git repository and navigate into the root project directory:", styles['Body']))
    clone_code = [
        "git clone https://github.com/MSN-1307/NMC-OPT-CD.git",
        "cd NMC-OPT-CD"
    ]
    story.append(build_code_box(clone_code, styles['CodeBlock']))
    story.append(Spacer(1, 6))

    # Section 3: Backend Setup
    story.append(Paragraph("3. Step 2: Backend Configuration & Server Launch", styles['SecHeading']))
    story.append(Paragraph(
        "The backend is built with FastAPI and runs the analytical cost modeling, pycparser AST profiling, and SSA IR generation passes.", styles['Body']
    ))
    backend_code = [
        "# Navigate to backend folder",
        "cd backend",
        "",
        "# Create and activate virtual environment (Windows PowerShell)",
        "python -m venv venv",
        ".\\venv\\Scripts\\Activate.ps1",
        "",
        "# Install Python dependencies and launch server",
        "pip install -r requirements.txt",
        "python -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload"
    ]
    story.append(build_code_box(backend_code, styles['CodeBlock']))
    story.append(Paragraph("<b>Verification Endpoints:</b>", styles['Body']))
    story.append(Paragraph("• Swagger / OpenAPI Docs: <font color='#0284c7'>http://localhost:8008/docs</font>", styles['CustomBullet']))
    story.append(Paragraph("• API Health Endpoint: <font color='#0284c7'>http://localhost:8008/api/health</font>", styles['CustomBullet']))
    story.append(Spacer(1, 6))

    # Section 4: Frontend Setup
    story.append(Paragraph("4. Step 3: Frontend Installation & Vite Development Server", styles['SecHeading']))
    story.append(Paragraph("In a separate terminal, initialize the React / TypeScript user interface:", styles['Body']))
    frontend_code = [
        "# Navigate to frontend folder",
        "cd frontend",
        "",
        "# Install npm dependencies",
        "npm install",
        "",
        "# Start Vite development server",
        "npm run dev"
    ]
    story.append(build_code_box(frontend_code, styles['CodeBlock']))
    story.append(Paragraph("Open your web browser and navigate to: <b>http://localhost:5173</b>", styles['Body']))
    story.append(Spacer(1, 6))

    # Section 5: CLI Pipeline Execution
    story.append(Paragraph("5. Step 4: Standalone Command-Line Interface (CLI) Execution", styles['SecHeading']))
    story.append(Paragraph(
        "NMC-Opt Studio includes a standalone CLI utility (<code>backend/cli.py</code>) enabling direct terminal evaluation without opening a browser:", styles['Body']
    ))
    cli_code = [
        "# Evaluate Vector Addition with 2,000,000 elements",
        "python backend/cli.py --benchmark vector_add --size 2000000",
        "",
        "# Evaluate Matrix-Vector Multiplication (2048 x 2048 matrix)",
        "python backend/cli.py --benchmark gemv --size 4194304 --rows 2048 --cols 2048",
        "",
        "# Evaluate arbitrary custom C loop kernel file",
        "python backend/cli.py --custom path/to/my_kernel.c --size 1000000",
        "",
        "# Emit raw machine-readable JSON for automated scripts",
        "python backend/cli.py --benchmark relu --size 5000000 --json"
    ]
    story.append(build_code_box(cli_code, styles['CodeBlock']))
    story.append(Spacer(1, 6))

    # Section 6: Verification & Automated Tests
    story.append(Paragraph("6. Step 5: Automated Testing & Build Verification", styles['SecHeading']))
    story.append(Paragraph("Verify algorithmic correctness across compiler modules using the automated pytest test suite:", styles['Body']))
    test_code = [
        "# Run backend pytest suite (all 8 tests)",
        "python -m pytest backend/tests -v",
        "",
        "# Run frontend TypeScript typecheck and production build",
        "cd frontend",
        "npm run build"
    ]
    story.append(build_code_box(test_code, styles['CodeBlock']))
    story.append(Spacer(1, 6))

    # Section 7: Troubleshooting Guide
    story.append(Paragraph("7. Troubleshooting & Common Resolutions", styles['SecHeading']))
    story.append(Paragraph("• <b>Port Conflict on 8008:</b> If port 8008 is in use, modify the uvicorn start command: <code>python -m uvicorn app.main:app --port 8010</code> and update frontend API baseUrl.", styles['CustomBullet']))
    story.append(Paragraph("• <b>PowerShell ExecutionPolicy:</b> If <code>Activate.ps1</code> cannot be loaded, run: <code>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</code>.", styles['CustomBullet']))
    story.append(Paragraph("• <b>pycparser Syntax Errors:</b> Ensure uploaded custom C code includes standard function wrappers and avoids compiler-specific assembly extensions.", styles['CustomBullet']))

    doc.build(story, canvasmaker=create_methodology_canvas("NMC-Opt Studio: Execution Guide"))
    print(f"Execution Guide PDF built: {output_path}")

# =========================================================================
# MAIN EXECUTION
# =========================================================================
if __name__ == "__main__":
    docs_dir = os.path.abspath("docs")
    os.makedirs(docs_dir, exist_ok=True)
    
    pdf1 = os.path.join(docs_dir, "NMC_Opt_Methodology_Document.pdf")
    pdf2 = os.path.join(docs_dir, "NMC_Opt_Novelty_Document.pdf")
    pdf3 = os.path.join(docs_dir, "NMC_Opt_Execution_Guide.pdf")

    build_methodology_pdf(pdf1)
    build_novelty_pdf(pdf2)
    build_execution_guide_pdf(pdf3)

    # Copy to root directory for easy access
    import shutil
    shutil.copy2(pdf1, os.path.abspath("NMC_Opt_Methodology_Document.pdf"))
    shutil.copy2(pdf2, os.path.abspath("NMC_Opt_Novelty_Document.pdf"))
    shutil.copy2(pdf3, os.path.abspath("NMC_Opt_Execution_Guide.pdf"))
    print("All 3 PDFs built and copied to root directory successfully!")
