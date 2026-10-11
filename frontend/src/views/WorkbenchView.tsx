import React, { useState } from 'react';
import { 
  Play, 
  Settings2, 
  Sliders, 
  BarChart2, 
  Layers, 
  HardDrive, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  FileCode2,
  FileText,
  Upload,
  Copy,
  Check,
  TrendingUp,
  Cpu,
  Zap,
  Activity,
  Maximize2,
  Scale,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import type { 
  BenchmarkMetadata, 
  AnalysisResponse, 
  CostModelParameters 
} from '../types';
import type { TabType } from '../components/Sidebar';

interface WorkbenchViewProps {
  benchmarks: BenchmarkMetadata[];
  selectedBenchmark: BenchmarkMetadata;
  onSelectBenchmark: (bm: BenchmarkMetadata) => void;
  inputSize: number;
  onChangeInputSize: (size: number) => void;
  matrixRows: number;
  matrixCols: number;
  onChangeMatrixDims: (rows: number, cols: number) => void;
  parameters: CostModelParameters;
  onChangeParameters?: (params: CostModelParameters) => void;
  onOpenParameterModal: () => void;
  onOpenUploadModal: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  analysisResult: AnalysisResponse | null;
  onNavigateTab: (tab: TabType) => void;
  onOpenIRModal: () => void;
  onOpenExplanationModal: () => void;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  benchmarks,
  selectedBenchmark,
  onSelectBenchmark,
  inputSize,
  onChangeInputSize,
  matrixRows,
  matrixCols,
  onChangeMatrixDims,
  parameters,
  onChangeParameters,
  onOpenParameterModal,
  onOpenUploadModal,
  onAnalyze,
  isAnalyzing,
  analysisResult,
  onNavigateTab,
  onOpenIRModal,
  onOpenExplanationModal,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'matrix' | 'tradeoffs' | 'transforms' | 'crossover'>('matrix');
  const [selectedArchPreset, setSelectedArchPreset] = useState<string>('baseline');

  const isGEMV = selectedBenchmark.id === 'gemv';
  const isCustom = selectedBenchmark.id === 'custom';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedBenchmark.source_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Hardware Architectural Presets
  const handleApplyArchPreset = (presetKey: string) => {
    setSelectedArchPreset(presetKey);
    if (!onChangeParameters) return;

    if (presetKey === 'baseline') {
      onChangeParameters({
        ...parameters,
        cpu_compute_gflops: 45.0,
        cpu_effective_bandwidth_gbps: 28.0,
        nmc_compute_gflops: 32.0,
        nmc_effective_bandwidth_gbps: 160.0,
        host_link_bandwidth_gbps: 16.0,
      });
    } else if (presetKey === 'server') {
      onChangeParameters({
        ...parameters,
        cpu_compute_gflops: 90.0,
        cpu_effective_bandwidth_gbps: 64.0,
        nmc_compute_gflops: 64.0,
        nmc_effective_bandwidth_gbps: 320.0,
        host_link_bandwidth_gbps: 32.0,
      });
    } else if (presetKey === 'cxl') {
      onChangeParameters({
        ...parameters,
        cpu_compute_gflops: 60.0,
        cpu_effective_bandwidth_gbps: 40.0,
        nmc_compute_gflops: 48.0,
        nmc_effective_bandwidth_gbps: 240.0,
        host_link_bandwidth_gbps: 128.0,
        host_to_nmc_overhead_ms: 0.005,
        nmc_to_host_overhead_ms: 0.005,
      });
    }
  };

  // Format numbers cleanly
  const formatInputSizeLabel = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  // Prepare crossover chart points from real analysis
  const crossoverData = analysisResult?.chart_scaling?.map((item) => {
    const isNearCrossover = analysisResult.crossover_elements 
      ? Math.abs(item.input_size - analysisResult.crossover_elements) / Math.max(analysisResult.crossover_elements, 1) < 0.12
      : false;
    const baseLabel = formatInputSizeLabel(item.input_size);
    return {
      size: isNearCrossover ? `${baseLabel}*` : baseLabel,
      input_size: item.input_size,
      cpu: parseFloat(item.cpu_ms.toFixed(4)),
      nmc: parseFloat(item.nmc_ms.toFixed(4)),
      interleaved: item.transformed_ms !== null && item.transformed_ms !== undefined ? parseFloat(item.transformed_ms.toFixed(4)) : null,
    };
  }) || [];

  // Identify CPU baseline vs winner candidate
  const cpuCandidate = analysisResult?.candidates?.find(c => c.strategy === 'CPU-only');
  const winningCandidate = analysisResult?.candidates?.find(c => c.strategy === analysisResult.recommendation.strategy);
  const isWinnerNMC = analysisResult && analysisResult.recommendation.strategy !== 'CPU-only';
  const cpuLatency = cpuCandidate?.estimated_total_ms || 0;
  const winLatency = winningCandidate?.estimated_total_ms || 0;
  const timeSavedMs = cpuLatency > winLatency ? (cpuLatency - winLatency) : 0;
  const timeSavedPercent = cpuLatency > 0 ? ((timeSavedMs / cpuLatency) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Benchmark selector cards */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Compiler Benchmark Kernels & Workload Ingestion
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select standard data-parallel loop workloads or inject a custom C loop for hardware-aware placement analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-teal-500 text-teal-800 text-xs font-bold transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>Upload Custom Loop</span>
            </button>
            <span className="text-xs font-mono bg-white text-slate-700 font-bold px-2.5 py-1 rounded-lg border-2 border-slate-200">
              {benchmarks.length} Active Kernels
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {benchmarks.map((bm) => {
            const isSelected = bm.id === selectedBenchmark.id;
            return (
              <button
                key={bm.id}
                onClick={() => onSelectBenchmark(bm)}
                className={`p-3.5 rounded-2xl text-left transition-all border-2 ${
                  isSelected
                    ? 'bg-white border-teal-600 text-teal-950 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                    isSelected 
                      ? 'bg-teal-50 text-teal-900 border-teal-300 font-bold' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {bm.id}
                  </span>
                  {isSelected && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900 leading-tight mb-1 truncate">
                  {bm.name}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {bm.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Source preview, Dimensions, Arch presets & Execution trigger */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Code Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden transition-colors">
            <div className="px-4 py-3 border-b-2 border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">
                  {isCustom ? 'Custom Ingested C Loop' : 'Canonical C Kernel Source'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
                  title="Copy C source"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onOpenUploadModal}
                  className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Replace</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-white font-mono text-xs overflow-x-auto leading-relaxed max-h-60 border-y border-slate-100 text-slate-800">
              <pre>
                <code>{selectedBenchmark.source_code}</code>
              </pre>
            </div>

            <div className="p-3 bg-white flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px] truncate max-w-[240px]">
                {selectedBenchmark.description}
              </span>
              <button
                onClick={onOpenIRModal}
                className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 text-[11px] shrink-0 ml-2"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                Inspect SSA IR
              </button>
            </div>
          </div>

          {/* Scale, Dimensions & Architectural Presets */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>Workload Dimensions & Scale</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                DataType: {selectedBenchmark.data_type}
              </span>
            </div>

            {!isGEMV ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Array Elements (N):</label>
                  <span className="font-mono text-xs font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-lg border-2 border-teal-500">
                    {inputSize.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="10000000"
                  step="50000"
                  value={inputSize}
                  onChange={(e) => onChangeInputSize(parseInt(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {[250_000, 1_000_000, 2_000_000, 5_000_000, 8_000_000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onChangeInputSize(preset)}
                      className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg border-2 transition-all ${
                        inputSize === preset
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {(preset / 1_000_000).toFixed(preset >= 1_000_000 ? 1 : 2)}M
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Matrix Rows (N):</label>
                    <input
                      type="number"
                      min="64"
                      max="8192"
                      step="64"
                      value={matrixRows}
                      onChange={(e) => onChangeMatrixDims(parseInt(e.target.value) || 2048, matrixCols)}
                      className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-mono bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Matrix Cols (M):</label>
                    <input
                      type="number"
                      min="64"
                      max="8192"
                      step="64"
                      value={matrixCols}
                      onChange={(e) => onChangeMatrixDims(matrixRows, parseInt(e.target.value) || 2048)}
                      className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-xl text-xs font-mono bg-white text-slate-900"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-700 bg-white border-2 border-slate-200 p-2.5 rounded-xl shadow-xs flex items-center justify-between font-mono">
                  <span>Footprint:</span>
                  <span className="font-bold">{(matrixRows * matrixCols * 4 / 1024 / 1024).toFixed(1)} MB ({(matrixRows * matrixCols).toLocaleString()} floats)</span>
                </div>
              </div>
            )}

            {/* Hardware Architecture Scenarios */}
            <div className="pt-3 border-t-2 border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hardware Architecture Scenario</span>
                </span>
                <span className="text-[10px] text-teal-700 font-bold">
                  {parameters.nmc_effective_bandwidth_gbps} GB/s TSV
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyArchPreset('baseline')}
                  className={`px-2 py-1.5 rounded-xl text-left border-2 transition-all ${
                    selectedArchPreset === 'baseline'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] font-bold leading-tight">DDR4 + PCIe 4</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">28 GB/s DDR</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyArchPreset('server')}
                  className={`px-2 py-1.5 rounded-xl text-left border-2 transition-all ${
                    selectedArchPreset === 'server'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] font-bold leading-tight">DDR5 + PCIe 5</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">64 GB/s DDR</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyArchPreset('cxl')}
                  className={`px-2 py-1.5 rounded-xl text-left border-2 transition-all ${
                    selectedArchPreset === 'cxl'
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] font-bold leading-tight">CXL 3.0 Fabric</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">128 GB/s Link</div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t-2 border-slate-100 flex items-center gap-3">
              <button
                onClick={onOpenParameterModal}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
              >
                <Settings2 className="w-4 h-4 text-slate-600" />
                <span>Cost Model Config</span>
              </button>

              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-teal-600/30 disabled:opacity-70"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Placement'}</span>
              </button>
            </div>
          </div>

          {/* Active Target Architecture Specs & Interconnect Parameters (Eliminates Empty Space) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>Target Architecture Link Specs</span>
              </h3>
              <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-300 font-bold">
                {selectedArchPreset.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Host CPU Compute</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{parameters.cpu_compute_gflops} GFLOPS</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{parameters.cpu_effective_bandwidth_gbps} GB/s Host Bus</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Near-Memory DPU</div>
                <div className="font-mono font-bold text-teal-800 mt-0.5">{parameters.nmc_compute_gflops} GFLOPS</div>
                <div className="text-[9px] text-teal-600 font-semibold mt-0.5">{parameters.nmc_effective_bandwidth_gbps} GB/s TSV Bus</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">PCIe Interconnect</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{parameters.host_link_bandwidth_gbps} GB/s Link</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{parameters.host_to_nmc_overhead_ms.toFixed(3)} ms Overhead</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">DRAM Organization</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">16 Banks Striped</div>
                <div className="text-[9px] text-slate-500 mt-0.5">8 KB Row Buffer</div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Analytical Cost Model: Transparent Roofline</span>
              <button
                onClick={onOpenParameterModal}
                className="text-teal-700 hover:text-teal-900 font-bold hover:underline"
              >
                Configure Specs →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): The Clear-Cut Analysis Engine */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <>
              {/* 1. Hero Verdict & Executive Analysis Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-teal-500 shadow-sm relative overflow-hidden transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-300 text-[11px] font-bold text-teal-800">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>COMPILER OPTIMIZATION VERDICT</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      {analysisResult.recommendation.strategy}
                    </h3>
                  </div>

                  <div className="sm:text-right bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-xs">
                    <div className="text-2xl font-black text-teal-700 font-mono">
                      {winLatency.toFixed(4)} ms
                    </div>
                    {analysisResult.recommendation.speedup_vs_cpu > 1.0 ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 mt-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{analysisResult.recommendation.speedup_vs_cpu.toFixed(2)}x Speedup vs Host CPU</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 mt-0.5">
                        <span>Host CPU is Optimal Baseline</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Architectural Explanation Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs text-slate-800 leading-relaxed mb-4 font-medium">
                  {analysisResult.recommendation.reason}
                </div>

                {/* 2. Four Clear-Cut Architectural KPI Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-white border-2 border-slate-200 p-3 rounded-2xl shadow-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Arithmetic Intensity</div>
                    <div className="text-sm font-black text-teal-800 font-mono">
                      {analysisResult.analysis.arithmetic_intensity.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">FLOP/B</span>
                    </div>
                    <div className="text-[10px] font-bold text-rose-600 mt-1">
                      {analysisResult.analysis.is_bandwidth_bound ? '● Memory-Bound' : '● Compute-Bound'}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-slate-200 p-3 rounded-2xl shadow-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Crossover Point</div>
                    <div className="text-sm font-black text-slate-900 font-mono">
                      {analysisResult.crossover_elements ? `~${formatInputSizeLabel(analysisResult.crossover_elements)}` : 'N/A'}
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${inputSize >= (analysisResult.crossover_elements || 0) ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {inputSize >= (analysisResult.crossover_elements || 0) ? '✓ Size > Crossover' : '⚠ Below Crossover'}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-slate-200 p-3 rounded-2xl shadow-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Memory Traffic</div>
                    <div className="text-sm font-black text-slate-900 font-mono">
                      {(analysisResult.analysis.total_bytes_moved / (1024 * 1024)).toFixed(1)} <span className="text-[10px] font-normal text-slate-500">MB</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {analysisResult.analysis.memory_access_pattern}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-slate-200 p-3 rounded-2xl shadow-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Net Time Saved</div>
                    <div className="text-sm font-black text-emerald-700 font-mono">
                      {timeSavedMs > 0 ? `-${timeSavedMs.toFixed(3)} ms` : 'Baseline'}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 mt-1">
                      {timeSavedMs > 0 ? `${timeSavedPercent}% latency drop` : '0%'}
                    </div>
                  </div>
                </div>

                {/* Deep Dive Action Links */}
                <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenExplanationModal}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                      <span>Detailed Breakdown Modal</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                    <button
                      onClick={() => onNavigateTab('analytics')}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border-2 border-slate-200"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>8 Research Graphs</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateTab('simulator')}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 text-xs font-bold transition-all border-2 border-emerald-400"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Step Simulator</span>
                    </button>
                    <button
                      onClick={onOpenIRModal}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border-2 border-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>SSA IR</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Clear-Cut Analysis Tabs Container */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4 transition-colors">
                {/* Tab Pill Headers */}
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setActiveAnalysisTab('matrix')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeAnalysisTab === 'matrix'
                          ? 'bg-white text-teal-900 border border-slate-200 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Placement Matrix & Breakdown
                    </button>
                    <button
                      onClick={() => setActiveAnalysisTab('tradeoffs')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeAnalysisTab === 'tradeoffs'
                          ? 'bg-white text-teal-900 border border-slate-200 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Architectural Math & Tradeoffs
                    </button>
                    <button
                      onClick={() => setActiveAnalysisTab('transforms')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeAnalysisTab === 'transforms'
                          ? 'bg-white text-teal-900 border border-slate-200 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Compiler Transforms & AST
                    </button>
                    <button
                      onClick={() => setActiveAnalysisTab('crossover')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeAnalysisTab === 'crossover'
                          ? 'bg-white text-teal-900 border border-slate-200 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Crossover Curve Preview
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 font-bold hidden sm:inline">
                    Live Analytical Evaluation
                  </span>
                </div>

                {/* Tab Content 1: Placement Matrix & Visual Breakdown Bars */}
                {activeAnalysisTab === 'matrix' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Candidate Placement Strategies Latency Breakdown
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>Compute</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>Link Transfer</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-purple-500"></span>Layout</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-sky-500"></span>Sync</span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {analysisResult.candidates.map((cand) => {
                        const isWinner = cand.strategy === analysisResult.recommendation.strategy;
                        const total = cand.estimated_total_ms;
                        const computePct = total > 0 ? (cand.components_ms.compute_ms / total) * 100 : 0;
                        const transferPct = total > 0 ? (cand.components_ms.memory_or_transfer_ms / total) * 100 : 0;
                        const layoutPct = total > 0 ? (cand.components_ms.layout_conversion_ms / total) * 100 : 0;
                        const syncPct = total > 0 ? ((cand.components_ms.synchronization_ms + cand.components_ms.overhead_ms) / total) * 100 : 0;

                        return (
                          <div
                            key={cand.strategy}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                              !cand.valid
                                ? 'bg-white border-slate-200 opacity-60'
                                : isWinner
                                ? 'bg-white border-teal-600 shadow-sm ring-1 ring-teal-500/20'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-slate-900">{cand.strategy}</span>
                                {isWinner && (
                                  <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                                    Winning Target ({cand.speedup_vs_cpu.toFixed(2)}x)
                                  </span>
                                )}
                                {!cand.valid && (
                                  <span className="text-[10px] font-semibold bg-white text-rose-600 border border-rose-300 px-2 py-0.5 rounded-full">
                                    Ineligible
                                  </span>
                                )}
                              </div>
                              {cand.valid ? (
                                <div className="text-right">
                                  <span className="font-mono text-xs font-bold text-slate-900">
                                    {cand.estimated_total_ms.toFixed(4)} ms
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-rose-500 italic">Precondition failure</span>
                              )}
                            </div>

                            {cand.valid ? (
                              <div className="space-y-2">
                                {/* Visual Stacked Bar */}
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                  <div
                                    style={{ width: `${computePct}%` }}
                                    className="bg-emerald-500 h-full"
                                    title={`Compute: ${cand.components_ms.compute_ms.toFixed(3)} ms (${computePct.toFixed(1)}%)`}
                                  />
                                  <div
                                    style={{ width: `${transferPct}%` }}
                                    className="bg-amber-500 h-full"
                                    title={`Link Transfer: ${cand.components_ms.memory_or_transfer_ms.toFixed(3)} ms (${transferPct.toFixed(1)}%)`}
                                  />
                                  <div
                                    style={{ width: `${layoutPct}%` }}
                                    className="bg-purple-500 h-full"
                                    title={`Layout Conversion: ${cand.components_ms.layout_conversion_ms.toFixed(3)} ms (${layoutPct.toFixed(1)}%)`}
                                  />
                                  <div
                                    style={{ width: `${syncPct}%` }}
                                    className="bg-sky-500 h-full"
                                    title={`Synchronization: ${(cand.components_ms.synchronization_ms + cand.components_ms.overhead_ms).toFixed(3)} ms (${syncPct.toFixed(1)}%)`}
                                  />
                                </div>

                                {/* Component numbers */}
                                <div className="grid grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                                  <div>
                                    <span className="block text-[10px] text-slate-500 font-medium">Compute</span>
                                    <span className="font-mono font-bold text-slate-900">{cand.components_ms.compute_ms.toFixed(3)} ms</span>
                                    <span className="block text-[9px] text-slate-400">({computePct.toFixed(0)}%)</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-slate-500 font-medium">Link Transfer</span>
                                    <span className="font-mono font-bold text-slate-900">{cand.components_ms.memory_or_transfer_ms.toFixed(3)} ms</span>
                                    <span className="block text-[9px] text-slate-400">({transferPct.toFixed(0)}%)</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-slate-500 font-medium">Layout Conv</span>
                                    <span className="font-mono font-bold text-slate-900">{cand.components_ms.layout_conversion_ms.toFixed(3)} ms</span>
                                    <span className="block text-[9px] text-slate-400">({layoutPct.toFixed(0)}%)</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-slate-500 font-medium">Sync Barrier</span>
                                    <span className="font-mono font-bold text-slate-900">{(cand.components_ms.synchronization_ms + cand.components_ms.overhead_ms).toFixed(3)} ms</span>
                                    <span className="block text-[9px] text-slate-400">({syncPct.toFixed(0)}%)</span>
                                  </div>
                                </div>

                                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                  <span>Dominant Bottleneck: <strong className="text-slate-800">{cand.dominant_factor}</strong></span>
                                  <span className="italic">{cand.notes}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-rose-600 font-medium mt-1">{cand.invalidation_reason}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab Content 2: First-Principles Architectural Tradeoffs & Math */}
                {activeAnalysisTab === 'tradeoffs' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-teal-700" />
                        First-Principles Cost Model Formulation
                      </h4>
                      <p className="text-xs text-teal-800 leading-relaxed">
                        The compiler evaluates placement by balancing the Roofline memory wall penalty against PCIe bus offload latency:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 font-mono text-xs">
                        <div className="bg-white p-3 rounded-xl border border-teal-300">
                          <span className="font-bold text-slate-900 block mb-1">Host CPU Execution:</span>
                          <span className="text-teal-900">T_Host = max(Ops / BW_cpu_compute, Bytes / BW_host_ddr)</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-teal-300">
                          <span className="font-bold text-slate-900 block mb-1">Near-Memory Execution:</span>
                          <span className="text-teal-900">T_NMC = max(Ops / BW_nmc_compute, Bytes / BW_tsv) + (Bytes_xfer / BW_pcie) + T_sync</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Evaluated Tradeoffs for Ingested Kernel:
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {analysisResult.recommendation.key_tradeoffs.map((item, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Hardware Bandwidth Ratio Analysis:
                      </span>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Host DDR4 Bus</span>
                          <span className="font-mono font-bold text-slate-900">{parameters.cpu_effective_bandwidth_gbps} GB/s</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Near-Memory TSVs</span>
                          <span className="font-mono font-bold text-teal-700">{parameters.nmc_effective_bandwidth_gbps} GB/s</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Internal Advantage</span>
                          <span className="font-mono font-bold text-emerald-700">{(parameters.nmc_effective_bandwidth_gbps / parameters.cpu_effective_bandwidth_gbps).toFixed(1)}x Line-Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Compiler Transformation Passes & AST Facts */}
                {activeAnalysisTab === 'transforms' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Compiler Transformation Pass Eligibility
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        {analysisResult.transformations.filter(t => t.eligible).length} of {analysisResult.transformations.length} Passes Applied
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {analysisResult.transformations.map((trans) => (
                        <div
                          key={trans.name}
                          className={`p-3.5 rounded-2xl border-2 transition-all ${
                            trans.eligible
                              ? 'bg-white border-teal-400 shadow-xs'
                              : 'bg-white border-slate-200 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center space-x-2">
                              {trans.eligible ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="font-bold text-xs text-slate-900">{trans.name}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              trans.eligible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {trans.eligible ? 'Eligible & Active' : 'Ineligible'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 mb-1 leading-relaxed">
                            {trans.reason}
                          </div>
                          <div className="text-[11px] font-medium text-teal-800 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <strong>Potential Benefit:</strong> {trans.potential_benefit}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AST Inspection Facts */}
                    <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        AST Loop Inspection Facts
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Loop Bounds</span>
                          <span className="font-mono font-bold text-slate-900">{analysisResult.analysis.loop_bounds}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Iterations</span>
                          <span className="font-mono font-bold text-slate-900">{analysisResult.analysis.iterations.toLocaleString()}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Total Operations</span>
                          <span className="font-mono font-bold text-slate-900">{analysisResult.analysis.estimated_operations.toLocaleString()} OPs</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Reuse Factor</span>
                          <span className="font-mono font-bold text-slate-900">{analysisResult.analysis.reuse_factor.toFixed(2)}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 4: Interactive Crossover Curve Preview */}
                {activeAnalysisTab === 'crossover' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Input Size Scaling & Physical Crossover Point
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          At sizes below {analysisResult.crossover_elements ? formatInputSizeLabel(analysisResult.crossover_elements) : 'crossover'}, PCIe latency dominates; above it, line-rate TSVs win.
                        </p>
                      </div>
                      {analysisResult.crossover_elements && (
                        <span className="text-xs font-mono font-bold bg-teal-50 text-teal-900 border border-teal-300 px-3 py-1 rounded-xl">
                          N_crossover ≈ {formatInputSizeLabel(analysisResult.crossover_elements)}
                        </span>
                      )}
                    </div>

                    <div className="h-64 w-full bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-xs">
                      {crossoverData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={crossoverData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="size" stroke="#64748b" tick={{ fontSize: 10 }} />
                            <YAxis 
                              stroke="#64748b" 
                              tick={{ fontSize: 10 }} 
                              unit=" ms"
                              tickFormatter={(val) => val.toFixed(3)}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                borderColor: '#cbd5e1', 
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '11px',
                                color: '#0f172a'
                              }}
                              formatter={(value: any) => [`${parseFloat(value).toFixed(4)} ms`]}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Line 
                              type="monotone" 
                              dataKey="cpu" 
                              name="Host CPU" 
                              stroke="#e11d48" 
                              strokeWidth={2}
                              dot={{ r: 3 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="nmc" 
                              name="Direct NMC" 
                              stroke="#0ea5e9" 
                              strokeWidth={2}
                              dot={{ r: 3 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="interleaved" 
                              name="Interleaved NMC" 
                              stroke="#0d9488" 
                              strokeWidth={2.5}
                              dot={{ r: 4 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                          Generating scaling curve...
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 leading-relaxed">
                      💡 <strong>Physical Interpretation:</strong> The red curve represents standard DDR memory access bounded by motherboard traces. The green curve shows Near-Memory Execution where parallel 3D stacked TSV channels yield orders of magnitude higher memory bandwidth once array size $N$ crosses the initial PCIe transfer overhead.
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-6 shadow-sm">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-teal-50 text-teal-700 border-2 border-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <Play className="w-7 h-7 fill-teal-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Ready for Placement Analysis</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a benchmark loop or upload your custom C code, tune the array scale $N$, and click <strong>"Start Placement Evaluation"</strong> to profile execution targets.
                </p>
                <button
                  onClick={onAnalyze}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30"
                >
                  Start Placement Evaluation
                </button>
              </div>

              {/* 3 Pipeline Stages to avoid empty space */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t-2 border-slate-100 text-left text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-teal-700 uppercase">Phase 1</span>
                  <div className="font-bold text-slate-900">AST Loop Bounds</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Profiles trip count, memory access strides, and array dimensions.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-teal-700 uppercase">Phase 2</span>
                  <div className="font-bold text-slate-800">Traffic & Cache Hits</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Computes working set footprint, host cache hits, and PCIe transfer costs.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-teal-700 uppercase">Phase 3</span>
                  <div className="font-bold text-slate-800">Cost Model Placement</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Ranks Host CPU vs Direct NMC vs Interleaved TSV striping.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
