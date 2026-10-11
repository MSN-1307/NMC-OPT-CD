import React from 'react';
import { 
  Play, 
  Settings, 
  Download, 
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from 'lucide-react';
import type { TabType } from './Sidebar';
import type { AnalysisResponse, BenchmarkMetadata, UserProfile } from '../types';

interface HeaderProps {
  currentTab: TabType;
  selectedBenchmark: BenchmarkMetadata;
  analysisResult: AnalysisResponse | null;
  onOpenParameterModal: () => void;
  onOpenUploadModal: () => void;
  onOpenLoginModal: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  currentUser: UserProfile;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  analysisResult,
  onOpenParameterModal,
  onOpenUploadModal,
  onAnalyze,
  isAnalyzing,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const titles: Record<TabType, { title: string; subtitle: string; category: string }> = {
    home: {
      title: 'Welcome to NMC-Opt Studio',
      subtitle: 'Adaptive Data-Movement-Aware Compiler Optimization Workbench',
      category: 'Overview',
    },
    workbench: {
      title: 'Optimization Workbench',
      subtitle: 'Analyze loops, evaluate CPU vs NMC candidates, and inspect decisions',
      category: 'Core Engine',
    },
    simulator: {
      title: 'Interactive Execution Simulator',
      subtitle: 'Step-by-step hardware walkthrough and output verdict on which target to use',
      category: 'Simulator',
    },
    results: {
      title: 'Research Paper Results & Figures',
      subtitle: 'Dynamic empirical evaluation of Figures 1–4 across 5 canonical kernels with live hardware tuning',
      category: 'Empirical Suite',
    },
    analytics: {
      title: 'Analytics & Graphs',
      subtitle: 'Execution latencies, problem-size scaling crossover, and component breakdowns',
      category: 'Analysis',
    },
    pipeline: {
      title: '7-Stage Compiler Pipeline',
      subtitle: 'From C source to SSA IR, loop analysis, and candidate evaluation',
      category: 'Compiler',
    },
    memory: {
      title: 'Memory Movement & Layout Simulator',
      subtitle: 'Conceptual visualization of Host-Device transfers and DRAM bank interleaving',
      category: 'DRAM PIM',
    },
    chat: {
      title: 'Compiler Copilot & AI Chat',
      subtitle: 'Context-aware compiler reasoning, PIM taxonomy, and placement advice',
      category: 'AI Assistant',
    },
    execution: {
      title: 'Project Execution & CLI Guide',
      subtitle: 'Step-by-step startup instructions, PowerShell commands, and test verification',
      category: 'Setup & CLI',
    },
    benchmarks: {
      title: 'Compiler Benchmark Suite',
      subtitle: 'Explore characteristics of standard streaming, reduction, and matrix kernels',
      category: 'Benchmarks',
    },
    methodology: {
      title: 'Methodology & Citations',
      subtitle: 'Academic literature grounding, mathematical formulas, and simulation disclosures',
      category: 'Documentation',
    },
  };

  const handleExportJSON = () => {
    if (!analysisResult) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analysisResult, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `nmc_opt_${analysisResult.kernel_id}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentInfo = titles[currentTab] || titles.workbench;

  return (
    <header className="bg-white/95 border-slate-200/90 text-slate-800 backdrop-blur-md border-b px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-20 shadow-xs transition-colors">
      <div className="flex items-center space-x-3">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 shadow-2xs"
          title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-slate-500" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-teal-600" />
          )}
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-white text-slate-500 font-semibold border border-slate-200/80">
              {currentInfo.category}
            </span>
            <span className="text-slate-300 text-xs">/</span>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
              {currentInfo.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-wrap">
        {/* Upload Custom Kernel */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all shadow-2xs"
          title="Upload or paste custom .c loop"
        >
          <Upload className="w-3.5 h-3.5 text-teal-600" />
          <span>Upload .c</span>
        </button>

        {/* Export JSON */}
        {analysisResult && (
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-all shadow-2xs"
            title="Export full compiler analysis to JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        )}

        {/* Cost Model Parameters Config */}
        <button
          onClick={onOpenParameterModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-all shadow-2xs"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Parameters</span>
        </button>
      </div>
    </header>
  );
};

