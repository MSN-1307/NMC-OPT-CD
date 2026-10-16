import os
import subprocess

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 820" width="1200" height="820" style="background:#090d16; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Gradients -->
    <linearGradient id="grad-l1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="grad-l2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="grad-l3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4c1d95" />
      <stop offset="100%" stop-color="#2e1065" />
    </linearGradient>
    <linearGradient id="grad-l4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c2d12" />
      <stop offset="100%" stop-color="#451a03" />
    </linearGradient>

    <!-- Markers for arrows -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
    </marker>
    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
    </marker>
    <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#c084fc" />
    </marker>
  </defs>

  <!-- Title & Header -->
  <text x="600" y="46" text-anchor="middle" fill="#f8fafc" font-size="24" font-weight="800" letter-spacing="0.5">NMC-Opt Studio: System Architecture</text>
  <text x="600" y="72" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="500">4-Layer Adaptive Data-Movement-Aware Compiler Optimization Pipeline</text>

  <!-- LAYER 1: CLIENT & INTERACTION -->
  <g transform="translate(60, 95)">
    <rect width="1080" height="120" rx="14" fill="url(#grad-l1)" stroke="#38bdf8" stroke-width="1.8" />
    <rect x="20" y="16" width="90" height="24" rx="6" fill="#0369a1" />
    <text x="65" y="32" text-anchor="middle" fill="#e0f2fe" font-size="11" font-weight="700">LAYER 1</text>
    <text x="125" y="33" fill="#f8fafc" font-size="16" font-weight="700">Client Interaction &amp; Workspace</text>
    <text x="125" y="49" fill="#94a3b8" font-size="12">Interactive Web Dashboard &amp; Real-Time Parameter Sliders</text>

    <!-- Sub boxes -->
    <rect x="360" y="24" width="220" height="72" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <text x="470" y="52" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700">Interactive Web UI</text>
    <text x="470" y="74" text-anchor="middle" fill="#94a3b8" font-size="11">Sliders: Vector Size, Bandwidth</text>

    <rect x="600" y="24" width="220" height="72" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <text x="710" y="52" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700">Benchmark Selector</text>
    <text x="710" y="74" text-anchor="middle" fill="#94a3b8" font-size="11">6 Built-in Kernels + Custom C</text>

    <rect x="840" y="24" width="215" height="72" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <text x="947" y="52" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="700">Compiler Copilot AI</text>
    <text x="947" y="74" text-anchor="middle" fill="#94a3b8" font-size="11">RAG Context Assistant</text>
  </g>

  <!-- Flow Arrow 1 -> 2 -->
  <line x1="600" y1="215" x2="600" y2="255" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow)" />
  <text x="615" y="240" fill="#38bdf8" font-size="11" font-weight="600">Source C Code &amp; Hardware Parameters</text>

  <!-- LAYER 2: WORKLOAD INGESTION & PROFILING -->
  <g transform="translate(60, 260)">
    <rect width="1080" height="120" rx="14" fill="url(#grad-l2)" stroke="#10b981" stroke-width="1.8" />
    <rect x="20" y="16" width="90" height="24" rx="6" fill="#047857" />
    <text x="65" y="32" text-anchor="middle" fill="#d1fae5" font-size="11" font-weight="700">LAYER 2</text>
    <text x="125" y="33" fill="#f8fafc" font-size="16" font-weight="700">Workload Ingestion &amp; Profiling</text>
    <text x="125" y="49" fill="#a7f3d0" font-size="12">Source Code Parsing &amp; Loop Characteristic Extraction</text>

    <!-- Sub boxes -->
    <rect x="360" y="24" width="220" height="72" rx="8" fill="#064e3b" stroke="#059669" stroke-width="1" />
    <text x="470" y="52" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">C Source AST Parser</text>
    <text x="470" y="74" text-anchor="middle" fill="#a7f3d0" font-size="11">pycparser AST Extraction</text>

    <rect x="600" y="24" width="220" height="72" rx="8" fill="#064e3b" stroke="#059669" stroke-width="1" />
    <text x="710" y="52" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">Loop Bounds Profiler</text>
    <text x="710" y="74" text-anchor="middle" fill="#a7f3d0" font-size="11">Trip Count &amp; Op Count</text>

    <rect x="840" y="24" width="215" height="72" rx="8" fill="#064e3b" stroke="#059669" stroke-width="1" />
    <text x="947" y="52" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">Arithmetic Intensity</text>
    <text x="947" y="74" text-anchor="middle" fill="#a7f3d0" font-size="11">FLOP / Byte Metric (I &lt; 0.5)</text>
  </g>

  <!-- Flow Arrow 2 -> 3 -->
  <line x1="600" y1="380" x2="600" y2="420" stroke="#10b981" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-emerald)" />
  <text x="615" y="405" fill="#10b981" font-size="11" font-weight="600">Workload Metrics &amp; Loop IR</text>

  <!-- LAYER 3: CORE COMPILER & SIMULATION -->
  <g transform="translate(60, 425)">
    <rect width="1080" height="135" rx="14" fill="url(#grad-l3)" stroke="#a855f7" stroke-width="1.8" />
    <rect x="20" y="18" width="90" height="24" rx="6" fill="#7e22ce" />
    <text x="65" y="34" text-anchor="middle" fill="#f3e8ff" font-size="11" font-weight="700">LAYER 3</text>
    <text x="125" y="35" fill="#f8fafc" font-size="16" font-weight="700">NMC-Opt Decision Engine</text>
    <text x="125" y="51" fill="#d8b4fe" font-size="12">Cost-Driven Target Selection &amp; Simulation</text>

    <!-- Sub boxes -->
    <rect x="360" y="22" width="220" height="88" rx="8" fill="#2e1065" stroke="#7e22ce" stroke-width="1" />
    <text x="470" y="48" text-anchor="middle" fill="#c084fc" font-size="13" font-weight="700">SSA IR Generation</text>
    <text x="470" y="68" text-anchor="middle" fill="#e9d5ff" font-size="11">llvm-like Quadruples</text>
    <text x="470" y="86" text-anchor="middle" fill="#a855f7" font-size="10">%val = load / fmul / store</text>

    <rect x="600" y="22" width="220" height="88" rx="8" fill="#2e1065" stroke="#7e22ce" stroke-width="1" />
    <text x="710" y="48" text-anchor="middle" fill="#c084fc" font-size="13" font-weight="700">Analytical Cost Model</text>
    <text x="710" y="68" text-anchor="middle" fill="#e9d5ff" font-size="11">T_cpu vs T_nmc Comparison</text>
    <text x="710" y="86" text-anchor="middle" fill="#a855f7" font-size="10">PCIe Overhead + DPU Compute</text>

    <rect x="840" y="22" width="215" height="88" rx="8" fill="#2e1065" stroke="#7e22ce" stroke-width="1" />
    <text x="947" y="48" text-anchor="middle" fill="#c084fc" font-size="13" font-weight="700">Execution Simulator</text>
    <text x="947" y="68" text-anchor="middle" fill="#e9d5ff" font-size="11">16-Bank Interleaving</text>
    <text x="947" y="86" text-anchor="middle" fill="#a855f7" font-size="10">Bank-parallel DPU dispatch</text>
  </g>

  <!-- Flow Arrow 3 -> 4 -->
  <line x1="600" y1="560" x2="600" y2="600" stroke="#c084fc" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrow-purple)" />
  <text x="615" y="585" fill="#c084fc" font-size="11" font-weight="600">Offload Verdict, Speedup &amp; Energy Metrics</text>

  <!-- LAYER 4: ANALYTICS & VISUALIZATION -->
  <g transform="translate(60, 605)">
    <rect width="1080" height="120" rx="14" fill="url(#grad-l4)" stroke="#f97316" stroke-width="1.8" />
    <rect x="20" y="16" width="90" height="24" rx="6" fill="#c2410c" />
    <text x="65" y="32" text-anchor="middle" fill="#ffedd5" font-size="11" font-weight="700">LAYER 4</text>
    <text x="125" y="33" fill="#f8fafc" font-size="16" font-weight="700">Analytics &amp; Output Insights</text>
    <text x="125" y="49" fill="#fed7aa" font-size="12">Interactive Performance Comparison &amp; Bank Layout Inspection</text>

    <!-- Sub boxes -->
    <rect x="360" y="24" width="220" height="72" rx="8" fill="#431407" stroke="#ea580c" stroke-width="1" />
    <text x="470" y="52" text-anchor="middle" fill="#fb923c" font-size="14" font-weight="700">Optimization Verdict</text>
    <text x="470" y="74" text-anchor="middle" fill="#fdba74" font-size="11">NMC Offload vs Host CPU</text>

    <rect x="600" y="24" width="220" height="72" rx="8" fill="#431407" stroke="#ea580c" stroke-width="1" />
    <text x="710" y="52" text-anchor="middle" fill="#fb923c" font-size="14" font-weight="700">8 Analytics Graphs</text>
    <text x="710" y="74" text-anchor="middle" fill="#fdba74" font-size="11">Roofline, Energy, Crossover</text>

    <rect x="840" y="24" width="215" height="72" rx="8" fill="#431407" stroke="#ea580c" stroke-width="1" />
    <text x="947" y="52" text-anchor="middle" fill="#fb923c" font-size="14" font-weight="700">16-Bank Layout View</text>
    <text x="947" y="74" text-anchor="middle" fill="#fdba74" font-size="11">Contiguous vs Interleaved</text>
  </g>

  <!-- Bottom Summary Bar -->
  <rect x="60" y="745" width="1080" height="45" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1" />
  <text x="600" y="773" text-anchor="middle" fill="#94a3b8" font-size="12">
    Decision Rule: <tspan fill="#38bdf8" font-weight="700">If T_nmc &lt; T_cpu</tspan> (due to low arithmetic intensity <tspan fill="#34d399">I &lt; I_crossover</tspan>), compile for <tspan fill="#c084fc" font-weight="700">In-Memory DPUs</tspan>; otherwise retain on <tspan fill="#fb923c" font-weight="700">Host CPU</tspan>.
  </text>
</svg>
"""

svg_path = os.path.abspath("docs/nmc_opt_architecture_simple.svg")
with open(svg_path, "w", encoding="utf-8") as f:
    f.write(svg_content.strip())

print(f"Simple SVG written: {svg_path} ({len(svg_content)} bytes)")

# Also write to root
root_svg = os.path.abspath("nmc_opt_architecture_simple.svg")
with open(root_svg, "w", encoding="utf-8") as f:
    f.write(svg_content.strip())
print(f"Copied simple SVG to root: {root_svg}")

# Create preview HTML for Edge rendering
html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      margin: 0;
      padding: 0;
      background: #090d16;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }}
    svg {{
      width: 1200px;
      height: 820px;
    }}
  </style>
</head>
<body>
{svg_content}
</body>
</html>
"""

html_path = os.path.abspath("docs/view_architecture_simple.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
png_path = os.path.abspath("docs/nmc_opt_architecture_simple.png")
file_url = "file:///" + html_path.replace("\\", "/")

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1200,820",
    f"--screenshot={png_path}",
    file_url
]

print("Rendering PNG with Edge...")
res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
if os.path.exists(png_path):
    print(f"PNG rendered: {png_path} ({os.path.getsize(png_path):,} bytes)")
    root_png = os.path.abspath("nmc_opt_architecture_simple.png")
    with open(png_path, "rb") as fsrc, open(root_png, "wb") as fdst:
        fdst.write(fsrc.read())
    print(f"PNG copied to root: {root_png}")
else:
    print("Edge screenshot failed:", res.stderr)
