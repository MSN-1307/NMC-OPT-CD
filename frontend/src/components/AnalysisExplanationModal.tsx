import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BarChart3, 
  Cpu, 
  HardDrive, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Lightbulb,
  Layers,
  Activity,
  FileCode2,
  Maximize2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';
import type { AnalysisResponse, CostModelParameters } from '../types';

interface AnalysisExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: AnalysisResponse | null;
  parameters: CostModelParameters;
}

export const AnalysisExplanationModal: React.FC<AnalysisExplanationModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  parameters,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'kernel' | 'execution' | 'reasoning' | 'graphs' | 'improvements'>('all');

  if (!isOpen || !analysisResult) return null;

  const { recommendation, kernel_name, analysis: facts, candidates, chart_sensitivity: sensitivity } = analysisResult;
  const isWinnerNMC = recommendation.strategy !== 'CPU-only';

  // Comparative Graph Data
  const chartData = candidates.map((c) => ({
    strategy: c.strategy,
    latency: c.valid ? parseFloat(c.estimated_total_ms.toFixed(4)) : 0,
    compute: c.valid ? parseFloat(c.components_ms.compute_ms.toFixed(4)) : 0,
    transfer: c.valid ? parseFloat(c.components_ms.memory_or_transfer_ms.toFixed(4)) : 0,
    layout: c.valid ? parseFloat(c.components_ms.layout_conversion_ms.toFixed(4)) : 0,
    sync: c.valid ? parseFloat((c.components_ms.synchronization_ms + c.components_ms.overhead_ms).toFixed(4)) : 0,
    isValid: c.valid,
    isWinner: c.strategy === recommendation.strategy,
    speedup: c.valid ? c.speedup_vs_cpu : 0,
  }));

  const formatInputSizeLabel = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  const crossoverElements = analysisResult.crossover_elements;
  const crossoverLabel = analysisResult.crossover_point_label || 
    (crossoverElements ? `Crossover point ~${crossoverElements.toLocaleString()} Elements` : 'No Crossover (Compute-Bound)');

  // Derive dynamic crossover data from the real analytical chart_scaling points
  const crossoverData = (analysisResult.chart_scaling && analysisResult.chart_scaling.length > 0)
    ? analysisResult.chart_scaling.map((item) => {
        const isNearCrossover = crossoverElements 
          ? Math.abs(item.input_size - crossoverElements) / Math.max(crossoverElements, 1) < 0.12
          : false;
        const baseLabel = formatInputSizeLabel(item.input_size);
        return {
          size: isNearCrossover ? `${baseLabel} (Crossover)` : baseLabel,
          input_size: item.input_size,
          cpu: parseFloat(item.cpu_ms.toFixed(4)),
          nmc: parseFloat(item.nmc_ms.toFixed(4)),
          transformed: item.transformed_ms !== null && item.transformed_ms !== undefined ? parseFloat(item.transformed_ms.toFixed(4)) : null,
        };
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden transition-colors">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-600 text-white rounded-md shadow-sm shadow-teal-600/30">
              <Sparkles className="w-5 h-5 text-teal-100 fill-teal-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-400">
                  Compiler Decision Deep Dive
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {kernel_name}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                Optimization Analysis & Execution Walkthrough
              </h2>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close deep dive window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Complete Overview' },
            { id: 'kernel', label: '1. What Kernel Was' },
            { id: 'execution', label: '2. How Executed' },
            { id: 'reasoning', label: '3. Why Analyzation Succeeded' },
            { id: 'graphs', label: '4. Visual Graphs Comparison' },
            { id: 'improvements', label: '5. How to Improve' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Executive Verdict Callout */}
          <div className="p-5 rounded-md bg-white border border-slate-300 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-white px-2.5 py-0.5 rounded-full inline-block border border-teal-400">
                  Optimal Strategy
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {recommendation.strategy}
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {recommendation.reason}
                </p>
              </div>

              <div className="sm:text-right shrink-0 bg-white p-4 rounded-xl border border-teal-200 shadow-2xs">
                <div className="text-2xl font-black text-teal-700 font-mono">
                  {recommendation.estimated_cost_ms.toFixed(4)} ms
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {recommendation.speedup_vs_cpu > 1.0 
                    ? `⚡ ${recommendation.speedup_vs_cpu.toFixed(2)}x Faster than CPU-only` 
                    : `Baseline Host Execution`}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Latency savings: {((1 - (recommendation.estimated_cost_ms / candidates[0].estimated_total_ms)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: WHAT THAT KERNEL WAS */}
          {(activeTab === 'all' || activeTab === 'kernel') && (
            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white text-blue-700 rounded-xl border border-slate-300 shadow-2xs">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    1. What That Kernel Was (Workload Profile)
                  </h4>
                  <p className="text-xs text-slate-500">Mathematical characteristics and memory-to-computation profile</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[11px]">Total Operations</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {facts.estimated_operations.toLocaleString()} FLOPs
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Independent loop passes</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[11px]">Data Traffic Volume</span>
                  <span className="text-sm font-bold font-mono text-teal-700">
                    {(facts.total_bytes_moved / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Read: {(facts.estimated_bytes_read / 1024 / 1024).toFixed(1)} MB | Write: {(facts.estimated_bytes_written / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[11px]">Arithmetic Intensity</span>
                  <span className="text-sm font-bold font-mono text-purple-700">
                    {facts.arithmetic_intensity.toFixed(4)} FLOP/Byte
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-1">
                    {facts.arithmetic_intensity < 1.0 ? '🚨 Memory Bandwidth Bound' : 'Compute Bound'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-400 block text-[11px]">Memory Access Pattern</span>
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {facts.memory_access_pattern}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Cache Reuse Factor: {facts.reuse_factor}x</span>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-300 rounded-xl text-xs text-blue-900 leading-relaxed shadow-2xs">
                <strong>Why Arithmetic Intensity Matters:</strong> With an arithmetic intensity of{' '}
                <code className="font-mono font-bold">{facts.arithmetic_intensity.toFixed(3)} FLOP/Byte</code>,
                this kernel performs very few arithmetic calculations for every byte fetched from memory.
                On a standard CPU, execution halts while waiting for data across the narrow host bus (the famous <em>Memory Wall</em>).
              </div>
            </div>
          )}

          {/* SECTION 2: HOW WAS IT EXECUTED */}
          {(activeTab === 'all' || activeTab === 'execution') && (
            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white text-amber-700 rounded-xl border border-slate-300 shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    2. How Was It Executed (End-to-End Pipeline Steps)
                  </h4>
                  <p className="text-xs text-slate-500">Chronological stages modeled during execution</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs relative">
                  <div className="w-5 h-5 rounded-full bg-white text-slate-800 border border-slate-200 font-bold text-[10px] flex items-center justify-center mb-2 shadow-2xs">1</div>
                  <div className="font-bold text-slate-800 mb-1">Host Dispatch</div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Host CPU prepares DMA buffers, pins memory, and triggers kernel launch ({parameters.host_to_nmc_overhead_ms} ms).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs relative">
                  <div className="w-5 h-5 rounded-full bg-white text-slate-800 border border-slate-200 font-bold text-[10px] flex items-center justify-center mb-2 shadow-2xs">2</div>
                  <div className="font-bold text-slate-800 mb-1">PCIe/CXL Transfer</div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Input arrays streamed over high-speed link at {parameters.host_link_bandwidth_gbps} GB/s into device memory.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-2xs relative">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center mb-2">3</div>
                  <div className="font-bold text-teal-950 mb-1">Bank Interleaving</div>
                  <p className="text-[11px] text-teal-800 leading-normal">
                    Data sliced across DRAM banks to avoid bank collisions and achieve {parameters.nmc_effective_bandwidth_gbps} GB/s internal throughput.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-2xs relative">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center mb-2">4</div>
                  <div className="font-bold text-teal-950 mb-1">In-Memory Compute</div>
                  <p className="text-[11px] text-teal-800 leading-normal">
                    ALUs located directly inside DRAM banks process vector elements in parallel without bus round-trips.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs relative">
                  <div className="w-5 h-5 rounded-full bg-white text-slate-800 border border-slate-200 font-bold text-[10px] flex items-center justify-center mb-2 shadow-2xs">5</div>
                  <div className="font-bold text-slate-800 mb-1">Sync & Writeback</div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    DMA completion barrier ({parameters.synchronization_overhead_ms} ms), output retrieved to host CPU.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: WHY DID IT GIVE THAT ANALYZATION */}
          {(activeTab === 'all' || activeTab === 'reasoning') && (
            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white text-teal-700 rounded-xl border border-slate-300 shadow-2xs">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    3. Why Did It Give That Analyzation? (Compiler Analytical Reasoning)
                  </h4>
                  <p className="text-xs text-slate-500">First-principles mathematical proof comparing CPU vs Near-Memory</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <span className="font-bold text-blue-700 block">Host CPU Execution Math:</span>
                  <div className="font-mono bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div>Compute: {candidates[0].components_ms.compute_ms.toFixed(4)} ms</div>
                    <div>DRAM Bus: {candidates[0].components_ms.memory_or_transfer_ms.toFixed(4)} ms</div>
                    <div className="font-bold text-slate-900 pt-1 border-t border-slate-100">
                      Total CPU Latency: {candidates[0].estimated_total_ms.toFixed(4)} ms
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    The CPU is throttled by its external DDR bus speed ({parameters.cpu_effective_bandwidth_gbps} GB/s). 
                    Over 85% of time is spent idling while data transfers across the motherboard traces.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-2">
                  <span className="font-bold text-teal-700 block">Optimal Strategy Math ({recommendation.strategy}):</span>
                  <div className="font-mono bg-white p-2.5 rounded border border-teal-200 space-y-1 text-teal-950">
                    <div>PIM Compute & Internal DRAM: {recommendation.estimated_cost_ms.toFixed(4)} ms</div>
                    <div className="font-bold text-emerald-600 pt-1 border-t border-teal-100">
                      Speedup: {recommendation.speedup_vs_cpu.toFixed(2)}x vs Host CPU
                    </div>
                  </div>
                  <p className="text-teal-900 text-[11px] leading-relaxed">
                    By computing directly adjacent to DRAM row buffers at {parameters.nmc_effective_bandwidth_gbps} GB/s, 
                    the massive internal memory bandwidth amortizes the one-time link transfer overhead, yielding a net speedup.
                  </p>
                </div>
              </div>

              {/* Tradeoff Pills */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Considered Tradeoffs:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {recommendation.key_tradeoffs.map((to, i) => (
                    <div key={i} className="flex items-start space-x-2 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{to}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: MAINLY SHOW GRAPH VISUALS */}
          {(activeTab === 'all' || activeTab === 'graphs') && (
            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white text-purple-700 rounded-xl border border-slate-300 shadow-2xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    4. Visual Graphs: Why This Strategy Beats Other Methods
                  </h4>
                  <p className="text-xs text-slate-500">Side-by-side latency comparison and component decomposition</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* GRAPH 1: Latency Comparison (Bar Chart) */}
                <div className="p-4 bg-white rounded-md border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-800">Execution Latency by Target (Lower is Faster)</span>
                    <span className="text-[11px] text-teal-600 font-bold">Winner: {recommendation.strategy}</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="strategy" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" />
                        <YAxis unit=" ms" tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(val: any) => [`${val} ms`, 'Estimated Time']}
                          contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Bar dataKey="latency" name="Total Latency (ms)" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isWinner ? '#0d9488' : entry.isValid ? '#64748b' : '#cbd5e1'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    The teal bar ({recommendation.strategy}) delivers the lowest execution wall-clock time.
                  </p>
                </div>

                {/* GRAPH 2: Stacked Components Breakdown */}
                <div className="p-4 bg-white rounded-md border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-800">Time Breakdown: Where Milliseconds Go</span>
                    <span className="text-[11px] text-slate-400">Compute vs Transfer vs Overheads</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.filter(c => c.isValid)} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="strategy" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" />
                        <YAxis unit=" ms" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="compute" name="Compute/DRAM (ms)" stackId="a" fill="#0d9488" />
                        <Bar dataKey="transfer" name="Link Transfer (ms)" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="layout" name="Layout Reorg (ms)" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="sync" name="Sync/Overhead (ms)" stackId="a" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Notice how Near-Memory reduces internal memory access time (green) compared to CPU memory bus stall.
                  </p>
                </div>

                {/* GRAPH 3: Problem Size Crossover Line Chart */}
                <div className="p-4 bg-white rounded-md border border-slate-200 shadow-2xs space-y-2 lg:col-span-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-bold text-xs text-slate-800">Input Size Scaling Crossover Curve</span>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-300">
                      {crossoverLabel}
                    </span>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={crossoverData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="size" tick={{ fontSize: 10 }} />
                        <YAxis unit=" ms" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="cpu" name="CPU-Only (ms)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="nmc" name="Near-Memory (ms)" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} />
                        {crossoverData.some((d) => d.transformed !== null && d.transformed !== undefined) && (
                          <Line type="monotone" dataKey="transformed" name="NMC + Transformed (ms)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                    {crossoverElements ? (
                      <>
                        For <strong className="text-slate-800">{kernel_name}</strong>, at smaller sizes (&lt;{crossoverElements.toLocaleString()} elements), CPU wins because PCIe launch overhead is not amortized. At larger sizes, Near-Memory execution scales with DRAM bank bandwidth and vastly outpaces CPU!
                      </>
                    ) : (
                      <>
                        For <strong className="text-slate-800">{kernel_name}</strong> (arithmetic intensity {facts.arithmetic_intensity.toFixed(3)} FLOP/B), host CPU remains optimal across problem sizes because execution is compute-bound rather than memory-bandwidth-bound.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: HOW CAN WE IMPROVE */}
          {(activeTab === 'all' || activeTab === 'improvements') && (
            <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white text-emerald-700 rounded-xl border border-slate-300 shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    5. How Can We Improve Further? (Recommended Optimizations)
                  </h4>
                  <p className="text-xs text-slate-500">Actionable compiler passes to unlock additional performance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Loop Tiling & Bank Blocking</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Tile loop iterations into block sizes matching DRAM bank SRAM buffers (64 KB). Prevents cache thrashing and bank conflicts across channels.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Layers className="w-4 h-4 text-teal-500" />
                    <span>In-Memory Loop Fusion</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Fuse consecutive pointwise loops (e.g. Scaling + ReLU). Eliminates writing intermediate results back to DRAM cells, keeping operands in registers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <HardDrive className="w-4 h-4 text-blue-500" />
                    <span>Double-Buffered DMA Streaming</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Overlap host-device transfer of chunk (k+1) while PIM ALUs compute chunk (k). Hides up to 70% of PCIe bus latency.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            NMC-Opt Studio • First-Principles Analytical Cost Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/30"
          >
            Got it, Return to Workbench
          </button>
        </div>

      </div>
    </div>
  );
};
