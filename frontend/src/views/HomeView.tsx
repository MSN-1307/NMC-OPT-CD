import React from 'react';
import { 
  Cpu, 
  BarChart3, 
  Layers, 
  HardDrive, 
  Upload, 
  Terminal, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  BookOpen,
  GitBranch,
  Play,
  Activity,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import type { TabType } from '../components/Sidebar';
import type { BenchmarkMetadata } from '../types';

interface HomeViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenUpload: () => void;
  activeBenchmark: BenchmarkMetadata;
  backendOnline: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenUpload,
  activeBenchmark,
  backendOnline,
}) => {
  const quickActions = [
    {
      id: 'workbench',
      title: 'Optimization Workbench',
      desc: 'Select benchmarks, adjust problem scale, evaluate CPU vs Near-Memory placements.',
      icon: Cpu,
      badge: 'Core Engine',
      iconBg: 'bg-white dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-2 border-teal-400 dark:border-teal-800',
      action: () => onNavigate('workbench'),
    },
    {
      id: 'simulator',
      title: 'Execution Simulator Demo',
      desc: 'Step-by-step hardware walkthrough: cache misses, link transfers, bank interleaving, and final verdict.',
      icon: Play,
      badge: 'Interactive Stepper',
      iconBg: 'bg-white dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-400 dark:border-emerald-800',
      action: () => onNavigate('simulator'),
    },
    {
      id: 'upload',
      title: 'Ingest Custom C Kernel',
      desc: 'Upload or paste your own .c loops to evaluate data movement and arithmetic intensity.',
      icon: Upload,
      badge: 'AST Inspection',
      iconBg: 'bg-white dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-2 border-blue-400 dark:border-blue-800',
      action: onOpenUpload,
    },
    {
      id: 'analytics',
      title: 'Analytics & Scaling Graphs',
      desc: 'Multi-variable Recharts comparing execution latencies, input crossover curves, and DRAM sensitivity.',
      icon: BarChart3,
      badge: '4 Interactive Charts',
      iconBg: 'bg-white dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-2 border-purple-400 dark:border-purple-800',
      action: () => onNavigate('analytics'),
    },
    {
      id: 'pipeline',
      title: '7-Stage Compiler Pipeline',
      desc: 'Inspect compiler transformations from C syntax to SSA Intermediate Representation (IR) and cost modeling.',
      icon: Layers,
      badge: 'SSA IR Inspector',
      iconBg: 'bg-white dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-2 border-amber-400 dark:border-amber-800',
      action: () => onNavigate('pipeline'),
    },
    {
      id: 'memory',
      title: 'Memory Movement & Layout',
      desc: 'Visual simulation of Host CPU DDR memory bus vs Near-Memory DRAM bank interleaving.',
      icon: HardDrive,
      badge: 'Bank Interleaving',
      iconBg: 'bg-white dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-400 dark:border-cyan-800',
      action: () => onNavigate('memory'),
    },
    {
      id: 'chat',
      title: 'Compiler Copilot Chat',
      desc: 'Ask questions about PIM concepts, roofline bounds, IMTP paper research, and placement advice.',
      icon: MessageSquare,
      badge: 'AI Copilot',
      iconBg: 'bg-white dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-400 dark:border-indigo-800',
      action: () => onNavigate('chat'),
    },
    {
      id: 'execution',
      title: 'Execution & CLI Guide',
      desc: 'Step-by-step local commands, PowerShell scripts, unit test verification, and architecture documentation.',
      icon: Terminal,
      badge: 'Setup Manual',
      iconBg: 'bg-white dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-2 border-rose-400 dark:border-rose-800',
      action: () => onNavigate('execution'),
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-7 sm:p-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Subtle background ambient gradient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-teal-400/10 via-emerald-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-teal-950/70 border-2 border-teal-400 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Adaptive Compiler Optimization Workbench</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            NMC-Opt Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            A visual, data-movement-aware compiler workbench. Evaluate conventional CPU execution 
            versus Near-Memory Computing (NMC / PIM) by treating off-chip data transfers as a first-class optimization constraint.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('workbench')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30 hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Workbench</span>
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-400 text-xs font-bold transition-all shadow-2xs hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Run Execution Simulator</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-2xs"
            >
              <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Upload Custom Loop (.c)</span>
            </button>

            <button
              onClick={() => onNavigate('execution')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-2xs"
            >
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>CLI Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Interactive Compiler Modules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jump directly into simulation tools, SSA intermediate representations, and cost analytics
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 shadow-2xs">
            8 Specialized Views
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                onClick={qa.action}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 text-left transition-all hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${qa.iconBg} transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {qa.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {qa.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {qa.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                  <span>Explore View</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conceptual Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-2 border-blue-400 dark:border-blue-800 flex items-center justify-center font-bold text-xs">
            01
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">The Memory Wall Bottleneck</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Conventional host processors spend up to 60–80% of energy and latency shuttling operands across bandwidth-constrained off-chip memory channels.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-2 border-teal-400 dark:border-teal-800 flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Near-Memory Computing (PIM)</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Processing-in-Memory places parallel ALUs directly adjacent to DRAM row buffers, unlocking over 160 GB/s internal bandwidth without PCIe link stalls.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-2 border-purple-400 dark:border-purple-800 flex items-center justify-center font-bold text-xs">
            03
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Data-Movement-Aware Cost Model</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Offloading has real costs: DMA setup, bank striping, and host barriers. The NMC compiler analyzes arithmetic intensity to pick the winning execution target.
          </p>
        </div>
      </div>
    </div>
  );
};
