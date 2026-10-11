import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  BarChart2,
  TrendingUp,
  Grid,
  Layers,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  BookOpen,
  Info,
  Zap,
  CheckCircle2,
  Cpu,
  HardDrive,
  Activity,
  Layers3,
  Network,
} from 'lucide-react';
import type { 
  ResearchGraphsResponse, 
  CostModelParameters, 
  ResearchGraphsRequest,
} from '../types';
import { DEFAULT_PARAMETERS } from '../data/defaults';
import { fetchResearchGraphs } from '../services/api';

interface ResearchGraphsViewProps {
  onNavigateWorkbench?: () => void;
}

export const ResearchGraphsView: React.FC<ResearchGraphsViewProps> = ({ onNavigateWorkbench }) => {
  const [data, setData] = useState<ResearchGraphsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Research Suite: 'suiteA' (Cost Model & Crossover) vs 'suiteB' (IMTP Tensor & PIM Suite)
  const [activeSuite, setActiveSuite] = useState<'suiteA' | 'suiteB'>('suiteB');

  // Suite A sub-tab: 'fig1' | 'fig2' | 'fig3' | 'fig4'
  const [suiteATab, setSuiteATab] = useState<'fig1' | 'fig2' | 'fig3' | 'fig4'>('fig1');

  // Suite B sub-tab: 'fig4_tiling' | 'fig9_tensor' | 'fig10_llm' | 'fig11_scatter'
  const [suiteBTab, setSuiteBTab] = useState<'fig4_tiling' | 'fig9_tensor' | 'fig10_llm' | 'fig11_scatter'>('fig4_tiling');

  // Subfigure toggles for Fig 4: 'a' | 'b' | 'c_512' | 'c_8192'
  const [fig4SubTab, setFig4SubTab] = useState<'a' | 'b' | 'c_512' | 'c_8192'>('b');

  // Subfigure toggles for Fig 9: '4mb' | '256mb'
  const [fig9SubTab, setFig9SubTab] = useState<'4mb' | '256mb'>('4mb');

  // Subfigure toggles for Fig 10: 'mtv' | 'mmtv'
  const [fig10SubTab, setFig10SubTab] = useState<'mtv' | 'mmtv'>('mtv');

  // Selected kernel for deep dive in Suite A
  const [selectedKernelId, setSelectedKernelId] = useState<string>('vector_add');

  // Hardware parameter tuner drawer state
  const [showTuner, setShowTuner] = useState<boolean>(false);
  const [params, setParams] = useState<CostModelParameters>({ ...DEFAULT_PARAMETERS });
  const [isUpdatingParams, setIsUpdatingParams] = useState<boolean>(false);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Initial load
  const loadData = async (customParams?: CostModelParameters) => {
    setIsLoading(true);
    setError(null);
    try {
      const req: ResearchGraphsRequest | undefined = customParams 
        ? { parameters: customParams, breakdown_n: 4_194_304, speedup_n: 16_777_216 }
        : undefined;
      const res = await fetchResearchGraphs(req);
      setData(res);
      if (res.parameters) {
        setParams(res.parameters);
      }
    } catch (err: any) {
      console.error('Error fetching research graphs:', err);
      setError(err?.message || 'Failed to generate dynamic research graphs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyParams = async () => {
    setIsUpdatingParams(true);
    await loadData(params);
    setIsUpdatingParams(false);
  };

  const handleResetParams = async () => {
    setParams({ ...DEFAULT_PARAMETERS });
    setIsUpdatingParams(true);
    await loadData(DEFAULT_PARAMETERS);
    setIsUpdatingParams(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const selectedKernel = data?.kernels.find((k) => k.id === selectedKernelId) || data?.kernels[0];

  // Helper for Suite A Figure 1: Cost breakdown
  const currentKernelBreakdown = data?.cost_breakdown.find((b) => b.kernel_id === selectedKernelId);
  const fig1Data = currentKernelBreakdown?.strategies.map((s) => ({
    strategy: s.strategy,
    compute: Number(s.compute_ms.toFixed(4)),
    transfer: Number(s.transfer_ms.toFixed(4)),
    layout: Number(s.layout_ms.toFixed(4)),
    sync: Number(s.sync_ms.toFixed(4)),
    total: Number(s.total_ms.toFixed(4)),
  })) || [];

  // Helper for Suite A Figure 2: Speedup comparison
  const fig2Data = data?.speedup_comparison.map((s) => ({
    name: s.kernel_name.replace(' (VADD)', '').replace(' (AXPY)', '').replace(' (MUL)', '').replace(' (SUM)', '').replace(' (RELU)', ''),
    kernel_id: s.kernel_id,
    vsCPU: Number(s.speedup_vs_cpu.toFixed(2)),
    vsNaive: Number(s.speedup_vs_naive_nmc.toFixed(2)),
    chosen_strategy: s.chosen_strategy,
    chosen_ms: s.chosen_ms,
    cpu_ms: s.cpu_ms,
    naive_nmc_ms: s.naive_nmc_ms,
  })) || [];

  // Helper for Suite A Figure 3: Crossover curve
  const currentKernelCrossover = data?.crossover_curves.find((c) => c.kernel_id === selectedKernelId);
  const fig3Data = currentKernelCrossover?.points.map((p) => ({
    label: p.n_label,
    n: p.n,
    CPU: Number(p.cpu_ms.toFixed(4)),
    NMC: Number(p.nmc_ms.toFixed(4)),
    NMC_Transform: Number(p.nmc_transform_ms.toFixed(4)),
    chosen: p.chosen,
  })) || [];

  // IMTP Suite Data Helpers
  const imtp = data?.imtp_suite;

  // IMTP Code Snippet
  const imtpKernelCode = `// IMTP DPU Kernel: GEMV with Multi-dimensional Tiling & WRAM Caching
#include <mram.h>
#include <defs.h>
#include <perfcounter.h>

#define CACHING_TILE_SIZE 16 // Optimal caching chunk (64 bytes / DRAM burst)

__mram_noinit float MRAM_A[TILE_M * TILE_K]; // Partitioned Matrix Tile
__mram_noinit float MRAM_X[TILE_K];          // Partitioned Vector Tile
__mram_noinit float MRAM_Y[TILE_M];          // Partial Sums per DPU

void dpu_kernel_gemv(int tasklet_id, int num_tasklets) {
    __dma_aligned float wram_x_tile[CACHING_TILE_SIZE];
    __dma_aligned float wram_a_tile[CACHING_TILE_SIZE];
    
    // Each tasklet iterates over spatial dimension rows
    for (int r = tasklet_id; r < TILE_M; r += num_tasklets) {
        float sum = 0.0f;
        // Tiled reduction along K dimension
        for (int c = 0; c < TILE_K; c += CACHING_TILE_SIZE) {
            mram_read(&MRAM_X[c], wram_x_tile, CACHING_TILE_SIZE * sizeof(float));
            mram_read(&MRAM_A[r * TILE_K + c], wram_a_tile, CACHING_TILE_SIZE * sizeof(float));
            #pragma unroll(16)
            for (int k = 0; k < CACHING_TILE_SIZE; ++k) {
                sum += wram_a_tile[k] * wram_x_tile[k];
            }
        }
        MRAM_Y[r] = sum; // Transferred to host for final inter-DPU reduction
    }
}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 bg-white text-slate-800">
      {/* View Header */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-teal-50 text-teal-800 border border-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Real-Time Research Suite</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              IMTP & NMC Paper Suites
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Research Paper Results & Architectural Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Real-time reproduction of the published research paper figures: PIM caching tile sizes, GEMV tiling schemes, tensor operation performance, and LLM attention layers. Generated dynamically from our first-principles analytical and DPU hardware model.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setShowTuner(!showTuner)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 shadow-2xs ${
              showTuner 
                ? 'bg-teal-50 text-teal-900 border-teal-400' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>{showTuner ? 'Hide Hardware Tuner' : 'Tune Hardware Params'}</span>
          </button>
          <button
            onClick={() => loadData(params)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm shadow-teal-600/30 disabled:opacity-50"
            title="Recalculate dynamic graphs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Hardware Parameter Tuner Accordion / Card */}
      {showTuner && (
        <div className="bg-white rounded-lg p-6 border-2 border-teal-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Real-Time Hardware Parameter Controls
              </h3>
              <span className="text-[11px] text-slate-500">
                (Adjust parameters to watch figures recalculate dynamically)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetParams}
                disabled={isUpdatingParams}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Reset to Paper Defaults
              </button>
              <button
                onClick={handleApplyParams}
                disabled={isUpdatingParams}
                className="px-3 py-1 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs flex items-center space-x-1"
              >
                {isUpdatingParams ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                <span>Apply & Recompute</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-3 bg-white rounded-md border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>CPU Memory BW</span>
                <span className="font-mono text-teal-700">{params.cpu_effective_bandwidth_gbps} GB/s</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="2"
                value={params.cpu_effective_bandwidth_gbps}
                onChange={(e) => setParams({ ...params, cpu_effective_bandwidth_gbps: parseFloat(e.target.value) })}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Host DDR4/DDR5 system bus (default: 28 GB/s)</span>
            </div>

            <div className="p-3 bg-white rounded-md border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>NMC / DPU DRAM BW</span>
                <span className="font-mono text-teal-700">{params.nmc_effective_bandwidth_gbps} GB/s</span>
              </label>
              <input
                type="range"
                min="64"
                max="320"
                step="8"
                value={params.nmc_effective_bandwidth_gbps}
                onChange={(e) => setParams({ ...params, nmc_effective_bandwidth_gbps: parseFloat(e.target.value) })}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Aggregate near-memory TSV bank bus (default: 160 GB/s)</span>
            </div>

            <div className="p-3 bg-white rounded-md border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>PCIe Host Link BW</span>
                <span className="font-mono text-teal-700">{params.host_link_bandwidth_gbps} GB/s</span>
              </label>
              <input
                type="range"
                min="16"
                max="128"
                step="8"
                value={params.host_link_bandwidth_gbps}
                onChange={(e) => setParams({ ...params, host_link_bandwidth_gbps: parseFloat(e.target.value) })}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Host-to-NMC PCIe Gen5 / CXL bus (default: 64 GB/s)</span>
            </div>

            <div className="p-3 bg-white rounded-md border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>PCIe Launch Overhead</span>
                <span className="font-mono text-teal-700">{params.host_to_nmc_overhead_ms} ms</span>
              </label>
              <input
                type="range"
                min="0.005"
                max="0.100"
                step="0.005"
                value={params.host_to_nmc_overhead_ms}
                onChange={(e) => setParams({ 
                  ...params, 
                  host_to_nmc_overhead_ms: parseFloat(e.target.value),
                  nmc_to_host_overhead_ms: parseFloat(e.target.value)
                })}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">DMA setup and roundtrip kernel dispatch (default: 0.02 ms)</span>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-white border-2 border-rose-300 rounded-md text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadData()} className="font-bold underline text-rose-900">
            Retry
          </button>
        </div>
      )}

      {/* High-Level Suite Switcher */}
      <div className="bg-white rounded-md p-2 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSuite('suiteB')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSuite === 'suiteB'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers3 className="w-4 h-4 text-teal-400" />
            <span>IMTP PIM & Tensor Suite (Figs 4, 9, 10, 11)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-800 text-teal-100 font-mono">NEW</span>
          </button>

          <button
            onClick={() => setActiveSuite('suiteA')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSuite === 'suiteA'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-400" />
            <span>NMC Cost Model & Crossover Suite (Figs 1–4)</span>
          </button>
        </div>

        <span className="text-xs font-mono text-slate-400 px-3">
          {activeSuite === 'suiteB' ? 'Shin et al. (IMTP Tensor Processing)' : 'NMC-Opt First-Principles Suite'}
        </span>
      </div>

      {/* Sub-Navigation for active suite */}
      {activeSuite === 'suiteB' ? (
        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-2xs flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSuiteBTab('fig4_tiling')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteBTab === 'fig4_tiling'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Fig 4: PIM Caching Tiles & GEMV Tiling</span>
            </button>

            <button
              onClick={() => setSuiteBTab('fig9_tensor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteBTab === 'fig9_tensor'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Fig 9: Tensor Operations (4MB & 256MB)</span>
            </button>

            <button
              onClick={() => setSuiteBTab('fig10_llm')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteBTab === 'fig10_llm'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fig 10: GPT-J Attention FC & MMTV</span>
            </button>

            <button
              onClick={() => setSuiteBTab('fig11_scatter')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteBTab === 'fig11_scatter'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Fig 11: MMTV Speedup vs Spatial Size</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-2xs flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSuiteATab('fig1')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteATab === 'fig1'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Fig 1: Cost Breakdown (N = 4M)</span>
            </button>

            <button
              onClick={() => setSuiteATab('fig2')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteATab === 'fig2'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fig 2: Speedup vs Baselines (N = 16M)</span>
            </button>

            <button
              onClick={() => setSuiteATab('fig3')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteATab === 'fig3'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Fig 3: Log-Log Crossover Curves</span>
            </button>

            <button
              onClick={() => setSuiteATab('fig4')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                suiteATab === 'fig4'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Fig 4: NMC-Opt Decision Map</span>
            </button>
          </div>

          <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Kernel:</span>
            {data?.kernels.map((k) => (
              <button
                key={k.id}
                onClick={() => setSelectedKernelId(k.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedKernelId === k.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {k.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left Chart Column / Right Details Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">

          {/* =========================================================================
              SUITE B - FIGURE 4: Impact of Caching Tile Sizes, Tiling Schemes, DPUs
             ========================================================================= */}
          {activeSuite === 'suiteB' && suiteBTab === 'fig4_tiling' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Figure 4
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      Performance impact of caching tile sizes, tiling schemes, and # of DPUs
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Fine-grained DPU WRAM scratchpad staging & spatial vs reduction dimension partitioning.
                  </p>
                </div>

                {/* Subfigure toggles */}
                <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setFig4SubTab('a')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig4SubTab === 'a' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (a) Tile Sizes (512x512)
                  </button>
                  <button
                    onClick={() => setFig4SubTab('b')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig4SubTab === 'b' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (b) 8192x8192 Tiling
                  </button>
                  <button
                    onClick={() => setFig4SubTab('c_512')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig4SubTab === 'c_512' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (c) 512 DPUs
                  </button>
                  <button
                    onClick={() => setFig4SubTab('c_8192')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig4SubTab === 'c_8192' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (c) 8192 DPUs
                  </button>
                </div>
              </div>

              {/* Subfigure 4(a) */}
              {fig4SubTab === 'a' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 font-medium">
                    (a) Kernel execution time with varying caching tile size (512x512 GEMV)
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={imtp?.fig4a_caching_tiles} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tile_size" stroke="#64748B" fontSize={11} label={{ value: 'Caching tile size (#elems)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }} />
                        <YAxis stroke="#64748B" fontSize={11} domain={[0, 20]} label={{ value: 'Kernel latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="kernel_latency_ms" name="Kernel latency (ms)" fill="#48BB78" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>Optimal Caching Sweet Spot (16 elems / 64 bytes):</strong> Smaller tiles incur high DMA initiation overhead per burst, while larger tiles (&gt;32 elems) exceed WRAM scratchpad registers causing register spilling.
                  </div>
                </div>
              )}

              {/* Subfigure 4(b) */}
              {fig4SubTab === 'b' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 font-medium flex items-center justify-between">
                    <span>(b) Total latency with varying tiling schemes (8192x8192 GEMV on 2048 DPUs)</span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Optimal Scheme: 32x1024
                    </span>
                  </div>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={imtp?.fig4b_gemv_tiling} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tile_shape" stroke="#64748B" fontSize={10} angle={-30} textAnchor="end" height={45} />
                        <YAxis stroke="#64748B" fontSize={11} domain={[0, 25]} label={{ value: 'Total latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                        <Bar dataKey="h2d_ms" name="H->D" stackId="a" fill="#3182CE" />
                        <Bar dataKey="kernel_ms" name="Kernel" stackId="a" fill="#48BB78" />
                        <Bar dataKey="d2h_ms" name="D->H" stackId="a" fill="#ED8936" />
                        <Bar dataKey="host_reduction_ms" name="Host Reduction" stackId="a" fill="#B83280" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900 block mb-0.5">Host Reduction Explosion Phenomenon:</strong>
                    When tile shape reaches $2048\times 16$, the reduction dimension $K$ is split across too many DPUs. Each DPU sends partial sums back across the PCIe bus, and the host CPU is forced to complete massive serial reductions, causing total latency to explode to <strong>23.1 ms</strong>. At $32\times 1024$, balanced DPU computation and near-zero host reduction achieve the global minimum (<strong>2.8 ms</strong>).
                  </div>
                </div>
              )}

              {/* Subfigure 4(c) 512x512 */}
              {fig4SubTab === 'c_512' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 font-medium">
                    (c) Left: Total latency with varying tile shapes and # of DPUs (512x512 GEMV)
                  </div>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={imtp?.fig4c_gemv_512} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tile_shape" stroke="#64748B" fontSize={10} angle={-30} textAnchor="end" height={45} />
                        <YAxis stroke="#64748B" fontSize={11} domain={[0, 0.8]} label={{ value: 'Total latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                        <Bar dataKey="h2d_ms" name="H->D" stackId="a" fill="#3182CE" />
                        <Bar dataKey="kernel_ms" name="Kernel" stackId="a" fill="#48BB78" />
                        <Bar dataKey="d2h_ms" name="D->H" stackId="a" fill="#ED8936" />
                        <Bar dataKey="host_reduction_ms" name="Host Reduction" stackId="a" fill="#B83280" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Subfigure 4(c) 8192x8192 */}
              {fig4SubTab === 'c_8192' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 font-medium">
                    (c) Right: Total latency with varying tile shapes and # of DPUs (8192x8192 GEMV)
                  </div>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={imtp?.fig4c_gemv_8192} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="tile_shape" stroke="#64748B" fontSize={10} angle={-30} textAnchor="end" height={45} />
                        <YAxis stroke="#64748B" fontSize={11} domain={[0, 20]} label={{ value: 'Total latency (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                        <Bar dataKey="h2d_ms" name="H->D" stackId="a" fill="#3182CE" />
                        <Bar dataKey="kernel_ms" name="Kernel" stackId="a" fill="#48BB78" />
                        <Bar dataKey="d2h_ms" name="D->H" stackId="a" fill="#ED8936" />
                        <Bar dataKey="host_reduction_ms" name="Host Reduction" stackId="a" fill="#B83280" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              SUITE B - FIGURE 9: Tensor Operation Performance Normalized to PrIM
             ========================================================================= */}
          {activeSuite === 'suiteB' && suiteBTab === 'fig9_tensor' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Figure 9
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      Tensor operation performance (normalized to PrIM)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Comparison across PrIM, PrIM(E), PrIM+search, SimplePIM, and IMTP on 4MB and 256MB payloads.
                  </p>
                </div>

                <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setFig9SubTab('4mb')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig9SubTab === '4mb' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (a) 4MB Data
                  </button>
                  <button
                    onClick={() => setFig9SubTab('256mb')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig9SubTab === '256mb' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (b) 256MB Data
                  </button>
                </div>
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={fig9SubTab === '4mb' ? imtp?.fig9a_tensor_4mb : imtp?.fig9b_tensor_256mb} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="op_id" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 1.2]} label={{ value: 'Normalized latency (to PrIM)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <ReferenceLine y={1.0} stroke="#94A3B8" strokeDasharray="3 3" />
                    <Bar dataKey="prim" name="PrIM (1.0)" fill="#FAF089" />
                    <Bar dataKey="prim_e" name="PrIM (E)" fill="#ECC94B" />
                    <Bar dataKey="prim_search" name="PrIM+search" fill="#ED8936" />
                    <Bar dataKey="simple_pim" name="SimplePIM" fill="#319795" />
                    <Bar dataKey="imtp" name="IMTP (Ours)" fill="#3182CE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-0.5">Multidimensional Tiling vs Outermost Spatial Allocation:</strong>
                PrIM distributes DPUs strictly along the outermost spatial dimension, leaving reduction loops unparallelized. IMTP simultaneously tiles both spatial and reduction dimensions, reducing MTV and GEMV execution latency by <strong>up to 85%</strong> (normalized latency 0.15 vs 1.0).
              </div>
            </div>
          )}

          {/* =========================================================================
              SUITE B - FIGURE 10: Performance of FC (MTV) & MMTV in GPT-J 6B and 30B
             ========================================================================= */}
          {activeSuite === 'suiteB' && suiteBTab === 'fig10_llm' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      Figure 10
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      Performance of FC (MTV) and MMTV operations in GPT-J 6B and 30B
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Transformer Multi-Head Attention (MHA) layers normalized to baseline PrIM.
                  </p>
                </div>

                <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setFig10SubTab('mtv')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig10SubTab === 'mtv' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (a) MTV in GPT-J
                  </button>
                  <button
                    onClick={() => setFig10SubTab('mmtv')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      fig10SubTab === 'mmtv' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    (b) MMTV in GPT-J
                  </button>
                </div>
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={fig10SubTab === 'mtv' ? imtp?.fig10a_gptj_mtv : imtp?.fig10b_gptj_mmtv} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="config_label" stroke="#64748B" fontSize={10} angle={-30} textAnchor="end" height={45} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 1.2]} label={{ value: 'Normalized latency', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <ReferenceLine y={1.0} stroke="#94A3B8" strokeDasharray="3 3" />
                    <Bar dataKey="prim" name="PrIM (1.0)" fill="#FAF089" />
                    <Bar dataKey="prim_search" name="PrIM+search" fill="#ED8936" />
                    <Bar dataKey="imtp" name="IMTP (Ours)" fill="#3182CE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-0.5">Transformer Attention Projection Acceleration:</strong>
                In Large Language Models like GPT-J (6B and 30B), Fully Connected projection layers ($4096\times 16384$ and $7168\times 28672$) have massive reduction dimensions. IMTP achieves up to <strong>88% reduction in latency</strong> (down to 0.12 normalized) compared to baseline PrIM.
              </div>
            </div>
          )}

          {/* =========================================================================
              SUITE B - FIGURE 11: IMTP's Speedup for MMTV with Varying Spatial Size
             ========================================================================= */}
          {activeSuite === 'suiteB' && suiteBTab === 'fig11_scatter' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      Figure 11
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      IMTP's speedup for MMTV with varying spatial dimension sizes
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Speedup vs. size of spatial dimension (# batches × # tokens × # heads).
                  </p>
                </div>
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" dataKey="spatial_dim" name="Spatial Dimension" stroke="#64748B" fontSize={11} domain={[0, 65000]} />
                    <YAxis type="number" dataKey="speedup_vs_prim" name="Speedup" stroke="#64748B" fontSize={11} domain={[0.8, 1.8]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <ReferenceLine y={1.0} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '1.0x baseline', position: 'insideTopRight', fill: '#EF4444', fontSize: 10 }} />
                    <Scatter name="IMTP vs PrIM" data={imtp?.fig11_mmtv_scatter} fill="#3182CE" line={{ stroke: '#3182CE', strokeWidth: 1.5 }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-0.5">Spatial Dimension Threshold &amp; Plateau:</strong>
                IMTP offers maximum advantage (up to <strong>1.75x</strong> speedup) for spatial dimensions $\le 10,000$. As spatial dimensions expand beyond 10,000, spatial parallelism saturates DPUs and speedups plateau around <strong>1.20x</strong>, confirming the analytical roofline prediction.
              </div>
            </div>
          )}

          {/* =========================================================================
              SUITE A - ORIGINAL 4 FIGURES (Figures 1, 2, 3, 4)
             ========================================================================= */}
          {activeSuite === 'suiteA' && suiteATab === 'fig1' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      Figure 1
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      Cost breakdown per strategy at N = 4,194,304 elements
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Stacked latency components: Compute, Transfer, Layout, and Synchronization overheads for <strong className="text-slate-800">{selectedKernel?.name}</strong>.
                  </p>
                </div>
              </div>

              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fig1Data} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="strategy" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} label={{ value: 'Execution Cost (ms)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Bar dataKey="compute" name="Compute" stackId="a" fill="#7B68EE" />
                    <Bar dataKey="transfer" name="Transfer" stackId="a" fill="#48C9B0" />
                    <Bar dataKey="layout" name="Layout" stackId="a" fill="#E9967A" />
                    <Bar dataKey="sync" name="Sync" stackId="a" fill="#BDBDBD" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeSuite === 'suiteA' && suiteATab === 'fig2' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Figure 2
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      NMC-Opt's chosen strategy vs. naive baselines at N = 16,777,216
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Speedup factor comparing NMC-Opt's chosen strategy against always-CPU and always-NMC.
                  </p>
                </div>
              </div>

              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fig2Data} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 6]} label={{ value: 'Speedup (x)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <ReferenceLine y={1.0} stroke="#EF4444" strokeDasharray="4 4" />
                    <Bar dataKey="vsCPU" name="vs. always-CPU" fill="#3182CE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="vsNaive" name="vs. always-NMC (no cost model)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeSuite === 'suiteA' && suiteATab === 'fig3' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Figure 3
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      Total execution cost vs. input size (log-log) -- where strategies cross over
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Crossover curve for <strong className="text-slate-800">{selectedKernel?.name}</strong> spanning sizes from 4,096 to 16,777,216 elements.
                  </p>
                </div>
              </div>

              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fig3Data} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} scale="log" domain={['auto', 'auto']} label={{ value: 'Cost (ms, log)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="CPU" name="CPU" stroke="#3182CE" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="NMC" name="NMC (naive)" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="NMC_Transform" name="NMC + transform" stroke="#E05638" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeSuite === 'suiteA' && suiteATab === 'fig4' && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Figure 4
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      NMC-Opt decision map: chosen strategy per kernel x size
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Optimal strategy selected by the analytical cost model across 5 kernels and sizes 2^12 to 2^24.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold text-slate-700 bg-slate-50/80 rounded-tl-xl">Kernel</th>
                      {data?.size_labels.map((lbl) => (
                        <th key={lbl} className="py-2.5 px-3 font-bold text-slate-700 text-center bg-slate-50/80">
                          {lbl}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.kernels.map((kernel) => (
                      <tr key={kernel.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">{kernel.name}</td>
                        {data.size_labels.map((lbl) => {
                          const pt = data.decision_map.find((d) => d.kernel_id === kernel.id && d.n_label === lbl);
                          const strategy = pt?.chosen_strategy || 'CPU';
                          const isTransformed = strategy.includes('transform');
                          const isCPU = strategy === 'CPU';
                          let bgClass = 'bg-[#3182CE] text-white';
                          if (isTransformed) bgClass = 'bg-[#D9532F] text-white';
                          else if (!isCPU) bgClass = 'bg-[#10B981] text-white';
                          return (
                            <td key={lbl} className="py-2 px-2 text-center">
                              <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${bgClass}`}>
                                {strategy}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table 3: Hardware Parameters Matrix */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Table 3: Hardware DPU Configuration & Tiling Parameters
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Shin et al. Parameter Reference
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-2 px-3 font-bold text-slate-700">Scheme</th>
                    <th className="py-2 px-3 font-bold text-slate-700">Parameter</th>
                    <th className="py-2 px-3 font-bold text-slate-700 text-center">VA</th>
                    <th className="py-2 px-3 font-bold text-slate-700 text-center">RED</th>
                    <th className="py-2 px-3 font-bold text-slate-700 text-center">MTV</th>
                    <th className="py-2 px-3 font-bold text-slate-700 text-center">TTV</th>
                    <th className="py-2 px-3 font-bold text-slate-700 text-center">MMTV</th>
                    <th className="py-2 px-3 font-bold text-slate-700 text-center">GEMV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">PrIM</td>
                    <td className="py-2 px-3 text-slate-500"># DPUs</td>
                    <td className="py-2 px-3 text-center">2048</td>
                    <td className="py-2 px-3 text-center">1024</td>
                    <td className="py-2 px-3 text-center">512</td>
                    <td className="py-2 px-3 text-center">2048</td>
                    <td className="py-2 px-3 text-center">2048</td>
                    <td className="py-2 px-3 text-center">512</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-700">PrIM+search</td>
                    <td className="py-2 px-3 text-slate-500"># Tasklets</td>
                    <td className="py-2 px-3 text-center">16</td>
                    <td className="py-2 px-3 text-center">16</td>
                    <td className="py-2 px-3 text-center">24</td>
                    <td className="py-2 px-3 text-center">16</td>
                    <td className="py-2 px-3 text-center">16</td>
                    <td className="py-2 px-3 text-center">16</td>
                  </tr>
                  <tr className="bg-teal-50/40">
                    <td className="py-2 px-3 font-bold text-teal-800">IMTP (Ours)</td>
                    <td className="py-2 px-3 text-teal-700">DPU Split (S, R)</td>
                    <td className="py-2 px-3 text-center font-bold text-teal-900">2048</td>
                    <td className="py-2 px-3 text-center font-bold text-teal-900">1024</td>
                    <td className="py-2 px-3 text-center font-bold text-teal-900">(128, 16)</td>
                    <td className="py-2 px-3 text-center font-bold text-teal-900">2048</td>
                    <td className="py-2 px-3 text-center font-bold text-teal-900">(2048, 1)</td>
                    <td className="py-2 px-3 text-center font-bold text-teal-900">(32, 64)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Details Column: C Code and Architectural Rationale */}
        <div className="lg:col-span-4 space-y-6">
          {/* C / PIM Kernel Code Viewer */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeSuite === 'suiteB' ? 'IMTP DPU Tiled Kernel Code' : 'Kernel C Source Code'}
                </h3>
              </div>
              <button
                onClick={() => handleCopyCode(activeSuite === 'suiteB' ? imtpKernelCode : (selectedKernel?.source_code || ''))}
                className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-2xs"
                title="Copy source code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-md border border-slate-200 bg-slate-50/70 p-3.5 font-mono text-[11px] text-slate-800 overflow-x-auto max-h-72">
              <pre className="whitespace-pre leading-relaxed">
                {activeSuite === 'suiteB' ? imtpKernelCode : selectedKernel?.source_code}
              </pre>
            </div>
          </div>

          {/* Architectural Insights Card */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Architectural Insights &amp; Findings
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center space-x-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MRAM-to-WRAM DMA Caching</span>
                </span>
                <p>
                  DPUs contain fast WRAM scratchpad memories. Reading MRAM in 16-element (64-byte) bursts aligns with DRAM burst size, minimizing DMA startup overhead while avoiding register spilling.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reduction Dimension Splitting</span>
                </span>
                <p>
                  PrIM assigns DPUs only to the outermost spatial loop. For matrix-vector kernels (GEMV/MTV), splitting the inner reduction dimension ($K$) across DPUs produces partial sums that require host reduction, creating a delicate balance.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fine-Grained Autotuning</span>
                </span>
                <p>
                  IMTP's search identifies optimal tile shapes (such as $32\times 1024$) that maximize DPU compute utilization while keeping host reduction overhead near zero.
                </p>
              </div>
            </div>
          </div>

          {onNavigateWorkbench && (
            <div className="p-4 bg-white rounded-md border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">Want to test custom loops?</h4>
                <p className="text-[11px] text-slate-500">Inspect custom C loops in the Optimization Workbench</p>
              </div>
              <button
                onClick={onNavigateWorkbench}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs"
              >
                Workbench
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
