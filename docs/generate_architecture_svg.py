"""
Generator script for NMC-Opt Studio Publication-Ready Architecture Diagram.
Produces docs/nmc_opt_studio_architecture.svg with ultra-high visual quality.
"""
import os

def generate_architecture_svg():
    width = 2000
    height = 2750

    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">')
    svg.append('<defs>')
    
    # Gradients
    svg.append('''
      <!-- Background Gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090D16"/>
        <stop offset="50%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#0A0E1A"/>
      </linearGradient>

      <!-- Layer 1 Gradient: Cool Blue/Slate -->
      <linearGradient id="l1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#0F172A" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="l1CardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B"/>
        <stop offset="100%" stop-color="#172033"/>
      </linearGradient>

      <!-- Layer 2 Gradient: Emerald Green/Teal -->
      <linearGradient id="l2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#064E3B" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#022C22" stop-opacity="0.7"/>
      </linearGradient>
      <linearGradient id="l2CardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064E3B" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#033529" stop-opacity="0.95"/>
      </linearGradient>

      <!-- Layer 3 Gradient: Deep Indigo/Purple -->
      <linearGradient id="l3Grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#312E81" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#1E1B4B" stop-opacity="0.7"/>
      </linearGradient>
      <linearGradient id="l3CardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#312E81" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#24205C" stop-opacity="0.95"/>
      </linearGradient>

      <!-- Layer 4 Gradient: Warm Amber/Orange -->
      <linearGradient id="l4Grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#78350F" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#451A03" stop-opacity="0.65"/>
      </linearGradient>
      <linearGradient id="l4CardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#451A03" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#2D1102" stop-opacity="0.95"/>
      </linearGradient>

      <!-- Cyan/Copilot Gradient -->
      <linearGradient id="copilotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#083344" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#0E4A5C" stop-opacity="0.95"/>
      </linearGradient>

      <!-- Badge Gradients -->
      <linearGradient id="badgeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284C7"/>
        <stop offset="100%" stop-color="#38BDF8"/>
      </linearGradient>
      <linearGradient id="badgeGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="100%" stop-color="#34D399"/>
      </linearGradient>
      <linearGradient id="badgePurple" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6366F1"/>
        <stop offset="100%" stop-color="#A855F7"/>
      </linearGradient>
      <linearGradient id="badgeAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#FBBF24"/>
      </linearGradient>
      <linearGradient id="badgeCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0891B2"/>
        <stop offset="100%" stop-color="#22D3EE"/>
      </linearGradient>

      <!-- Drop Shadow Filter -->
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
      <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>

      <!-- Marker Arrowheads -->
      <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8"/>
      </marker>
      <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#34D399"/>
      </marker>
      <marker id="arrowPurple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#A855F7"/>
      </marker>
      <marker id="arrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#FBBF24"/>
      </marker>
      <marker id="arrowCyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#22D3EE"/>
      </marker>
    ''')
    
    # Styles
    svg.append('''
      <style>
        .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .font-mono { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; }
        .title-main { font-size: 34px; font-weight: 800; fill: #FFFFFF; letter-spacing: -0.5px; }
        .subtitle-main { font-size: 15px; font-weight: 500; fill: #94A3B8; letter-spacing: 0.5px; }
        .swimlane-title { font-size: 16px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
        .card-title { font-size: 15px; font-weight: 700; fill: #F8FAFC; }
        .card-subtitle { font-size: 11px; font-weight: 500; fill: #94A3B8; }
        .body-text { font-size: 11.5px; font-weight: 400; fill: #CBD5E1; line-height: 1.45; }
        .code-pill { font-size: 10px; font-weight: 600; font-family: "SFMono-Regular", Consolas, monospace; }
        .badge-text { font-size: 9.5px; font-weight: 700; fill: #FFFFFF; letter-spacing: 0.5px; }
      </style>
    ''')
    svg.append('</defs>')

    # Canvas Background
    svg.append(f'<rect width="{width}" height="{height}" fill="url(#bgGrad)"/>')
    
    # Subtle Background Grid Pattern
    svg.append('<g opacity="0.04">')
    for x in range(0, width, 50):
        svg.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{height}" stroke="#FFFFFF" stroke-width="1"/>')
    for y in range(0, height, 50):
        svg.append(f'<line x1="0" y1="{y}" x2="{width}" y2="{y}" stroke="#FFFFFF" stroke-width="1"/>')
    svg.append('</g>')

    # =========================================================================
    # GLOBAL HEADER & SYSTEM BANNER
    # =========================================================================
    svg.append(f'''
    <!-- Top System Header Banner -->
    <g transform="translate(60, 45)">
      <!-- Outer Banner Frame -->
      <rect width="1880" height="95" rx="14" fill="#0F172A" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
      <rect width="1880" height="95" rx="14" fill="none" stroke="url(#badgeBlue)" stroke-width="1" opacity="0.6"/>
      
      <!-- System Title & Meta -->
      <text x="35" y="42" class="font-sans title-main">NMC-Opt Studio: Near-Memory Compiler Optimization Workbench</text>
      <text x="35" y="70" class="font-sans subtitle-main">Publication-Grade Architectural Blueprint • 4-Layer Adaptive Data-Movement-Aware Compiler Optimization Pipeline &amp; Silicon Telemetry</text>
      
      <!-- Right Status Badges -->
      <g transform="translate(1330, 26)">
        <!-- Badge 1: Backend Connection -->
        <rect width="155" height="42" rx="8" fill="#1E293B" stroke="#059669" stroke-width="1.5"/>
        <circle cx="20" cy="21" r="5" fill="#10B981"/>
        <text x="34" y="25" class="font-sans" font-size="11" font-weight="700" fill="#34D399">FastAPI Core 200 OK</text>
        <text x="34" y="36" class="font-mono" font-size="8.5" fill="#6EE7B7">127.0.0.1:8008</text>
      </g>
      <g transform="translate(1500, 26)">
        <!-- Badge 2: Frontend Client -->
        <rect width="165" height="42" rx="8" fill="#1E293B" stroke="#0284C7" stroke-width="1.5"/>
        <circle cx="20" cy="21" r="5" fill="#38BDF8"/>
        <text x="34" y="25" class="font-sans" font-size="11" font-weight="700" fill="#38BDF8">React 18 + Vite Hot</text>
        <text x="34" y="36" class="font-mono" font-size="8.5" fill="#7DD3FC">localhost:5173</text>
      </g>
      <g transform="translate(1680, 26)">
        <!-- Badge 3: Hardware Target Profile -->
        <rect width="165" height="42" rx="8" fill="#1E293B" stroke="#8B5CF6" stroke-width="1.5"/>
        <text x="18" y="24" class="font-sans" font-size="10.5" font-weight="700" fill="#C4B5FD">16-Bank PIM • TSV</text>
        <text x="18" y="36" class="font-sans" font-size="9" fill="#DDD6FE">1024 GB/s Aggregate</text>
      </g>
    </g>
    ''')

    # =========================================================================
    # LAYER 1: CLIENT INTERACTION & CORE WORKSPACES LAYER (TOP SWIMLANE)
    # Y-Range: 165 -> 530 (Height: 365)
    # =========================================================================
    l1_y = 165
    l1_h = 365
    svg.append(f'''
    <!-- LAYER 1 SWIMLANE CONTAINER -->
    <g transform="translate(60, {l1_y})">
      <rect width="1880" height="{l1_h}" rx="16" fill="url(#l1Grad)" stroke="#38BDF8" stroke-width="2" stroke-dasharray="6,4" filter="url(#shadow)"/>
      
      <!-- Layer Header Label Tab -->
      <g transform="translate(25, -14)">
        <rect width="640" height="28" rx="6" fill="#0284C7"/>
        <text x="18" y="19" class="font-sans swimlane-title" fill="#FFFFFF">LAYER 1: CLIENT INTERACTION &amp; INTERACTIVE WORKSPACES (FRONTEND TIER)</text>
      </g>

      <!-- Subtitle & Meta -->
      <text x="680" y="8" class="font-sans" font-size="11.5" font-weight="500" fill="#94A3B8">React 18 Component Hierarchy • View Switching • User Parameter Tuning • Real-Time Telemetry Monitor</text>
      
      <!-- 4 Horizontal Boxes in Layer 1 -->
      
      <!-- BOX 1.1: Web UI Dashboard & Global Controls -->
      <g transform="translate(30, 35)">
        <rect width="425" height="305" rx="12" fill="url(#l1CardGrad)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
        <!-- Header -->
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 413 0 C 419.63 0 425 5.37 425 12 L 425 40 L 0 40 Z" fill="#1E293B"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#38BDF8"/>
        <text x="30" y="25" class="font-sans card-title">Box 1.1: Web UI Dashboard</text>
        <text x="290" y="25" class="font-mono" font-size="9.5" fill="#38BDF8">FastAPI Live Header</text>

        <!-- Content list -->
        <g transform="translate(20, 55)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Live Engine Status Monitor:</tspan> Heartbeat polling (/api/health)</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Architectural Parameter Modal:</tspan> Configures R_cpu, beta_cpu,</text>
          <text x="10" y="52" class="font-mono body-text" fill="#93C5FD">R_dpu (1.2 GHz), beta_tsv (1024 GB/s), beta_link (64 GB/s)</text>
          <text x="0" y="74" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Latency Overhead Sliders:</tspan> alpha_h2n (20 us), alpha_sync (10 us)</text>
          <text x="0" y="94" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• User Profile &amp; Auth State:</tspan> LocalStorage persistence</text>
          <text x="0" y="114" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Quick Action Shortcuts:</tspan> Ctrl+B sidebar toggle, JSON config export</text>
          
          <!-- Mini UI Controls Box -->
          <g transform="translate(0, 135)">
            <rect width="385" height="95" rx="8" fill="#0B132B" stroke="#1E293B" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">[ACTIVE PROFILE SETTINGS]</text>
            <text x="12" y="40" class="font-mono" font-size="9.5" fill="#E2E8F0">Host CPU: 45.0 GFLOPS | DDR4: 28.0 GB/s</text>
            <text x="12" y="58" class="font-mono" font-size="9.5" fill="#E2E8F0">NMC DPU: 32.0 GFLOPS | TSV: 160.0 GB/s (1024 Peak)</text>
            <text x="12" y="76" class="font-mono" font-size="9.5" fill="#34D399">Link: PCIe Gen5/CXL 64 GB/s | Overheads: 40 us</text>
          </g>
        </g>
      </g>

      <!-- BOX 1.2: Home Hub & Optimization Workbench -->
      <g transform="translate(485, 35)">
        <rect width="440" height="305" rx="12" fill="url(#l1CardGrad)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
        <!-- Header -->
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 428 0 C 434.63 0 440 5.37 440 12 L 440 40 L 0 40 Z" fill="#1E293B"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#38BDF8"/>
        <text x="30" y="25" class="font-sans card-title">Box 1.2: Home Hub &amp; Workbench Workspaces</text>
        <text x="345" y="25" class="font-mono" font-size="9.5" fill="#38BDF8">Interactive</text>

        <g transform="translate(20, 55)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• HomeView:</tspan> Memory Wall pedagogy, interactive bandwidth gap</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• WorkbenchView:</tspan> Core compiler evaluation dashboard</text>
          <text x="0" y="55" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Workload Dimension Slider:</tspan> Array size N: 10^2 to 10^8 items</text>
          <text x="0" y="75" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Matrix Dim Selectors:</tspan> Rows N (16 to 4096), Cols M (16 to 4096)</text>
          <text x="0" y="95" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Transformation Toggles:</tspan> Enable Loop Fusion, Bank Tiling</text>
          <text x="0" y="115" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Live Recommendation Banner:</tspan> Direct NMC vs CPU Verdict</text>

          <!-- Strategy mini-tags -->
          <g transform="translate(0, 135)">
            <rect width="395" height="95" rx="8" fill="#0B132B" stroke="#1E293B" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">[4 EVALUATED CANDIDATE STRATEGIES]</text>
            <g transform="translate(12, 35)">
              <rect width="85" height="22" rx="4" fill="#1E293B" stroke="#475569"/>
              <text x="8" y="15" class="font-mono" font-size="8.5" fill="#CBD5E1">1. CPU-Only</text>
              <rect x="95" width="85" height="22" rx="4" fill="#064E3B" stroke="#10B981"/>
              <text x="103" y="15" class="font-mono" font-size="8.5" fill="#6EE7B7">2. Direct NMC</text>
              <rect x="190" width="95" height="22" rx="4" fill="#312E81" stroke="#6366F1"/>
              <text x="198" y="15" class="font-mono" font-size="8.5" fill="#C7D2FE">3. NMC+Fusion</text>
              <rect x="295" width="90" height="22" rx="4" fill="#78350F" stroke="#F59E0B"/>
              <text x="303" y="15" class="font-mono" font-size="8.5" fill="#FDE68A">4. NMC+Tiling</text>
            </g>
            <text x="12" y="80" class="font-sans" font-size="9.5" fill="#94A3B8">Computes min-latency path across heterogeneous hardware targets.</text>
          </g>
        </g>
      </g>

      <!-- BOX 1.3: Execution Simulator & Code Ingestion Controls -->
      <g transform="translate(955, 35)">
        <rect width="440" height="305" rx="12" fill="url(#l1CardGrad)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 428 0 C 434.63 0 440 5.37 440 12 L 440 40 L 0 40 Z" fill="#1E293B"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#38BDF8"/>
        <text x="30" y="25" class="font-sans card-title">Box 1.3: Simulator &amp; Code Ingestion Controls</text>
        <text x="320" y="25" class="font-mono" font-size="9.5" fill="#38BDF8">Simulator UI</text>

        <g transform="translate(20, 55)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• SimulatorView:</tspan> Instruction trace execution &amp; step debugger</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• FileUploadModal:</tspan> Drag-and-drop custom C loop kernels</text>
          <text x="0" y="55" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• MemoryLayoutView:</tspan> Visual 16-bank striping vs row conflicts</text>
          <text x="0" y="75" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• PipelineView:</tspan> Visual 7-stage compiler lowering animation</text>
          <text x="0" y="95" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• IRModal:</tspan> Full-screen three-address code inspector</text>
          <text x="0" y="115" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• ExplanationModal:</tspan> Math proofs &amp; crossover derivation</text>

          <g transform="translate(0, 135)">
            <rect width="395" height="95" rx="8" fill="#0B132B" stroke="#1E293B" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">[SIMULATOR CONTROLS &amp; MODES]</text>
            <text x="12" y="40" class="font-sans" font-size="10" fill="#E2E8F0">• Step-by-Step Cycle Clock • Bank Collision Logger</text>
            <text x="12" y="58" class="font-sans" font-size="10" fill="#E2E8F0">• Cache Hit/Miss Monitor: L1 (32KB), L2 (512KB), L3 (16MB)</text>
            <text x="12" y="76" class="font-sans" font-size="10" fill="#34D399">• DRAM Row Buffer State: Active Row, Precharge, Burst TSV</text>
          </g>
        </g>
      </g>

      <!-- BOX 1.4: Compiler Copilot AI Chat Widget -->
      <g transform="translate(1425, 35)">
        <rect width="425" height="305" rx="12" fill="url(#copilotGrad)" stroke="#22D3EE" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 413 0 C 419.63 0 425 5.37 425 12 L 425 40 L 0 40 Z" fill="#083344"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#22D3EE"/>
        <text x="30" y="25" class="font-sans card-title" fill="#E0F2FE">Box 1.4: Compiler Copilot AI</text>
        <rect x="330" y="10" width="75" height="20" rx="10" fill="#0891B2"/>
        <text x="342" y="24" class="font-sans badge-text">ACTIVE AI</text>

        <g transform="translate(20, 55)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#E0F2FE">• Conversational Q&amp;A:</tspan> Context-aware compiler assistant</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#E0F2FE">• Real-Time State Inspection:</tspan> Reads active kernel facts</text>
          <text x="0" y="55" class="font-sans body-text"><tspan font-weight="700" fill="#E0F2FE">• Bottleneck Detective:</tspan> Explains PCIe vs DRAM bus bounds</text>
          <text x="0" y="75" class="font-sans body-text"><tspan font-weight="700" fill="#E0F2FE">• DPU Kernel Synthesis:</tspan> Emits C code with __mram_ptr</text>

          <!-- Chat UI Mockup Box -->
          <g transform="translate(0, 95)">
            <rect width="385" height="135" rx="8" fill="#041F2B" stroke="#0E7490" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="9.5" fill="#38BDF8">&gt; "Why did compiler pick Direct NMC?"</text>
            <text x="12" y="38" class="font-sans" font-size="9.5" fill="#A5F3FC">AI: "VADD has AI=0.083 FLOP/B. At N=2M, DDR4 bus stalls</text>
            <text x="12" y="52" class="font-sans" font-size="9.5" fill="#A5F3FC">for 0.81ms. In-memory TSV executes in 0.14ms (1.15x speedup)."</text>
            
            <g transform="translate(10, 68)">
              <rect width="170" height="20" rx="4" fill="#083344" stroke="#0891B2"/>
              <text x="8" y="14" class="font-sans" font-size="8.5" fill="#67E8F9">Show DPU C Code</text>
              <rect x="180" width="180" height="20" rx="4" fill="#083344" stroke="#0891B2"/>
              <text x="188" y="14" class="font-sans" font-size="8.5" fill="#67E8F9">Explain Crossover Formula</text>
            </g>
            <g transform="translate(10, 95)">
              <rect width="170" height="20" rx="4" fill="#083344" stroke="#0891B2"/>
              <text x="8" y="14" class="font-sans" font-size="8.5" fill="#67E8F9">Why Not Loop Fusion?</text>
              <rect x="180" width="180" height="20" rx="4" fill="#083344" stroke="#0891B2"/>
              <text x="188" y="14" class="font-sans" font-size="8.5" fill="#67E8F9">Show 16-Bank Layout</text>
            </g>
          </g>
        </g>
      </g>
    </g>
    ''')

    # VERTICAL CONNECTOR ARROWS: Layer 1 -> Layer 2
    svg.append(f'''
    <!-- Inter-layer Flow: Layer 1 -> Layer 2 -->
    <g stroke="#38BDF8" stroke-width="2.5" fill="none">
      <path d="M 270 {l1_y + l1_h} L 270 {l1_y + l1_h + 45}" marker-end="url(#arrowBlue)"/>
      <path d="M 705 {l1_y + l1_h} L 705 {l1_y + l1_h + 45}" marker-end="url(#arrowBlue)"/>
      <path d="M 1175 {l1_y + l1_h} L 1175 {l1_y + l1_h + 45}" marker-end="url(#arrowBlue)"/>
      <path d="M 1635 {l1_y + l1_h} L 1635 {l1_y + l1_h + 45}" marker-end="url(#arrowCyan)"/>
    </g>
    ''')

    # =========================================================================
    # LAYER 2: WORKLOAD INGESTION & DATA PROFILING LAYER (SECOND SWIMLANE)
    # Y-Range: 575 -> 955 (Height: 380)
    # =========================================================================
    l2_y = 575
    l2_h = 380
    svg.append(f'''
    <!-- LAYER 2 SWIMLANE CONTAINER -->
    <g transform="translate(60, {l2_y})">
      <rect width="1880" height="{l2_h}" rx="16" fill="url(#l2Grad)" stroke="#10B981" stroke-width="2" stroke-dasharray="6,4" filter="url(#shadow)"/>
      
      <!-- Layer Header Label Tab -->
      <g transform="translate(25, -14)">
        <rect width="660" height="28" rx="6" fill="#059669"/>
        <text x="18" y="19" class="font-sans swimlane-title" fill="#FFFFFF">LAYER 2: WORKLOAD INGESTION &amp; DATA PROFILING SUBSYSTEM</text>
      </g>
      <text x="700" y="8" class="font-sans" font-size="11.5" font-weight="500" fill="#A7F3D0">Static Polyhedral Analysis • C Parsing • Loop Extraction • Arithmetic Intensity • Memory Stride Classification</text>

      <!-- 4 Horizontal Submodules in Layer 2 -->
      
      <!-- SUBMODULE 2.1: Custom C Kernel Ingestion -->
      <g transform="translate(30, 35)">
        <rect width="425" height="320" rx="12" fill="url(#l2CardGrad)" stroke="#047857" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 413 0 C 419.63 0 425 5.37 425 12 L 425 40 L 0 40 Z" fill="#064E3B"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#34D399"/>
        <text x="30" y="25" class="font-sans card-title">Sub-Module 2.1: Custom C Kernel Ingestion</text>
        <text x="325" y="25" class="font-mono" font-size="9.5" fill="#6EE7B7">.c AST Parser</text>

        <g transform="translate(20, 55)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• .c Source File Upload Modal:</tspan> User custom loop parser</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Regex AST Parser:</tspan> Single &amp; nested for-loop headers</text>
          <text x="10" y="52" class="font-mono body-text" fill="#A7F3D0">for (int i = 0; i &lt; N; ++i) {{ ... }}</text>
          <text x="0" y="74" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Operator Counting Engine:</tspan> +, -, *, /, &gt;, &lt;, ==</text>
          <text x="0" y="94" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Array Reference Extractor:</tspan> Loads/Stores (A[i], B[i])</text>
          <text x="0" y="114" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• LHS Write Target Detector:</tspan> Identifies output array C[i]</text>
          <text x="0" y="134" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Reduction Accumulator Detector:</tspan> (+=, *=, sum =)</text>

          <g transform="translate(0, 155)">
            <rect width="385" height="90" rx="8" fill="#022C22" stroke="#065F46" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="10" font-weight="700" fill="#34D399">[PARSED KERNEL AST SNIPPET]</text>
            <text x="12" y="38" class="font-mono" font-size="9" fill="#E2E8F0">void custom_kernel(float* A, float* B, float* C) {{</text>
            <text x="24" y="54" class="font-mono" font-size="9" fill="#A7F3D0">#pragma loop_bound min(100) max(10000000)</text>
            <text x="24" y="70" class="font-mono" font-size="9" fill="#E2E8F0">for(int i=0; i&lt;N; ++i) C[i] = A[i] * 2.0f + B[i];</text>
            <text x="12" y="84" class="font-mono" font-size="9" fill="#E2E8F0">}}</text>
          </g>
        </g>
      </g>

      <!-- SUBMODULE 2.2: 6 Active Benchmark Kernels -->
      <g transform="translate(485, 35)">
        <rect width="440" height="320" rx="12" fill="url(#l2CardGrad)" stroke="#047857" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 428 0 C 434.63 0 440 5.37 440 12 L 440 40 L 0 40 Z" fill="#064E3B"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#34D399"/>
        <text x="30" y="25" class="font-sans card-title">Sub-Module 2.2: 6 Active Benchmark Kernels</text>
        <text x="345" y="25" class="font-mono" font-size="9.5" fill="#6EE7B7">Catalog</text>

        <g transform="translate(20, 55)">
          <!-- Benchmark cards grid -->
          <g transform="translate(0, 0)">
            <rect width="190" height="60" rx="6" fill="#022C22" stroke="#047857" stroke-width="1"/>
            <text x="10" y="18" class="font-mono" font-size="10" font-weight="700" fill="#34D399">1. Vector Add (VADD)</text>
            <text x="10" y="34" class="font-mono" font-size="8.5" fill="#E2E8F0">C[i] = A[i] + B[i]</text>
            <text x="10" y="49" class="font-mono" font-size="8.5" fill="#FBBF24">AI: 0.083 FLOP/B • Memory</text>
          </g>

          <g transform="translate(205, 0)">
            <rect width="190" height="60" rx="6" fill="#022C22" stroke="#047857" stroke-width="1"/>
            <text x="10" y="18" class="font-mono" font-size="10" font-weight="700" fill="#34D399">2. Sum Reduction</text>
            <text x="10" y="34" class="font-mono" font-size="8.5" fill="#E2E8F0">sum += A[i]</text>
            <text x="10" y="49" class="font-mono" font-size="8.5" fill="#FBBF24">AI: 0.250 FLOP/B • Collective</text>
          </g>

          <g transform="translate(0, 68)">
            <rect width="190" height="60" rx="6" fill="#022C22" stroke="#047857" stroke-width="1"/>
            <text x="10" y="18" class="font-mono" font-size="10" font-weight="700" fill="#34D399">3. ReLU Activation</text>
            <text x="10" y="34" class="font-mono" font-size="8.5" fill="#E2E8F0">Y[i] = max(0.0f, X[i])</text>
            <text x="10" y="49" class="font-mono" font-size="8.5" fill="#FBBF24">AI: 0.125 FLOP/B • Unary</text>
          </g>

          <g transform="translate(205, 68)">
            <rect width="190" height="60" rx="6" fill="#022C22" stroke="#047857" stroke-width="1"/>
            <text x="10" y="18" class="font-mono" font-size="10" font-weight="700" fill="#34D399">4. Matrix-Vector (GEMV)</text>
            <text x="10" y="34" class="font-mono" font-size="8.5" fill="#E2E8F0">Y[i] += A[i][j] * X[j]</text>
            <text x="10" y="49" class="font-mono" font-size="8.5" fill="#FBBF24">AI: 0.500 FLOP/B • 2D Tiling</text>
          </g>

          <g transform="translate(0, 136)">
            <rect width="190" height="60" rx="6" fill="#022C22" stroke="#047857" stroke-width="1"/>
            <text x="10" y="18" class="font-mono" font-size="10" font-weight="700" fill="#34D399">5. Scaled Add (AXPY)</text>
            <text x="10" y="34" class="font-mono" font-size="8.5" fill="#E2E8F0">Y[i] = alpha * X[i] + Y[i]</text>
            <text x="10" y="49" class="font-mono" font-size="8.5" fill="#FBBF24">AI: 0.167 FLOP/B • Fused</text>
          </g>

          <g transform="translate(205, 136)">
            <rect width="190" height="60" rx="6" fill="#022C22" stroke="#047857" stroke-width="1"/>
            <text x="10" y="18" class="font-mono" font-size="10" font-weight="700" fill="#34D399">6. Elementwise Mul</text>
            <text x="10" y="34" class="font-mono" font-size="8.5" fill="#E2E8F0">C[i] = A[i] * B[i]</text>
            <text x="10" y="49" class="font-mono" font-size="8.5" fill="#FBBF24">AI: 0.083 FLOP/B • Pointwise</text>
          </g>

          <text x="5" y="218" class="font-sans" font-size="10" fill="#94A3B8">Covers memory-bound streaming, reductions, 2D dense linear algebra, and deep learning activations.</text>
        </g>
      </g>

      <!-- SUBMODULE 2.3: AST Loop Profiler & Induction Bounds Check Engine -->
      <g transform="translate(955, 35)">
        <rect width="440" height="320" rx="12" fill="url(#l2CardGrad)" stroke="#047857" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 428 0 C 434.63 0 440 5.37 440 12 L 440 40 L 0 40 Z" fill="#064E3B"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#34D399"/>
        <text x="30" y="25" class="font-sans card-title">Sub-Module 2.3: Loop Profiler &amp; Bounds Engine</text>
        <text x="325" y="25" class="font-mono" font-size="9.5" fill="#6EE7B7">Loop Bounds</text>

        <g transform="translate(20, 55)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Induction Variable Detection:</tspan> Resolves canonical loop index</text>
          <text x="10" y="32" class="font-mono body-text" fill="#A7F3D0">i in [0, N) and outer: i, inner: j in [0, M)</text>
          <text x="0" y="52" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Trip Count Evaluator:</tspan> Dynamic bounds (N=100 to 100,000,000)</text>
          <text x="0" y="72" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Stride Pattern Profiler:</tspan> Identifies Unit-Stride (1 float = 4B),</text>
          <text x="10" y="89" class="font-sans body-text" fill="#A7F3D0">Row-Major Matrix Scan, or Stride S bank hazard</text>
          <text x="0" y="110" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Temporal Reuse Factor (rho):</tspan> rho = 1.0 (Stream) vs rho = N (GEMV)</text>
          <text x="0" y="130" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Host Cache Spilling Detector:</tspan> Working set vs L1/L2/L3 size</text>

          <g transform="translate(0, 155)">
            <rect width="395" height="90" rx="8" fill="#022C22" stroke="#065F46" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="10" font-weight="700" fill="#34D399">[LOOP CHARACTERIZATION OUTPUT]</text>
            <text x="12" y="38" class="font-mono" font-size="9.5" fill="#E2E8F0">Pattern: 1D Sequential Streaming Pointwise</text>
            <text x="12" y="55" class="font-mono" font-size="9.5" fill="#E2E8F0">Data Type: float32 (4 Bytes/elem) | Reuse: 1.0x</text>
            <text x="12" y="72" class="font-mono" font-size="9.5" fill="#F87171">Cache Status: Working Set &gt; 16MB L3 (Cache Spilling!)</text>
          </g>
        </g>
      </g>

      <!-- SUBMODULE 2.4: Workload Data Characterization Module -->
      <g transform="translate(1425, 35)">
        <rect width="425" height="320" rx="12" fill="url(#l2CardGrad)" stroke="#047857" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 413 0 C 419.63 0 425 5.37 425 12 L 425 40 L 0 40 Z" fill="#064E3B"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#34D399"/>
        <text x="30" y="25" class="font-sans card-title">Sub-Module 2.4: Workload Data Characterization</text>
        <text x="325" y="25" class="font-mono" font-size="9.5" fill="#6EE7B7">Metrics</text>

        <g transform="translate(20, 55)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Total FLOPs Engine:</tspan> Computes N * (ops_per_iteration)</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Bytes Read Counter:</tspan> N * num_loads * 4 Bytes</text>
          <text x="0" y="55" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Bytes Written Counter:</tspan> N * num_stores * 4 Bytes</text>
          <text x="0" y="75" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Total Traffic Volume:</tspan> MB moved across memory system</text>
          <text x="0" y="95" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Arithmetic Intensity (AI):</tspan> AI = FLOPs / Total Bytes</text>

          <!-- 3 KPI Badge Boxes -->
          <g transform="translate(0, 115)">
            <rect width="385" height="40" rx="6" fill="#022C22" stroke="#047857"/>
            <text x="15" y="25" class="font-mono" font-size="11" font-weight="700" fill="#6EE7B7">Total Operations: 2,000,000 FLOPs</text>
          </g>
          <g transform="translate(0, 162)">
            <rect width="385" height="40" rx="6" fill="#022C22" stroke="#047857"/>
            <text x="15" y="25" class="font-mono" font-size="11" font-weight="700" fill="#6EE7B7">Total Memory Volume: 22.89 MB Moved</text>
          </g>
          <g transform="translate(0, 209)">
            <rect width="385" height="40" rx="6" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
            <text x="15" y="25" class="font-mono" font-size="11" font-weight="800" fill="#FBBF24">AI: 0.0833 FLOP/Byte (Memory-Bound!)</text>
          </g>
        </g>
      </g>
    </g>
    ''')

    # VERTICAL CONNECTOR ARROWS: Layer 2 -> Layer 3
    svg.append(f'''
    <!-- Inter-layer Flow: Layer 2 -> Layer 3 -->
    <g stroke="#34D399" stroke-width="2.5" fill="none">
      <path d="M 270 {l2_y + l2_h} L 270 {l2_y + l2_h + 45}" marker-end="url(#arrowGreen)"/>
      <path d="M 705 {l2_y + l2_h} L 705 {l2_y + l2_h + 45}" marker-end="url(#arrowGreen)"/>
      <path d="M 1175 {l2_y + l2_h} L 1175 {l2_y + l2_h + 45}" marker-end="url(#arrowGreen)"/>
      <path d="M 1635 {l2_y + l2_h} L 1635 {l2_y + l2_h + 45}" marker-end="url(#arrowGreen)"/>
    </g>
    ''')

    # =========================================================================
    # LAYER 3: NMC-OPT CORE ENGINE & SIMULATION (CENTER SWIMLANE - CORE BRAIN)
    # Y-Range: 1000 -> 1490 (Height: 490)
    # =========================================================================
    l3_y = 1000
    l3_h = 490
    svg.append(f'''
    <!-- LAYER 3 SWIMLANE CONTAINER -->
    <g transform="translate(60, {l3_y})">
      <rect width="1880" height="{l3_h}" rx="16" fill="url(#l3Grad)" stroke="#818CF8" stroke-width="2" stroke-dasharray="6,4" filter="url(#shadow)"/>
      
      <!-- Layer Header Label Tab -->
      <g transform="translate(25, -14)">
        <rect width="660" height="28" rx="6" fill="#4338CA"/>
        <text x="18" y="19" class="font-sans swimlane-title" fill="#FFFFFF">LAYER 3: NMC-OPT CORE COMPILER ENGINE &amp; HARDWARE SIMULATION</text>
      </g>
      <text x="700" y="8" class="font-sans" font-size="11.5" font-weight="500" fill="#C7D2FE">Analytical Cost Modeling • 7-Stage Compiler Pipeline • Cycle-Accurate Execution Trace • Bank Conflict Engine</text>

      <!-- 3 Central Heavyweight Blocks in Layer 3 -->

      <!-- BLOCK 3A: 7-Stage Compiler Decision Pipeline -->
      <g transform="translate(30, 35)">
        <rect width="580" height="430" rx="12" fill="url(#l3CardGrad)" stroke="#4F46E5" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 568 0 C 574.63 0 580 5.37 580 12 L 580 40 L 0 40 Z" fill="#312E81"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#818CF8"/>
        <text x="30" y="25" class="font-sans card-title">Block 3A: 7-Stage Compiler Decision Pipeline</text>
        <text x="470" y="25" class="font-mono" font-size="9.5" fill="#A5B4FC">Pipeline Core</text>

        <!-- 7 Stages vertically connected -->
        <g transform="translate(20, 50)">
          <!-- Stage 1 -->
          <g transform="translate(0, 0)">
            <rect width="540" height="42" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <circle cx="22" cy="21" r="11" fill="#4F46E5"/>
            <text x="18" y="25" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF">1</text>
            <text x="42" y="25" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Source Intake:</text>
            <text x="135" y="25" class="font-sans body-text">C Source (.c file upload) or Built-in Benchmark AST kernel</text>
          </g>

          <!-- Stage 2 -->
          <g transform="translate(0, 52)">
            <rect width="540" height="42" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <circle cx="22" cy="21" r="11" fill="#4F46E5"/>
            <text x="18" y="25" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF">2</text>
            <text x="42" y="25" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Validation:</text>
            <text x="115" y="25" class="font-sans body-text">Supported loop grammar verification &amp; non-affine bounds check</text>
          </g>

          <!-- Stage 3 -->
          <g transform="translate(0, 104)">
            <rect width="540" height="42" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <circle cx="22" cy="21" r="11" fill="#4F46E5"/>
            <text x="18" y="25" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF">3</text>
            <text x="42" y="25" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Loop Profiling:</text>
            <text x="135" y="25" class="font-sans body-text">Memory access profiling (AI, total bytes, cache reuse factor)</text>
          </g>

          <!-- Stage 4 -->
          <g transform="translate(0, 156)">
            <rect width="540" height="42" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <circle cx="22" cy="21" r="11" fill="#4F46E5"/>
            <text x="18" y="25" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF">4</text>
            <text x="42" y="25" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">SSA IR Generation:</text>
            <text x="165" y="25" class="font-sans body-text">Three-address code, phi nodes, GEP pointer math</text>
          </g>

          <!-- Stage 5 -->
          <g transform="translate(0, 208)">
            <rect width="540" height="42" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <circle cx="22" cy="21" r="11" fill="#4F46E5"/>
            <text x="18" y="25" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF">5</text>
            <text x="42" y="25" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Cost Modeling:</text>
            <text x="140" y="25" class="font-sans body-text">First-principles T_cpu vs T_nmc + T_inter + T_layout + T_sync</text>
          </g>

          <!-- Stage 6 -->
          <g transform="translate(0, 260)">
            <rect width="540" height="42" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <circle cx="22" cy="21" r="11" fill="#4F46E5"/>
            <text x="18" y="25" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF">6</text>
            <text x="42" y="25" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Placement Matrix:</text>
            <text x="160" y="25" class="font-sans body-text">Evaluates Fusion, Bank Tiling, and 16-Bank Interleaving</text>
          </g>

          <!-- Stage 7 -->
          <g transform="translate(0, 312)">
            <rect width="540" height="48" rx="6" fill="#2E1065" stroke="#A855F7" stroke-width="1.5"/>
            <circle cx="22" cy="24" r="11" fill="#9333EA"/>
            <text x="18" y="28" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF">7</text>
            <text x="42" y="22" class="font-sans" font-size="12" font-weight="800" fill="#F0ABFC">Optimization Verdict &amp; Code Emission</text>
            <text x="42" y="38" class="font-mono" font-size="9.5" fill="#E9D5FF">Direct NMC Offload vs Host CPU • host_driver.c &amp; dpu_kernel.c</text>
          </g>
        </g>
      </g>

      <!-- BLOCK 3B: Interactive Hardware Execution Simulator -->
      <g transform="translate(635, 35)">
        <rect width="610" height="430" rx="12" fill="url(#l3CardGrad)" stroke="#4F46E5" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 598 0 C 604.63 0 610 5.37 610 12 L 610 40 L 0 40 Z" fill="#312E81"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#818CF8"/>
        <text x="30" y="25" class="font-sans card-title">Block 3B: Interactive Hardware Execution Simulator</text>
        <text x="495" y="25" class="font-mono" font-size="9.5" fill="#A5B4FC">Hardware Trace</text>

        <!-- Step simulation pipeline -->
        <g transform="translate(20, 50)">
          <!-- Step 1 -->
          <g transform="translate(0, 0)">
            <rect width="570" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="22" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Step 1: Host CPU Memory Allocation &amp; Pinned Buffers</text>
            <text x="15" y="40" class="font-sans body-text">Allocates contiguous operand arrays in host DDR4 RAM; pins memory for DMA engine.</text>
          </g>

          <!-- Step 2 -->
          <g transform="translate(0, 60)">
            <rect width="570" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="22" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Step 2: PCIe Gen5 / CXL Interconnect Packet Dispatch</text>
            <text x="15" y="40" class="font-sans body-text">Transfers arrays over link (beta_link=64 GB/s); incurs fixed latency (alpha_pcie=20 us).</text>
          </g>

          <!-- Step 3 -->
          <g transform="translate(0, 120)">
            <rect width="570" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="22" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Step 3: DRAM Bank Interleaving &amp; Memory Layout Padding</text>
            <text x="15" y="40" class="font-sans body-text">Modulo striping (Addr/64)%16; isolates row buffers; reduces conflict rate from 28.4% to 0.8%.</text>
          </g>

          <!-- Step 4 -->
          <g transform="translate(0, 180)">
            <rect width="570" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="22" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Step 4: In-Memory Parallel Compute (16 DPU Cores)</text>
            <text x="15" y="40" class="font-sans body-text">Direct TSV memory fetch (1024 GB/s peak); in-situ DPU RISC execution; avoids host DDR bus.</text>
          </g>

          <!-- Step 5 -->
          <g transform="translate(0, 240)">
            <rect width="570" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="22" class="font-sans" font-size="11.5" font-weight="700" fill="#E0E7FF">Step 5: Barrier Synchronization &amp; Host Result Writeback</text>
            <text x="15" y="40" class="font-sans body-text">DPU completion barrier (10 us); writes output array (or reduced scalar) back to host CPU.</text>
          </g>

          <!-- Timing Box -->
          <g transform="translate(0, 302)">
            <rect width="570" height="60" rx="6" fill="#0B132B" stroke="#312E81" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">[CYCLE-LEVEL TIMING VERIFICATION]</text>
            <text x="12" y="38" class="font-mono" font-size="9.5" fill="#E2E8F0">Row-Buffer Hit: t_CL = 13.75 ns | Row Conflict: t_RP + t_RCD = 45.00 ns</text>
            <text x="12" y="52" class="font-mono" font-size="9.5" fill="#34D399">Row Hit Rate: 97.4% • Memory Subsystem Energy Reduction: 79.5%</text>
          </g>
        </g>
      </g>

      <!-- BLOCK 3C: First-Principles Analytical Cost Engine -->
      <g transform="translate(1270, 35)">
        <rect width="580" height="430" rx="12" fill="url(#l3CardGrad)" stroke="#4F46E5" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 568 0 C 574.63 0 580 5.37 580 12 L 580 40 L 0 40 Z" fill="#312E81"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#818CF8"/>
        <text x="30" y="25" class="font-sans card-title">Block 3C: First-Principles Analytical Cost Engine</text>
        <text x="475" y="25" class="font-mono" font-size="9.5" fill="#A5B4FC">Cost Equations</text>

        <!-- Equations breakdown -->
        <g transform="translate(20, 50)">
          <!-- Eq 1 -->
          <g transform="translate(0, 0)">
            <rect width="540" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="19" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">Eq 1: T_cpu(N) = (ops / R_cpu) + (bytes / beta_host)</text>
            <text x="15" y="38" class="font-sans body-text">Models host compute ALU latency + DDR4 memory bus streaming stall latency.</text>
          </g>

          <!-- Eq 2 -->
          <g transform="translate(0, 60)">
            <rect width="540" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="19" class="font-mono" font-size="10" font-weight="700" fill="#34D399">Eq 2: T_nmc(N) = (ops / (M*R_dpu)) + (bytes / (M*beta_tsv))</text>
            <text x="15" y="38" class="font-sans body-text">Models 16-bank parallel DPU processing + 1024 GB/s internal TSV memory access.</text>
          </g>

          <!-- Eq 3 & 4 -->
          <g transform="translate(0, 120)">
            <rect width="540" height="52" rx="6" fill="#1E1B4B" stroke="#4338CA"/>
            <text x="15" y="19" class="font-mono" font-size="10" font-weight="700" fill="#FBBF24">Eq 3-4: T_inter = 2*alpha_pcie + (bytes / beta_link) + T_layout</text>
            <text x="15" y="38" class="font-sans body-text">Models DMA link serialization, buffer registration, and bank reorganization tax.</text>
          </g>

          <!-- Eq 5 & 6 -->
          <g transform="translate(0, 180)">
            <rect width="540" height="60" rx="6" fill="#2E1065" stroke="#A855F7" stroke-width="1.5"/>
            <text x="15" y="20" class="font-mono" font-size="10" font-weight="800" fill="#F0ABFC">Eq 6: N_crossover = T_fixed / (mu_cpu - mu_nmc)</text>
            <text x="15" y="38" class="font-sans body-text">Closed-form crossover solver: calculates exact N threshold where speedup S &gt; 1.0x.</text>
            <text x="15" y="52" class="font-mono" font-size="9" fill="#E9D5FF">VADD: 650,000 elems | REDUCE: 3.3M elems | GEMV: 5.7M elems</text>
          </g>

          <!-- Energy & Roofline Box -->
          <g transform="translate(0, 252)">
            <rect width="540" height="110" rx="6" fill="#0B132B" stroke="#312E81" stroke-width="1"/>
            <text x="12" y="20" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">[DATA MOVEMENT ENERGY TAX &amp; ROOFLINE BOUNDS]</text>
            <text x="12" y="40" class="font-sans" font-size="10" fill="#E2E8F0">• Off-Chip DDR4 Energy Tax: 20 pJ/bit (PCB traces &amp; DIMM bus)</text>
            <text x="12" y="58" class="font-sans" font-size="10" fill="#E2E8F0">• In-Memory TSV Energy Tax: &lt; 2 pJ/bit (3D stacked through-silicon vias)</text>
            <text x="12" y="76" class="font-sans" font-size="10" fill="#34D399">• Net Subsystem Energy Dissipation Savings: Up to 79.5% reduction</text>
            <text x="12" y="94" class="font-sans" font-size="10" fill="#FDE68A">• Classical Roofline Bound: Attainable GFLOPS = min(Peak, AI * Bandwidth)</text>
          </g>
        </g>
      </g>
    </g>
    ''')

    # VERTICAL CONNECTOR ARROWS: Layer 3 -> Layer 4
    svg.append(f'''
    <!-- Inter-layer Flow: Layer 3 -> Layer 4 -->
    <g stroke="#818CF8" stroke-width="2.5" fill="none">
      <path d="M 320 {l3_y + l3_h} L 320 {l3_y + l3_h + 45}" marker-end="url(#arrowPurple)"/>
      <path d="M 940 {l3_y + l3_h} L 940 {l3_y + l3_h + 45}" marker-end="url(#arrowPurple)"/>
      <path d="M 1560 {l3_y + l3_h} L 1560 {l3_y + l3_h + 45}" marker-end="url(#arrowPurple)"/>
    </g>
    ''')

    # =========================================================================
    # LAYER 4: ANALYTICAL VIEWS & COPILOT GUIDANCE LAYER (BOTTOM SWIMLANE)
    # Y-Range: 1535 -> 2660 (Height: 1125)
    # =========================================================================
    l4_y = 1535
    l4_h = 1130
    svg.append(f'''
    <!-- LAYER 4 SWIMLANE CONTAINER -->
    <g transform="translate(60, {l4_y})">
      <rect width="1880" height="{l4_h}" rx="16" fill="url(#l4Grad)" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6,4" filter="url(#shadow)"/>
      
      <!-- Layer Header Label Tab -->
      <g transform="translate(25, -14)">
        <rect width="700" height="28" rx="6" fill="#D97706"/>
        <text x="18" y="19" class="font-sans swimlane-title" fill="#FFFFFF">LAYER 4: ANALYTICAL VIEWS, EMPIRICAL CHARTS &amp; COPILOT GUIDANCE</text>
      </g>
      <text x="740" y="8" class="font-sans" font-size="11.5" font-weight="500" fill="#FDE68A">8 Comparative Visualizations • IR Inspector • Verdict Walkthrough • Empirical Paper Suite • CLI Guides</text>

      <!-- 6 Output Cards in Layer 4 (Arranged in a 3x2 Grid) -->

      <!-- CARD 4.1: Decision Walkthrough & Optimal Offload Verdict (Row 1, Left) -->
      <g transform="translate(30, 35)">
        <rect width="580" height="520" rx="12" fill="url(#l4CardGrad)" stroke="#B45309" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 568 0 C 574.63 0 580 5.37 580 12 L 580 40 L 0 40 Z" fill="#78350F"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#F59E0B"/>
        <text x="30" y="25" class="font-sans card-title">Output Card 4.1: Decision Walkthrough &amp; Verdict</text>
        <text x="480" y="25" class="font-mono" font-size="9.5" fill="#FCD34D">Verdict KPI</text>

        <g transform="translate(20, 50)">
          <!-- Large Verdict Banner -->
          <rect width="540" height="60" rx="8" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
          <text x="18" y="26" class="font-sans" font-size="11" font-weight="700" fill="#34D399">OPTIMIZATION RECOMMENDATION:</text>
          <text x="18" y="48" class="font-mono" font-size="14" font-weight="800" fill="#FFFFFF">DIRECT NMC OFFLOAD (1.26x SPEEDUP)</text>

          <!-- 4 KPI Cards -->
          <g transform="translate(0, 75)">
            <!-- KPI 1 -->
            <rect width="125" height="70" rx="6" fill="#1E293B" stroke="#334155"/>
            <text x="10" y="20" class="font-sans" font-size="9" fill="#94A3B8">EXECUTION LATENCY</text>
            <text x="10" y="44" class="font-mono" font-size="14" font-weight="800" fill="#F8FAFC">3.59 ms</text>
            <text x="10" y="60" class="font-sans" font-size="8.5" fill="#10B981">CPU: 4.51 ms</text>

            <!-- KPI 2 -->
            <g transform="translate(138, 0)">
              <rect width="125" height="70" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="20" class="font-sans" font-size="9" fill="#94A3B8">SPEEDUP VS CPU</text>
              <text x="10" y="44" class="font-mono" font-size="14" font-weight="800" fill="#38BDF8">1.26x</text>
              <text x="10" y="60" class="font-sans" font-size="8.5" fill="#38BDF8">Net Improvement</text>
            </g>

            <!-- KPI 3 -->
            <g transform="translate(276, 0)">
              <rect width="125" height="70" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="20" class="font-sans" font-size="9" fill="#94A3B8">BUS TRAFFIC CUT</text>
              <text x="10" y="44" class="font-mono" font-size="14" font-weight="800" fill="#34D399">-70.8%</text>
              <text x="10" y="60" class="font-sans" font-size="8.5" fill="#34D399">120MB -&gt; 35MB</text>
            </g>

            <!-- KPI 4 -->
            <g transform="translate(414, 0)">
              <rect width="125" height="70" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="20" class="font-sans" font-size="9" fill="#94A3B8">ENERGY SAVED</text>
              <text x="10" y="44" class="font-mono" font-size="14" font-weight="800" fill="#FBBF24">-79.5%</text>
              <text x="10" y="60" class="font-sans" font-size="8.5" fill="#FBBF24">2.34J -&gt; 0.48J</text>
            </g>
          </g>

          <!-- Dominant Bottleneck & Tradeoffs -->
          <g transform="translate(0, 160)">
            <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Dominant Factor:</tspan> Memory-bound on host DDR4 bus (95.1% stall time)</text>
            <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Crossover Threshold:</tspan> N_crossover = 650,000 items (7.4 MB)</text>
            <text x="0" y="55" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Workload Status:</tspan> N=10,000,000 &gt; 650,000 -&gt; Offload is highly profitable</text>
            
            <rect y="70" width="540" height="90" rx="8" fill="#1E293B" stroke="#334155"/>
            <text x="15" y="90" class="font-mono" font-size="10" font-weight="700" fill="#FBBF24">[ARCHITECTURAL TRADEOFF ANALYSIS]</text>
            <text x="15" y="110" class="font-sans" font-size="9.5" fill="#E2E8F0">1. Leverages 1024 GB/s aggregate internal TSV bandwidth across 16 banks.</text>
            <text x="15" y="128" class="font-sans" font-size="9.5" fill="#E2E8F0">2. Requires 2.89 ms initial PCIe Gen5 host-device streaming transfer.</text>
            <text x="15" y="146" class="font-sans" font-size="9.5" fill="#34D399">3. High data volume (114.4 MB) fully amortizes 40 us dispatch overhead.</text>
          </g>

          <!-- Candidate Strategy Ranking Table -->
          <g transform="translate(0, 335)">
            <rect width="540" height="120" rx="8" fill="#0B132B" stroke="#334155" stroke-width="1"/>
            <text x="12" y="18" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">[STRATEGY EVALUATION SUMMARY]</text>
            <g transform="translate(12, 30)">
              <text x="0" y="14" class="font-mono" font-size="9" fill="#94A3B8">Strategy</text>
              <text x="160" y="14" class="font-mono" font-size="9" fill="#94A3B8">Latency</text>
              <text x="250" y="14" class="font-mono" font-size="9" fill="#94A3B8">Speedup</text>
              <text x="350" y="14" class="font-mono" font-size="9" fill="#94A3B8">Verdict</text>
              <line x1="0" y1="20" x2="515" y2="20" stroke="#334155" stroke-width="1"/>
              
              <text x="0" y="38" class="font-mono" font-size="9" fill="#E2E8F0">CPU-Only</text>
              <text x="160" y="38" class="font-mono" font-size="9" fill="#E2E8F0">4.508 ms</text>
              <text x="250" y="38" class="font-mono" font-size="9" fill="#E2E8F0">1.00x</text>
              <text x="350" y="38" class="font-mono" font-size="9" fill="#94A3B8">Baseline</text>

              <text x="0" y="58" class="font-mono" font-size="9" font-weight="700" fill="#34D399">Direct NMC Offload</text>
              <text x="160" y="58" class="font-mono" font-size="9" font-weight="700" fill="#34D399">3.591 ms</text>
              <text x="250" y="58" class="font-mono" font-size="9" font-weight="700" fill="#34D399">1.26x</text>
              <text x="350" y="58" class="font-mono" font-size="9" font-weight="700" fill="#34D399">RECOMMENDED</text>

              <text x="0" y="78" class="font-mono" font-size="9" fill="#64748B">NMC + Loop Fusion</text>
              <text x="160" y="78" class="font-mono" font-size="9" fill="#64748B">0.000 ms</text>
              <text x="250" y="78" class="font-mono" font-size="9" fill="#64748B">0.00x</text>
              <text x="350" y="78" class="font-mono" font-size="9" fill="#F87171">Ineligible (1 loop)</text>
            </g>
          </g>
        </g>
      </g>

      <!-- CARD 4.2: SSA Intermediate Representation Inspector (Row 1, Middle) -->
      <g transform="translate(635, 35)">
        <rect width="610" height="520" rx="12" fill="url(#l4CardGrad)" stroke="#B45309" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 598 0 C 604.63 0 610 5.37 610 12 L 610 40 L 0 40 Z" fill="#78350F"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#F59E0B"/>
        <text x="30" y="25" class="font-sans card-title">Output Card 4.2: SSA Intermediate Representation (IR)</text>
        <text x="490" y="25" class="font-mono" font-size="9.5" fill="#FCD34D">Three-Address</text>

        <g transform="translate(20, 50)">
          <!-- IR Instruction Block -->
          <rect width="570" height="445" rx="8" fill="#0B132B" stroke="#334155" stroke-width="1"/>
          
          <g transform="translate(15, 20)">
            <text x="0" y="0" class="font-mono" font-size="9" font-weight="700" fill="#38BDF8">; Canonical Three-Address Code Lowered for Vector Addition</text>
            <text x="0" y="18" class="font-mono" font-size="8.5" fill="#E2E8F0"><tspan fill="#F59E0B">entry:</tspan>       fn_entry   vector_add(ptr %A, ptr %B, ptr %C, i32 %N)</text>
            <text x="0" y="34" class="font-mono" font-size="8.5" fill="#E2E8F0">             br         label %loop.cond</text>
            <text x="0" y="52" class="font-mono" font-size="8.5" fill="#E2E8F0"><tspan fill="#F59E0B">loop.cond:</tspan>   phi        i32 [%i, %loop.inc], [0, %entry]       <tspan fill="#64748B">; Induction i=0</tspan></text>
            <text x="0" y="68" class="font-mono" font-size="8.5" fill="#E2E8F0">             icmp_slt   %cmp = icmp slt i32 %i, %N             <tspan fill="#64748B">; i &lt; N</tspan></text>
            <text x="0" y="84" class="font-mono" font-size="8.5" fill="#E2E8F0">             br_cond    i1 %cmp, label %loop.body, label %exit</text>
            <text x="0" y="104" class="font-mono" font-size="8.5" fill="#E2E8F0"><tspan fill="#F59E0B">loop.body:</tspan>   gep        %ptrA = getelementptr float, ptr %A, i32 %i</text>
            <text x="0" y="120" class="font-mono" font-size="8.5" fill="#E2E8F0">             load       float %valA = load float, ptr %ptrA    <tspan fill="#34D399">; TSV Burst Read A[i]</tspan></text>
            <text x="0" y="136" class="font-mono" font-size="8.5" fill="#E2E8F0">             gep        %ptrB = getelementptr float, ptr %B, i32 %i</text>
            <text x="0" y="152" class="font-mono" font-size="8.5" fill="#E2E8F0">             load       float %valB = load float, ptr %ptrB    <tspan fill="#34D399">; TSV Burst Read B[i]</tspan></text>
            <text x="0" y="168" class="font-mono" font-size="8.5" fill="#E2E8F0">             fadd       float %sum = fadd float %valA, %valB   <tspan fill="#F59E0B">; In-Memory DPU ALU</tspan></text>
            <text x="0" y="184" class="font-mono" font-size="8.5" fill="#E2E8F0">             gep        %ptrC = getelementptr float, ptr %C, i32 %i</text>
            <text x="0" y="200" class="font-mono" font-size="8.5" fill="#E2E8F0">             store      store float %sum, ptr %ptrC            <tspan fill="#34D399">; TSV Burst Write C[i]</tspan></text>
            <text x="0" y="216" class="font-mono" font-size="8.5" fill="#E2E8F0">             br         label %loop.inc</text>
            <text x="0" y="234" class="font-mono" font-size="8.5" fill="#E2E8F0"><tspan fill="#F59E0B">loop.inc:</tspan>    add        i32 %i.next = add nsw i32 %i, 1        <tspan fill="#64748B">; i = i + 1</tspan></text>
            <text x="0" y="250" class="font-mono" font-size="8.5" fill="#E2E8F0">             br         label %loop.cond</text>
            <text x="0" y="268" class="font-mono" font-size="8.5" fill="#E2E8F0"><tspan fill="#F59E0B">exit:</tspan>        ret        void                                   <tspan fill="#64748B">; Return</tspan></text>
            
            <line x1="0" y1="285" x2="540" y2="285" stroke="#334155" stroke-width="1"/>
            
            <!-- Target Emission Code Snippets -->
            <text x="0" y="305" class="font-mono" font-size="9" font-weight="700" fill="#A855F7">[DUAL TARGET EMISSION: HOST DRIVER &amp; DPU C]</text>
            <text x="0" y="325" class="font-mono" font-size="8" fill="#93C5FD">// host_driver.c: Asynchronous PCIe Dispatch</text>
            <text x="0" y="338" class="font-mono" font-size="8" fill="#CBD5E1">nmc_buf_t bA = nmc_alloc_banked(dev, bytes, 16);</text>
            <text x="0" y="351" class="font-mono" font-size="8" fill="#CBD5E1">nmc_memcpy_to_dev_async(bA, A, bytes); nmc_kernel_launch(dev, "dpu_vadd");</text>
            
            <text x="0" y="375" class="font-mono" font-size="8" fill="#34D399">// dpu_kernel.c: In-Memory SPMD RISC Core</text>
            <text x="0" y="388" class="font-mono" font-size="8" fill="#CBD5E1">__dpu_entry void dpu_vadd() {{ int id = get_dpu_id();</text>
            <text x="0" y="401" class="font-mono" font-size="8" fill="#CBD5E1">  __mram_ptr float *local_A = get_bank_mram(0); ... }}</text>
          </g>
        </g>
      </g>

      <!-- CARD 4.3: 8 Dynamic Comparative Analytics Graphs (Row 1, Right) -->
      <g transform="translate(1270, 35)">
        <rect width="580" height="520" rx="12" fill="url(#l4CardGrad)" stroke="#B45309" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 568 0 C 574.63 0 580 5.37 580 12 L 580 40 L 0 40 Z" fill="#78350F"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#F59E0B"/>
        <text x="30" y="25" class="font-sans card-title">Output Card 4.3: 8 Comparative Analytics Graphs</text>
        <text x="470" y="25" class="font-mono" font-size="9.5" fill="#FCD34D">8 Visualizations</text>

        <g transform="translate(20, 50)">
          <!-- 8 Graphs Grid (4x2) -->
          <g transform="translate(0, 0)">
            <!-- Graph 1 -->
            <rect width="260" height="98" rx="6" fill="#1E293B" stroke="#334155"/>
            <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">1. Candidate Strategy Latency</text>
            <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">CPU vs Direct NMC vs Fused vs Tiled</text>
            <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Component stacked bars (Compute, Link, Memory)</text>
            <rect x="10" y="62" width="240" height="24" rx="4" fill="#0B132B"/>
            <text x="15" y="78" class="font-mono" font-size="8" fill="#34D399">Direct NMC: 3.59 ms vs CPU: 4.51 ms</text>

            <!-- Graph 2 -->
            <g transform="translate(275, 0)">
              <rect width="265" height="98" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">2. Input Scaling &amp; Crossover</text>
              <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">Log-Log Latency Curve (10^2 to 10^8 items)</text>
              <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Exposes exact crossover N_cross = 650K</text>
              <rect x="10" y="62" width="245" height="24" rx="4" fill="#0B132B"/>
              <text x="15" y="78" class="font-mono" font-size="8" fill="#FBBF24">Amortizes PCIe link overhead at 650K</text>
            </g>

            <!-- Graph 3 -->
            <g transform="translate(0, 108)">
              <rect width="260" height="98" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">3. Fine-Grained Latency Stack</text>
              <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">Compute, TSV DRAM, PCIe Link, Layout, Sync</text>
              <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Identifies dominant serialization bottlenecks</text>
              <rect x="10" y="62" width="240" height="24" rx="4" fill="#0B132B"/>
              <text x="15" y="78" class="font-mono" font-size="8" fill="#E2E8F0">Link: 2.89 ms | TSV Compute: 0.64 ms</text>
            </g>

            <!-- Graph 4 -->
            <g transform="translate(275, 108)">
              <rect width="265" height="98" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">4. Energy Dissipation Tax</text>
              <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">Host PCB Bus (20 pJ/b) vs TSV (&lt;2 pJ/b)</text>
              <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Slashes total subsystem energy by 79.5%</text>
              <rect x="10" y="62" width="245" height="24" rx="4" fill="#0B132B"/>
              <text x="15" y="78" class="font-mono" font-size="8" fill="#34D399">Total Energy: 0.48 J (NMC) vs 2.34 J (CPU)</text>
            </g>

            <!-- Graph 5 -->
            <g transform="translate(0, 216)">
              <rect width="260" height="98" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">5. Classical Roofline Model</text>
              <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">Attainable GFLOPS vs Arithmetic Intensity</text>
              <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Plots VADD, REDUCE, GEMV operating points</text>
              <rect x="10" y="62" width="240" height="24" rx="4" fill="#0B132B"/>
              <text x="15" y="78" class="font-mono" font-size="8" fill="#FBBF24">NMC Peak TSV Slope: 1024 GB/s vs 28 GB/s</text>
            </g>

            <!-- Graph 6 -->
            <g transform="translate(275, 216)">
              <rect width="265" height="98" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">6. PCIe Link Sensitivity</text>
              <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">Link bandwidth swept from 8 to 128 GB/s</text>
              <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Exposes speedup gain as PCIe Gen5 matures</text>
              <rect x="10" y="62" width="245" height="24" rx="4" fill="#0B132B"/>
              <text x="15" y="78" class="font-mono" font-size="8" fill="#38BDF8">Speedup scales from 0.72x to 1.84x</text>
            </g>

            <!-- Graph 7 -->
            <g transform="translate(0, 324)">
              <rect width="260" height="110" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">7. Bank Conflict Penalty</text>
              <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">Row Buffer Conflict (45ns) vs Hit (13.75ns)</text>
              <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Bank conflict rate drops from 28.4% to 0.8%</text>
              <rect x="10" y="62" width="240" height="36" rx="4" fill="#0B132B"/>
              <text x="15" y="78" class="font-mono" font-size="8" fill="#34D399">Row Hit Rate: 97.4%</text>
              <text x="15" y="91" class="font-mono" font-size="8" fill="#E2E8F0">Padding eliminates bank stalls</text>
            </g>

            <!-- Graph 8 -->
            <g transform="translate(275, 324)">
              <rect width="265" height="110" rx="6" fill="#1E293B" stroke="#334155"/>
              <text x="10" y="18" class="font-mono" font-size="9.5" font-weight="700" fill="#38BDF8">8. Multi-DPU Strong Scaling</text>
              <text x="10" y="34" class="font-sans" font-size="8.5" fill="#CBD5E1">Parallel scaling across 1 to 64 PIM Banks</text>
              <text x="10" y="50" class="font-sans" font-size="8.5" fill="#94A3B8">Models Amdahl serialization &amp; barrier costs</text>
              <rect x="10" y="62" width="245" height="36" rx="4" fill="#0B132B"/>
              <text x="15" y="78" class="font-mono" font-size="8" fill="#34D399">16 DPU Efficiency: 87.3%</text>
              <text x="15" y="91" class="font-mono" font-size="8" fill="#E2E8F0">Sustained throughput: 894.2 GB/s</text>
            </g>
          </g>
        </g>
      </g>

      <!-- ROW 2 OF LAYER 4: CARDS 4.4, 4.5, 4.6 -->

      <!-- CARD 4.4: Memory Movement & Bank Layout Simulator (Row 2, Left) -->
      <g transform="translate(30, 575)">
        <rect width="580" height="520" rx="12" fill="url(#l4CardGrad)" stroke="#B45309" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 568 0 C 574.63 0 580 5.37 580 12 L 580 40 L 0 40 Z" fill="#78350F"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#F59E0B"/>
        <text x="30" y="25" class="font-sans card-title">Output Card 4.4: Memory Movement &amp; Bank Layout</text>
        <text x="475" y="25" class="font-mono" font-size="9.5" fill="#FCD34D">16-Bank Striping</text>

        <g transform="translate(20, 50)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• 16-Bank DRAM Partitioning:</tspan> Physical mapping via (Addr / 64) % 16</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Stride Conflict Elimination:</tspan> Compiler inserts cache line padding</text>
          <text x="0" y="55" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Row-Buffer Locality:</tspan> Retains active row across 16 banks</text>

          <!-- Visual 16-Bank Grid Simulator -->
          <g transform="translate(0, 75)">
            <rect width="540" height="235" rx="8" fill="#0B132B" stroke="#334155" stroke-width="1"/>
            <text x="15" y="22" class="font-mono" font-size="10" font-weight="700" fill="#38BDF8">[16-BANK PIM PHYSICAL ALLOCATION GRID]</text>
            
            <!-- 16 mini bank boxes -->
            <g transform="translate(15, 35)">
              for idx in range(16):
            </g>
          ''')
    
    # Generate 16 bank boxes programmatically
    for b in range(16):
        bx = 65 + 30 + 20 + (b % 8) * 65
        by = l4_y + 575 + 50 + 75 + 40 + (b // 8) * 80
        svg.append(f'''
        <g transform="translate({bx}, {by})">
          <rect width="58" height="68" rx="4" fill="#1E293B" stroke="#10B981" stroke-width="1.2"/>
          <text x="6" y="16" class="font-mono" font-size="8.5" font-weight="700" fill="#34D399">Bank {b}</text>
          <rect x="6" y="22" width="46" height="18" rx="2" fill="#064E3B"/>
          <text x="9" y="34" class="font-mono" font-size="7.5" fill="#A7F3D0">Row {10+b}</text>
          <text x="6" y="52" class="font-mono" font-size="7.5" fill="#94A3B8">DPU {b}</text>
          <text x="6" y="62" class="font-mono" font-size="7" fill="#38BDF8">64 GB/s</text>
        </g>
        ''')

    svg.append(f'''
          <g transform="translate(20, 380)">
            <rect width="540" height="95" rx="8" fill="#1E293B" stroke="#334155"/>
            <text x="15" y="22" class="font-mono" font-size="10" font-weight="700" fill="#34D399">[MEMORY TIMING METRICS]</text>
            <text x="15" y="42" class="font-sans" font-size="9.5" fill="#E2E8F0">• Row-Buffer Hit Rate: 97.4% (t_CL = 13.75 ns)</text>
            <text x="15" y="60" class="font-sans" font-size="9.5" fill="#E2E8F0">• Bank Precharge Collisions: &lt; 0.8% (down from 28.4% unpadded)</text>
            <text x="15" y="78" class="font-sans" font-size="9.5" fill="#38BDF8">• Internal Aggregate Bandwidth: 894.2 GB/s (87.3% of theoretical peak)</text>
          </g>
        </g>
      </g>

      <!-- CARD 4.5: Research Paper Empirical Suite (Row 2, Middle) -->
      <g transform="translate(635, 575)">
        <rect width="610" height="520" rx="12" fill="url(#l4CardGrad)" stroke="#B45309" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 598 0 C 604.63 0 610 5.37 610 12 L 610 40 L 0 40 Z" fill="#78350F"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#F59E0B"/>
        <text x="30" y="25" class="font-sans card-title">Output Card 4.5: Research Paper Empirical Suite</text>
        <text x="475" y="25" class="font-mono" font-size="9.5" fill="#FCD34D">Empirical Literature</text>

        <g transform="translate(20, 50)">
          <text x="0" y="15" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Literature Reproduction:</tspan> Gao et al., Ahn et al., Devaux UPMEM</text>
          <text x="0" y="35" class="font-sans body-text"><tspan font-weight="700" fill="#FFFFFF">• Silicon Parity Validation:</tspan> Accurately reflects published PIM data</text>

          <!-- 3 Research Figures Boxes -->
          <g transform="translate(0, 55)">
            <!-- Fig A -->
            <rect width="570" height="115" rx="8" fill="#0B132B" stroke="#334155" stroke-width="1"/>
            <text x="15" y="22" class="font-mono" font-size="10.5" font-weight="700" fill="#38BDF8">Figure 1: PIM Caching Tile Sizes (4B to 256B)</text>
            <text x="15" y="42" class="font-sans body-text">Evaluates DPU WRAM caching granularity on 512x512 GEMV kernel.</text>
            <text x="15" y="60" class="font-sans body-text">Optimal WRAM tile = 64-128 elements; prevents tasklet idle stalls.</text>
            <text x="15" y="78" class="font-mono" font-size="9" fill="#34D399">&gt; 32.5% reduction in kernel execution latency via optimal caching.</text>
            <text x="15" y="96" class="font-sans" font-size="9" fill="#94A3B8">Source: Re-implementation of Devaux (2019) &amp; IMTP (2024) hardware experiments.</text>
          </g>

          <g transform="translate(0, 185)">
            <!-- Fig B -->
            <rect width="570" height="115" rx="8" fill="#0B132B" stroke="#334155" stroke-width="1"/>
            <text x="15" y="22" class="font-mono" font-size="10.5" font-weight="700" fill="#38BDF8">Figure 2: 2D GEMV Tiling Schemes on 2048 DPUs</text>
            <text x="15" y="42" class="font-sans body-text">Compares 10 2D tiling shapes (4x8192 to 2048x16) on 8192x8192 GEMV.</text>
            <text x="15" y="60" class="font-sans body-text">2D tiling balances row &amp; col reduction; cuts host aggregation time.</text>
            <text x="15" y="78" class="font-mono" font-size="9" fill="#34D399">&gt; Up to 5.33x speedup over 1D spatial-only distribution (PrIM baseline).</text>
            <text x="15" y="96" class="font-sans" font-size="9" fill="#94A3B8">Source: Empirical replication of Ahn et al. (2015) &amp; Shin et al. (2024).</text>
          </g>

          <g transform="translate(0, 315)">
            <!-- Fig C -->
            <rect width="570" height="125" rx="8" fill="#0B132B" stroke="#334155" stroke-width="1"/>
            <text x="15" y="22" class="font-mono" font-size="10.5" font-weight="700" fill="#38BDF8">Figure 3: GPT-J Transformer MHA FC Layers</text>
            <text x="15" y="42" class="font-sans body-text">Evaluates MTV &amp; MMTV across GPT-J 6B and 30B multi-head attention.</text>
            <text x="15" y="60" class="font-sans body-text">Token lengths: 64, 128, 256, 512; Batch sizes: 1, 4.</text>
            <text x="15" y="78" class="font-mono" font-size="9" fill="#34D399">&gt; Up to 8.21x speedup on projection layers; 69.1% speedup on MMTV.</text>
            <text x="15" y="96" class="font-sans" font-size="9" fill="#94A3B8">Source: LLM serving profile validation from commercial PIM studies.</text>
          </g>
        </g>
      </g>

      <!-- CARD 4.6: Copilot & Setup Guides Subsystem (Row 2, Right) -->
      <g transform="translate(1270, 575)">
        <rect width="580" height="520" rx="12" fill="url(#l4CardGrad)" stroke="#B45309" stroke-width="1.5" filter="url(#shadow)"/>
        <path d="M 0 12 C 0 5.37 5.37 0 12 0 L 568 0 C 574.63 0 580 5.37 580 12 L 580 40 L 0 40 Z" fill="#78350F"/>
        <rect x="15" y="12" width="6" height="16" rx="3" fill="#F59E0B"/>
        <text x="30" y="25" class="font-sans card-title">Output Card 4.6: Copilot &amp; Setup Guides Subsystem</text>
        <text x="475" y="25" class="font-mono" font-size="9.5" fill="#FCD34D">DevOps &amp; Docs</text>

        <g transform="translate(20, 50)">
          <!-- Sub-box 1: Copilot Engine -->
          <g transform="translate(0, 0)">
            <rect width="540" height="120" rx="8" fill="#041F2B" stroke="#0891B2" stroke-width="1.2"/>
            <text x="15" y="22" class="font-mono" font-size="10.5" font-weight="700" fill="#22D3EE">[COMPILER COPILOT INTELLIGENCE CORE]</text>
            <text x="15" y="42" class="font-sans body-text">• Rule-based analytical reasoning engine tailored to compiler cost equations.</text>
            <text x="15" y="60" class="font-sans body-text">• Live context binding: Extracts current array size N, arithmetic intensity, speedup.</text>
            <text x="15" y="78" class="font-sans body-text">• Dynamic prompt suggestions: "Why CPU-only?", "Explain Bank Tiling", "Show DPU C".</text>
            <text x="15" y="98" class="font-mono" font-size="9" fill="#38BDF8">&gt; POST /api/chat with conversation history &amp; active compiler state.</text>
          </g>

          <!-- Sub-box 2: Developer Operations & CLI Scripts -->
          <g transform="translate(0, 135)">
            <rect width="540" height="135" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
            <text x="15" y="22" class="font-mono" font-size="10.5" font-weight="700" fill="#FBBF24">[DEVELOPER OPERATIONS &amp; CLI AUTOMATION]</text>
            <text x="15" y="42" class="font-mono" font-size="9.5" fill="#E2E8F0">• run_dev.ps1: Automated dual-stack launcher for PowerShell</text>
            <text x="15" y="58" class="font-mono" font-size="9.5" fill="#E2E8F0">• run_dev.bat: One-click CMD launcher for Windows</text>
            <text x="15" y="76" class="font-mono" font-size="9" fill="#93C5FD">  &gt; uvicorn app.main:app --host 127.0.0.1 --port 8008</text>
            <text x="15" y="92" class="font-mono" font-size="9" fill="#93C5FD">  &gt; npm run dev -- --host 127.0.0.1 --port 5173</text>
            <text x="15" y="112" class="font-sans body-text">• Automated Pytest Suite: test_analyzer.py, test_cost_model.py, test_optimizer.py</text>
          </g>

          <!-- Sub-box 3: Methodology & Reference Suite -->
          <g transform="translate(0, 285)">
            <rect width="540" height="145" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
            <text x="15" y="22" class="font-mono" font-size="10.5" font-weight="700" fill="#34D399">[DOCUMENTATION &amp; BENCHMARK REFERENCE]</text>
            <text x="15" y="42" class="font-sans body-text">• BenchmarkSuiteView: Catalog of 6 standard kernels with FLOP/byte formulas.</text>
            <text x="15" y="60" class="font-sans body-text">• MethodologyView: Mathematical proofs, TSV bandwidth equations, roofline limits.</text>
            <text x="15" y="78" class="font-sans body-text">• ExecutionGuideView: Complete setup manual, port binding, and CLI troubleshooting.</text>
            <text x="15" y="98" class="font-mono" font-size="9" fill="#A7F3D0">• GitHub Sync: Fully committed on main branch (github.com/MSN-1307/NMC-OPT-CD)</text>
            <text x="15" y="120" class="font-sans" font-size="9.5" fill="#FBBF24">Complete, self-contained educational &amp; research compiler workbench platform.</text>
          </g>
        </g>
      </g>
    </g>
    ''')

    # =========================================================================
    # FOOTER BAR & LEGEND
    # =========================================================================
    foot_y = 2685
    svg.append(f'''
    <!-- Bottom Footer & Legend -->
    <g transform="translate(60, {foot_y})">
      <rect width="1880" height="45" rx="8" fill="#0F172A" stroke="#334155" stroke-width="1"/>
      
      <!-- Legend items -->
      <g transform="translate(25, 14)">
        <text x="0" y="15" class="font-sans" font-size="11" font-weight="700" fill="#94A3B8">ARCHITECTURAL SUBSYSTEM LEGEND:</text>
        
        <rect x="230" y="3" width="14" height="14" rx="3" fill="#0284C7"/>
        <text x="252" y="15" class="font-sans" font-size="11" fill="#E2E8F0">Layer 1: Client Workspaces</text>

        <rect x="440" y="3" width="14" height="14" rx="3" fill="#059669"/>
        <text x="462" y="15" class="font-sans" font-size="11" fill="#E2E8F0">Layer 2: Ingestion &amp; Profiling</text>

        <rect x="670" y="3" width="14" height="14" rx="3" fill="#4F46E5"/>
        <text x="692" y="15" class="font-sans" font-size="11" fill="#E2E8F0">Layer 3: Core Compiler &amp; Simulator</text>

        <rect x="940" y="3" width="14" height="14" rx="3" fill="#D97706"/>
        <text x="962" y="15" class="font-sans" font-size="11" fill="#E2E8F0">Layer 4: Analytical Views &amp; Output</text>

        <rect x="1200" y="3" width="14" height="14" rx="3" fill="#0891B2"/>
        <text x="1222" y="15" class="font-sans" font-size="11" fill="#E2E8F0">Compiler Copilot AI</text>

        <text x="1450" y="15" class="font-sans" font-size="11" fill="#64748B">Publication-Ready Architectural Specification • NMC-Opt Studio v1.0.0</text>
      </g>
    </g>
    ''')

    svg.append('</svg>')
    
    content = "\n".join(svg)
    out_path = os.path.join(os.path.dirname(__file__), "nmc_opt_studio_architecture.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Architecture SVG successfully generated at: {out_path}")

    # Also copy to root for easy user access
    root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "nmc_opt_studio_architecture.svg"))
    with open(root_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Architecture SVG copy saved to: {root_path}")

if __name__ == "__main__":
    generate_architecture_svg()
