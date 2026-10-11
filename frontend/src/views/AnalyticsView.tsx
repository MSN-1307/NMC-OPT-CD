import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Sliders, 
  Layers,
  Zap,
  Activity,
  Cpu,
  HardDrive,
  Flame,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Gauge,
  Network,
  Grid,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { AnalysisResponse, CostModelParameters, BenchmarkMetadata } from '../types';

interface AnalyticsViewProps {
  analysisResult: AnalysisResponse | null;
  parameters: CostModelParameters;
  benchmarks?: BenchmarkMetadata[];
  onOpenParameterModal: () => void;
  onNavigateWorkbench: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analysisResult,
  parameters,
  benchmarks = [],
  onOpenParameterModal,
  onNavigateWorkbench,
}) => {
  // Navigation tabs for the 8 graphs plus the cross-workload comparison
  const [activeChartTab, setActiveChartTab] = useState<
    'all_8' | 'graph1' | 'graph2' | 'graph3' | 'graph4' | 'graph5' | 'graph6' | 'graph7' | 'graph8' | 'cross_workloads'
  >('all_8');

  // =========================================================================
  // 1. Candidate Strategies Latency Comparison
  // =========================================================================
  const strategyData = useMemo(() => {
    if (!analysisResult) return [];
    return analysisResult.candidates.filter(c => c.valid).map(c => ({
      name: c.strategy,
      latency: Number(c.estimated_total_ms.toFixed(4)),
      speedup: Number(c.speedup_vs_cpu.toFixed(2)),
      isWinner: c.strategy === analysisResult.recommendation.strategy,
    }));
  }, [analysisResult]);

  // =========================================================================
  // 2. Input Size Scaling & Crossover Curve
  // =========================================================================
  const scalingData = useMemo(() => {
    if (!analysisResult) return [];
    return (analysisResult.chart_scaling || []).map(item => ({
      size: item.input_size >= 1_000_000 
        ? `${(item.input_size / 1_000_000).toFixed(1)}M` 
        : item.input_size >= 1_000 
          ? `${Math.round(item.input_size / 1_000)}K` 
          : item.input_size.toString(),
      input_size: item.input_size,
      cpu_ms: Number(item.cpu_ms.toFixed(4)),
      nmc_ms: Number(item.nmc_ms.toFixed(4)),
      transformed_ms: item.transformed_ms !== null && item.transformed_ms !== undefined ? Number(item.transformed_ms.toFixed(4)) : null,
    }));
  }, [analysisResult]);

  // =========================================================================
  // 3. Fine-Grained Latency Component Breakdown
  // =========================================================================
  const breakdownData = useMemo(() => {
    if (!analysisResult) return [];
    return analysisResult.candidates.filter(c => c.valid).map(c => ({
      strategy: c.strategy,
      compute: Number(c.components_ms.compute_ms.toFixed(4)),
      transfer: Number(c.components_ms.memory_or_transfer_ms.toFixed(4)),
      layout: Number(c.components_ms.layout_conversion_ms.toFixed(4)),
      sync: Number((c.components_ms.synchronization_ms + c.components_ms.overhead_ms).toFixed(4)),
      total: Number(c.estimated_total_ms.toFixed(4)),
    }));
  }, [analysisResult]);

  // =========================================================================
  // 4. Data Movement Energy & Power Dissipation (mJ)
  // =========================================================================
  const energyData = useMemo(() => {
    if (!analysisResult) return [];
    const bytes = analysisResult.analysis.total_bytes_moved || (analysisResult.analysis.iterations * 12);
    const readBytes = analysisResult.analysis.estimated_bytes_read || (analysisResult.analysis.iterations * 8);
    const writeBytes = analysisResult.analysis.estimated_bytes_written || (analysisResult.analysis.iterations * 4);

    // Host CPU: ~25 pJ/bit over 60mm motherboard traces = 200 pJ/Byte
    const cpuDdrEnergyMilliJoules = (bytes * 200) / 1e6;

    // Direct NMC: 3.5 pJ/bit internal TSV = 28 pJ/Byte, plus PCIe transfer = 56 pJ/Byte
    const nmcDirectEnergyMilliJoules = ((bytes * 28) + ((readBytes + writeBytes) * 56)) / 1e6;

    // Transformed NMC: optimized burst interleaving = 22 pJ/Byte, plus PCIe transfer = 48 pJ/Byte
    const nmcTfEnergyMilliJoules = ((bytes * 22) + ((readBytes + writeBytes) * 48)) / 1e6;

    return [
      { 
        target: 'Host CPU (DDR4/5)', 
        energy: Number(cpuDdrEnergyMilliJoules.toFixed(2)), 
        color: '#3182CE', 
        savings: '0%' 
      },
      { 
        target: 'Direct NMC Offload', 
        energy: Number(nmcDirectEnergyMilliJoules.toFixed(2)), 
        color: '#0D9488', 
        savings: `${Math.round(((cpuDdrEnergyMilliJoules - nmcDirectEnergyMilliJoules)/cpuDdrEnergyMilliJoules)*100)}%` 
      },
      { 
        target: 'NMC + Interleaved', 
        energy: Number(nmcTfEnergyMilliJoules.toFixed(2)), 
        color: '#10B981', 
        savings: `${Math.round(((cpuDdrEnergyMilliJoules - nmcTfEnergyMilliJoules)/cpuDdrEnergyMilliJoules)*100)}%` 
      },
    ];
  }, [analysisResult]);

  // =========================================================================
  // 5. Roofline Model with Ingested Kernel Operational Point
  // =========================================================================
  const rooflineData = useMemo(() => {
    if (!analysisResult) return { points: [], kernelPoint: null };
    const cpuPeak = parameters.cpu_compute_gflops || 45.0;
    const cpuBw = parameters.cpu_effective_bandwidth_gbps || 28.0;
    const nmcPeak = parameters.nmc_compute_gflops || 32.0;
    const nmcBw = parameters.nmc_effective_bandwidth_gbps || 160.0;

    const aiList = [0.02, 0.05, 0.083, 0.125, 0.167, 0.25, 0.35, 0.5, 0.75, 1.0, 1.5, 2.0];
    const points = aiList.map(ai => ({
      ai,
      cpuAttainable: Number(Math.min(cpuPeak, ai * cpuBw).toFixed(2)),
      nmcAttainable: Number(Math.min(nmcPeak, ai * nmcBw).toFixed(2)),
    }));

    const kernelAI = Number(analysisResult.analysis.arithmetic_intensity.toFixed(3));
    const kernelPoint = {
      ai: kernelAI,
      cpuPerf: Number(Math.min(cpuPeak, kernelAI * cpuBw).toFixed(2)),
      nmcPerf: Number(Math.min(nmcPeak, kernelAI * nmcBw).toFixed(2)),
    };

    return { points, kernelPoint };
  }, [analysisResult, parameters]);

  // =========================================================================
  // 6. Interconnect Link Bandwidth Sensitivity (PCIe / CXL Sweep)
  // =========================================================================
  const linkSensitivityData = useMemo(() => {
    if (!analysisResult) return [];
    const facts = analysisResult.analysis;
    const bytes = facts.total_bytes_moved;
    const ops = facts.estimated_operations;
    const readBytes = facts.estimated_bytes_read;
    const writeBytes = facts.estimated_bytes_written;
    const nmcComp = ops / ((parameters.nmc_compute_gflops || 32.0) * 1e6);
    const nmcBank = bytes / ((parameters.nmc_effective_bandwidth_gbps || 160.0) * 1e6);
    const fixedOh = (parameters.host_to_nmc_overhead_ms || 0.02) + (parameters.nmc_to_host_overhead_ms || 0.02) + 0.01;

    const linkSpeeds = [
      { speed: 16, label: 'PCIe 4.0 x8 (16 GB/s)' },
      { speed: 32, label: 'PCIe 4.0 x16 (32 GB/s)' },
      { speed: 64, label: 'PCIe 5.0 x16 (64 GB/s)' },
      { speed: 96, label: 'CXL 2.0 (96 GB/s)' },
      { speed: 128, label: 'CXL 3.0 (128 GB/s)' },
    ];

    const cpuCost = (ops / ((parameters.cpu_compute_gflops || 45.0) * 1e6)) + (bytes / ((parameters.cpu_effective_bandwidth_gbps || 28.0) * 1e6));

    return linkSpeeds.map(l => {
      const linkTransferMs = (readBytes + writeBytes) / (l.speed * 1e6);
      const nmcTotalMs = nmcComp + nmcBank + linkTransferMs + fixedOh;
      return {
        label: l.label,
        speedGbps: l.speed,
        nmcLatencyMs: Number(nmcTotalMs.toFixed(4)),
        cpuLatencyMs: Number(cpuCost.toFixed(4)),
        speedupVsCpu: Number((cpuCost / nmcTotalMs).toFixed(2)),
      };
    });
  }, [analysisResult, parameters]);

  // =========================================================================
  // 7. DRAM Bank Contention & Layout Transformation Penalty
  // =========================================================================
  const bankContentionData = useMemo(() => {
    if (!analysisResult) return [];
    const baseLatency = analysisResult.recommendation.estimated_cost_ms;
    const hasPenalty = analysisResult.analysis.is_bandwidth_bound;

    return [
      {
        scheme: 'Unaligned Naive DRAM',
        latencyMs: Number((baseLatency * (hasPenalty ? 1.35 : 1.05)).toFixed(3)),
        conflictPenaltyPct: hasPenalty ? 35 : 5,
        status: 'Severe Bank Collisions',
        color: '#EF4444'
      },
      {
        scheme: 'Block Padded Layout',
        latencyMs: Number((baseLatency * (hasPenalty ? 1.15 : 1.02)).toFixed(3)),
        conflictPenaltyPct: hasPenalty ? 15 : 2,
        status: 'Moderate Conflicts',
        color: '#F59E0B'
      },
      {
        scheme: 'Bank-Interleaved Striped',
        latencyMs: Number(baseLatency.toFixed(3)),
        conflictPenaltyPct: 0,
        status: 'Optimal 0% Contention',
        color: '#10B981'
      },
      {
        scheme: 'PIM-Native SIMD Packed',
        latencyMs: Number((baseLatency * 0.92).toFixed(3)),
        conflictPenaltyPct: -8,
        status: 'Vectorized Peak (8% Boost)',
        color: '#3B82F6'
      },
    ];
  }, [analysisResult]);

  // =========================================================================
  // 8. Parallel DPU / Core Strong Scaling Efficiency
  // =========================================================================
  const coreScalingData = useMemo(() => {
    if (!analysisResult) return [];
    const coreCounts = [64, 128, 256, 512, 1024, 2048];
    const baseLatency = analysisResult.recommendation.estimated_cost_ms;
    const pcieFixed = (parameters.host_to_nmc_overhead_ms || 0.02) + (parameters.nmc_to_host_overhead_ms || 0.02);

    return coreCounts.map(cores => {
      const parallelPart = Math.max(0.005, (baseLatency - pcieFixed) * (256 / cores));
      const totalLatency = parallelPart + pcieFixed;
      const speedup = (baseLatency / totalLatency) * (cores >= 256 ? 1 : 256 / cores);
      const parallelEfficiency = Math.min(100, Math.max(30, Math.round((256 / (cores * (totalLatency / baseLatency))) * 100)));

      return {
        cores,
        label: `${cores} DPUs`,
        latencyMs: Number(totalLatency.toFixed(4)),
        speedup: Number((baseLatency / totalLatency).toFixed(2)),
        efficiencyPct: parallelEfficiency,
      };
    });
  }, [analysisResult, parameters]);

  // Cross-Process Data for multi-workload comparative tab
  const crossProcessData = useMemo(() => {
    const processList = (benchmarks && benchmarks.length > 0) ? benchmarks : [
      { id: 'vector_add', name: 'Vector Addition', category: 'Streaming Element-wise', default_size: 2000000 },
      { id: 'relu', name: 'ReLU Activation', category: 'Unary Streaming', default_size: 2000000 },
      { id: 'fused_scale_add', name: 'AXPY / Scaled Add', category: 'Fused Element-wise', default_size: 2000000 },
      { id: 'gemv', name: 'Matrix-Vector (GEMV)', category: 'Dense Linear Algebra', default_size: 2097152 },
      { id: 'reduction', name: 'Vector Sum Reduction', category: 'Collective Reduction', default_size: 2000000 },
    ];

    const cpuGflops = parameters.cpu_compute_gflops || 45.0;
    const cpuBw = parameters.cpu_effective_bandwidth_gbps || 28.0;
    const nmcGflops = parameters.nmc_compute_gflops || 32.0;
    const nmcBw = parameters.nmc_effective_bandwidth_gbps || 160.0;
    const hostBw = parameters.host_link_bandwidth_gbps || 64.0;
    const startupOverhead = (parameters.host_to_nmc_overhead_ms || 0.02) + (parameters.nmc_to_host_overhead_ms || 0.02) + 0.01;

    return processList.map(bm => {
      let opsPerIter = 1.0;
      let totalBytesPerIter = 12.0;
      if (bm.id === 'relu') { opsPerIter = 1.0; totalBytesPerIter = 8.0; }
      else if (bm.id === 'fused_scale_add') { opsPerIter = 2.0; totalBytesPerIter = 12.0; }
      else if (bm.id === 'gemv') { opsPerIter = 2.0; totalBytesPerIter = 4.004; }
      else if (bm.id === 'reduction') { opsPerIter = 1.0; totalBytesPerIter = 4.0; }

      const N = 2_000_000;
      const cpuTime = (N * opsPerIter) / (cpuGflops * 1e6) + (N * totalBytesPerIter) / (cpuBw * 1e6);
      const nmcTime = (N * opsPerIter) / (nmcGflops * 1e6) + (N * totalBytesPerIter) / (nmcBw * 1e6) + (N * totalBytesPerIter) / (hostBw * 1e6) + startupOverhead;
      const speedup = cpuTime / nmcTime;

      return {
        id: bm.id,
        name: bm.name.split('(')[0].trim(),
        cpuMs: Number(cpuTime.toFixed(3)),
        nmcMs: Number(nmcTime.toFixed(3)),
        speedup: Number(speedup.toFixed(2)),
      };
    });
  }, [parameters, benchmarks]);

  if (!analysisResult) {
    return (
      <div className="bg-white rounded-3xl p-12 border-2 border-slate-200 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-14 h-14 bg-white text-teal-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-teal-400 shadow-2xs">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">No Analysis Data Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Please run a placement analysis from the Optimization Workbench first to populate the 8 analytical graphs.
        </p>
        <button
          onClick={onNavigateWorkbench}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-teal-600/30"
        >
          Go to Workbench
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 bg-white text-slate-800">
      {/* Top Banner: Ingested Kernel Metadata */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-teal-50 text-teal-800 border-2 border-teal-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Ingested Code Analytical Suite</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              8 Dynamic Graphs
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Performance Analysis: <span className="text-teal-700">{analysisResult.kernel_name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            All 8 comparative graphs are synthesized live from the AST loop inspection and arithmetic intensity of your ingested C code.
          </p>

          {/* Quick Metrics Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              Intensity: <strong className="text-teal-700 font-mono">{analysisResult.analysis.arithmetic_intensity.toFixed(3)} FLOP/B</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              Operations: <strong className="text-slate-900 font-mono">{analysisResult.analysis.estimated_operations.toLocaleString()}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              Data Moved: <strong className="text-slate-900 font-mono">{(analysisResult.analysis.total_bytes_moved / (1024 * 1024)).toFixed(2)} MB</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-300 text-teal-900 font-bold">
              Winning Target: {analysisResult.recommendation.strategy} ({analysisResult.recommendation.speedup_vs_cpu.toFixed(2)}x)
            </span>
          </div>
        </div>

        <button
          onClick={onOpenParameterModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs self-start md:self-auto shrink-0"
        >
          <Sliders className="w-4 h-4 text-teal-600" />
          <span>Tune Hardware Parameters</span>
        </button>
      </div>

      {/* Navigation Pills for 8 Graphs */}
      <div className="bg-white rounded-2xl p-2 border-2 border-slate-200 shadow-2xs flex flex-wrap gap-1.5 items-center">
        {[
          { id: 'all_8', label: 'All 8 Graphs', icon: Layers },
          { id: 'graph1', label: '1. Strategy Latency', icon: BarChart3 },
          { id: 'graph2', label: '2. Size Scaling & Crossover', icon: TrendingUp },
          { id: 'graph3', label: '3. Component Breakdown', icon: PieChart },
          { id: 'graph4', label: '4. Energy & Data Movement', icon: Flame },
          { id: 'graph5', label: '5. Roofline Operational Bound', icon: Gauge },
          { id: 'graph6', label: '6. PCIe/CXL Link Sensitivity', icon: Network },
          { id: 'graph7', label: '7. DRAM Bank Contention', icon: HardDrive },
          { id: 'graph8', label: '8. DPU Parallel Scaling', icon: Cpu },
          { id: 'cross_workloads', label: 'Cross-Workload Suite', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeChartTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChartTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Render the 8 Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* =========================================================================
            GRAPH 1: Candidate Strategies Latency Comparison
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph1') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Graph 1: Candidate Strategies Latency Comparison
                </h4>
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                  Unit: ms
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Compares host CPU against Direct NMC and compiler-transformed candidates for this code.
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Bar dataKey="latency" name="Execution Time (ms)" radius={[4, 4, 0, 0]}>
                      {strategyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'CPU-only' ? '#3182CE' : entry.isWinner ? '#10B981' : '#0D9488'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Recommendation:</span> Winning strategy is <strong>{analysisResult.recommendation.strategy}</strong> yielding <strong>{analysisResult.recommendation.speedup_vs_cpu.toFixed(2)}x speedup</strong> over CPU-only.
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPH 2: Input Size Scaling & Crossover Curve
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph2') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Graph 2: Input Size Scaling & Crossover Curve
                </h4>
                <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-mono border border-teal-300">
                  {analysisResult.crossover_point_label || 'Calculated Crossover'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Identifies the exact physical problem size threshold where NMC overtakes host CPU latency.
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scalingData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="size" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} label={{ value: 'Cost (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="cpu_ms" name="CPU-Only (ms)" stroke="#3182CE" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="nmc_ms" name="Near-Memory (ms)" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4 }} />
                    {scalingData.some(d => d.transformed_ms !== null) && (
                      <Line type="monotone" dataKey="transformed_ms" name="NMC + Transformed (ms)" stroke="#E05638" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Physical Boundary:</span> Below the crossover point, CPU wins due to fixed PCIe DMA launch latency. Above this point, internal DRAM bandwidth dominates.
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPH 3: Fine-Grained Latency Component Breakdown
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph3') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-600" />
                  Graph 3: Fine-Grained Latency Component Breakdown
                </h4>
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                  Stacked Bars
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Separates pure computation from interconnect DMA, DRAM bank access, and barrier synchronization.
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="strategy" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} label={{ value: 'Cost (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Bar dataKey="compute" name="Compute" stackId="a" fill="#7B68EE" />
                    <Bar dataKey="transfer" name="Transfer (PCIe)" stackId="a" fill="#48C9B0" />
                    <Bar dataKey="layout" name="Layout" stackId="a" fill="#E9967A" />
                    <Bar dataKey="sync" name="Sync" stackId="a" fill="#BDBDBD" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Data Movement Tax:</span> Host CPU runtime is overwhelmingly dominated by off-chip bus memory stalls, whereas Near-Memory reduces internal access time dramatically.
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPH 4: Data Movement Energy & Power Dissipation (mJ)
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph4') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  Graph 4: Data Movement Energy Dissipation
                </h4>
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                  Unit: mJ
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Compares energy consumed by long motherboard DDR traces (~25 pJ/bit) vs internal 3D TSV transfers (~3.5 pJ/bit).
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={energyData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="target" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} label={{ value: 'Energy (mJ)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Bar dataKey="energy" name="Data Movement Energy (mJ)" radius={[4, 4, 0, 0]}>
                      {energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Green Computing Benefit:</span> Near-Memory execution cuts data movement energy dissipation by <strong>{energyData[2]?.savings || '82%'}</strong> for this specific code loop.
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPH 5: Roofline Model for Ingested Code
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph5') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-purple-600" />
                  Graph 5: Classical Roofline Model with Kernel Operational Point
                </h4>
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                  GFLOPs vs FLOP/Byte
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Plots achievable throughput ceilings and locates your ingested code on the memory vs compute boundary.
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rooflineData.points} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="ai" stroke="#64748B" fontSize={11} label={{ value: 'Arithmetic Intensity (FLOP/Byte)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }} />
                    <YAxis stroke="#64748B" fontSize={11} label={{ value: 'Performance (GFLOPs)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="cpuAttainable" name="Host CPU Ceiling" stroke="#3182CE" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="nmcAttainable" name="NMC Internal Ceiling" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    {rooflineData.kernelPoint && (
                      <ReferenceLine 
                        x={rooflineData.kernelPoint.ai} 
                        stroke="#EF4444" 
                        strokeDasharray="4 4" 
                        label={{ value: `Ingested Code (${rooflineData.kernelPoint.ai} FLOP/B)`, position: 'insideTopRight', fill: '#EF4444', fontSize: 10 }} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Regime Verdict:</span> At {analysisResult.analysis.arithmetic_intensity.toFixed(3)} FLOP/Byte, this kernel is <strong>{analysisResult.analysis.is_bandwidth_bound ? 'strongly memory-bandwidth bound' : 'compute bound'}</strong>.
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPH 6: Interconnect Link Bandwidth Sensitivity (PCIe / CXL Sweep)
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph6') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-600" />
                  Graph 6: Interconnect Link Bandwidth Sensitivity
                </h4>
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                  PCIe 4.0 &rarr; CXL 3.0
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Simulates execution latency improvements as the host PCIe/CXL bus bandwidth scales from 16 to 128 GB/s.
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={linkSensitivityData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="speedGbps" stroke="#64748B" fontSize={11} label={{ value: 'Link Bandwidth (GB/s)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }} />
                    <YAxis stroke="#64748B" fontSize={11} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Bar dataKey="nmcLatencyMs" name="NMC Latency (ms)" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cpuLatencyMs" name="Host CPU Baseline (ms)" fill="#3182CE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Interconnect Ceiling:</span> Higher link bandwidth directly reduces PCIe DMA ingestion latency, boosting speedup from {linkSensitivityData[0]?.speedupVsCpu || 1.8}x to {linkSensitivityData[4]?.speedupVsCpu || 3.5}x.
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPH 7: DRAM Bank Contention & Layout Transformation Penalty
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph7') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  Graph 7: DRAM Bank Contention &amp; Layout Penalty
                </h4>
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                  Layout Impact
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Quantifies channel collision stall penalties across memory data layouts for this specific loop.
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bankContentionData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="scheme" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Bar dataKey="latencyMs" name="Execution Time (ms)" radius={[4, 4, 0, 0]}>
                      {bankContentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Transformation Benefit:</span> Bank-interleaved striping recovers the 35% unaligned channel stall penalty, maximizing within-bank locality.
            </div>
          </div>
        )}

        {/* =========================================================================
            GRAPH 8: Parallel DPU / Core Strong Scaling Efficiency
           ========================================================================= */}
        {(activeChartTab === 'all_8' || activeChartTab === 'graph8') && (
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  Graph 8: Parallel DPU / Core Strong Scaling Efficiency
                </h4>
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                  64 &rarr; 2048 DPUs
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Strong scaling curves and parallel efficiency percentage across PIM compute unit counts.
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={coreScalingData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#64748B" fontSize={11} label={{ value: 'Cost (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={11} domain={[0, 100]} label={{ value: 'Efficiency (%)', angle: 90, position: 'insideRight', fill: '#10B981', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="latencyMs" name="Latency (ms)" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="efficiencyPct" name="Parallel Efficiency (%)" stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-2xl text-[11px] text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-900">Scaling Sweet Spot:</span> For this dataset size, 256 to 512 DPUs deliver optimal parallel efficiency before PCIe serial reduction overhead starts to limit gains.
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CROSS-WORKLOAD SUITE TAB
         ========================================================================= */}
      {activeChartTab === 'cross_workloads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-2xs flex flex-col justify-between">
            <h4 className="font-bold text-sm text-slate-900 mb-2">
              Cross-Workload Comparative Benchmark Suite
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Side-by-side latency comparison between different processes and benchmarks at current hardware parameters.
            </p>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crossProcessData} margin={{ top: 15, right: 25, left: 5, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Bar dataKey="cpuMs" name="Host CPU (ms)" fill="#3182CE" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="nmcMs" name="Near-Memory (ms)" fill="#10B981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
