import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Zap, 
  Layers, 
  BarChart3, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import type { BenchmarkMetadata, CostModelParameters } from '../types';

interface SimulatorViewProps {
  benchmarks: BenchmarkMetadata[];
  selectedBenchmark: BenchmarkMetadata;
  onSelectBenchmark: (bm: BenchmarkMetadata) => void;
  onNavigateToWorkbench: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  benchmarks,
  selectedBenchmark,
  onSelectBenchmark,
  onNavigateToWorkbench,
}) => {
  // Input parameters state
  const [selectedKernelId, setSelectedKernelId] = useState<string>(selectedBenchmark.id || 'vadd');
  const [inputSize, setInputSize] = useState<number>(selectedBenchmark.default_size || 2000000);
  const [pcieBandwidth, setPcieBandwidth] = useState<number>(64.0); // GB/s (PCIe Gen5)
  const [pimBandwidth, setPimBandwidth] = useState<number>(160.0); // GB/s (Internal PIM)
  const [numBanks, setNumBanks] = useState<number>(16);

  // Simulation execution state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2000); // 2 seconds per step

  // Sync selected kernel
  useEffect(() => {
    const found = benchmarks.find((b) => b.id === selectedKernelId);
    if (found) {
      onSelectBenchmark(found);
      if (inputSize === 2000000 && found.default_size) {
        setInputSize(found.default_size);
      }
    }
  }, [selectedKernelId]);

  // Calculations for current inputs
  const currentKernel = benchmarks.find((b) => b.id === selectedKernelId) || selectedBenchmark;
  const bytesPerElement = currentKernel.id === 'gemv' ? 4 : 4;
  const isGemv = currentKernel.id === 'gemv';
  const totalElements = inputSize;
  const dataMovedBytes = isGemv 
    ? (Math.sqrt(totalElements) * Math.sqrt(totalElements) + Math.sqrt(totalElements) * 2) * 4
    : totalElements * (currentKernel.id === 'vadd' ? 12 : currentKernel.id === 'relu' ? 8 : 4);
  const totalFlops = isGemv ? totalElements * 2 : totalElements;
  const arithmeticIntensity = totalFlops / Math.max(1, dataMovedBytes);

  // Analytical Step Latencies (in milliseconds)
  const cpuComputeMs = (totalFlops / (32.0 * 1e9)) * 1000;
  const cpuMemoryMs = (dataMovedBytes / (28.0 * 1e9)) * 1000;
  const totalCpuLatencyMs = cpuComputeMs + cpuMemoryMs;

  const pcieTransferMs = ((dataMovedBytes * 0.85) / (pcieBandwidth * 1e9)) * 1000 + 0.05;
  const layoutReorgMs = 0.04;
  const nmcComputeMs = (totalFlops / (20.0 * 1e9)) * 1000 + (dataMovedBytes / (pimBandwidth * 1e9)) * 1000;
  const syncOverheadMs = 0.03;
  const totalDirectNmcMs = pcieTransferMs + layoutReorgMs + nmcComputeMs + syncOverheadMs;

  // Optimized candidates
  const isTilingEligible = isGemv || currentKernel.id === 'reduction';
  const isFusionEligible = currentKernel.id === 'relu' || currentKernel.id === 'vadd';

  const nmcTilingMs = isTilingEligible ? totalDirectNmcMs * 0.72 : null;
  const nmcFusionMs = isFusionEligible ? totalDirectNmcMs * 0.68 : null;

  // Determine winner
  let bestStrategy = 'CPU-only';
  let bestLatencyMs = totalCpuLatencyMs;
  let winnerSpeedup = 1.0;
  let recommendationReason = '';

  if (totalDirectNmcMs < bestLatencyMs) {
    bestStrategy = 'Direct NMC offload';
    bestLatencyMs = totalDirectNmcMs;
    winnerSpeedup = totalCpuLatencyMs / bestLatencyMs;
  }
  if (nmcTilingMs && nmcTilingMs < bestLatencyMs) {
    bestStrategy = 'NMC + Loop Tiling';
    bestLatencyMs = nmcTilingMs;
    winnerSpeedup = totalCpuLatencyMs / bestLatencyMs;
  }
  if (nmcFusionMs && nmcFusionMs < bestLatencyMs) {
    bestStrategy = 'NMC + Loop Fusion';
    bestLatencyMs = nmcFusionMs;
    winnerSpeedup = totalCpuLatencyMs / bestLatencyMs;
  }

  if (bestStrategy === 'CPU-only') {
    recommendationReason = `Small dataset (${(totalElements / 1000).toFixed(0)}K items) does not amortize the ${pcieTransferMs.toFixed(3)} ms PCIe interconnect transfer overhead. Host CPU cache hierarchy completes execution faster.`;
  } else if (bestStrategy === 'NMC + Loop Tiling') {
    recommendationReason = `Matrix footprint exceeds on-chip SRAM capacity. Tiling loop iterations into 64 KB bank slices eliminates DRAM bank thrashing, providing ${winnerSpeedup.toFixed(2)}x speedup over CPU.`;
  } else if (bestStrategy === 'NMC + Loop Fusion') {
    recommendationReason = `Pointwise arithmetic permits fusing consecutive array accesses inside DRAM row buffers. Eliminates round-trip memory writebacks, delivering ${winnerSpeedup.toFixed(2)}x speedup over CPU.`;
  } else {
    recommendationReason = `Arithmetic intensity of ${arithmeticIntensity.toFixed(3)} FLOP/B causes severe host memory bus starvation (28 GB/s). Executing directly near DRAM row buffers at ${pimBandwidth} GB/s delivers ${winnerSpeedup.toFixed(2)}x speedup.`;
  }

  // Bar chart data for step 7
  const chartData = [
    { name: 'Host CPU', latency: parseFloat(totalCpuLatencyMs.toFixed(4)), isWinner: bestStrategy === 'CPU-only' },
    { name: 'Direct NMC', latency: parseFloat(totalDirectNmcMs.toFixed(4)), isWinner: bestStrategy === 'Direct NMC offload' },
    ...(nmcTilingMs ? [{ name: 'NMC + Tiling', latency: parseFloat(nmcTilingMs.toFixed(4)), isWinner: bestStrategy === 'NMC + Loop Tiling' }] : []),
    ...(nmcFusionMs ? [{ name: 'NMC + Fusion', latency: parseFloat(nmcFusionMs.toFixed(4)), isWinner: bestStrategy === 'NMC + Loop Fusion' }] : []),
  ];

  // Auto-advance timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 6) {
            setIsPlaying(false);
            return 6;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const steps = [
    {
      index: 0,
      title: 'Step 1: Input Characterization & Memory Wall Detection',
      shortTitle: '1. Characterization',
      badge: 'Compiler Front-End',
      icon: Cpu,
      description: 'The compiler inspects loop induction variables, trip counts, and access strides to compute total data volume and arithmetic intensity.',
      status: 'Analyzing Memory Intensity...',
      metrics: [
        { label: 'Workload Kernel', val: currentKernel.name },
        { label: 'Problem Size (N)', val: `${totalElements.toLocaleString()} items` },
        { label: 'Total Data Traffic', val: `${(dataMovedBytes / 1024 / 1024).toFixed(2)} MB` },
        { label: 'Arithmetic Intensity', val: `${arithmeticIntensity.toFixed(3)} FLOP/Byte` },
      ],
      insight: arithmeticIntensity < 1.0 
        ? `🚨 Arithmetic intensity is low (${arithmeticIntensity.toFixed(3)} FLOP/Byte). On a conventional CPU, ALUs will starve waiting for DRAM bus transfers.`
        : `⚡ Arithmetic intensity is moderate (${arithmeticIntensity.toFixed(3)} FLOP/Byte). Compute and memory movement must be carefully balanced.`,
    },
    {
      index: 1,
      title: 'Step 2: Host CPU Baseline Simulation',
      shortTitle: '2. CPU Baseline',
      badge: 'Baseline Execution',
      icon: Cpu,
      description: 'Simulates the kernel running entirely on the host multi-core CPU. Evaluates time spent in ALU computation vs DRAM bus idling.',
      status: 'Executing on Host CPU...',
      metrics: [
        { label: 'CPU Compute Time', val: `${cpuComputeMs.toFixed(4)} ms` },
        { label: 'CPU DRAM Bus Stall', val: `${cpuMemoryMs.toFixed(4)} ms` },
        { label: 'Total CPU Latency', val: `${totalCpuLatencyMs.toFixed(4)} ms` },
        { label: 'Bus Idling Percentage', val: `${((cpuMemoryMs / totalCpuLatencyMs) * 100).toFixed(1)}%` },
      ],
      insight: `Over ${((cpuMemoryMs / totalCpuLatencyMs) * 100).toFixed(1)}% of CPU runtime is wasted waiting for off-chip DDR traces at 28 GB/s. This is the Memory Wall in action.`,
    },
    {
      index: 2,
      title: 'Step 3: Interconnect & DMA Transfer Simulation',
      shortTitle: '3. Link Streaming',
      badge: 'PCIe/CXL Transfer',
      icon: HardDrive,
      description: 'Simulates dispatching kernel arguments and streaming input arrays across the motherboard link into device Near-Memory DRAM buffers.',
      status: 'Streaming Packets via PCIe/CXL...',
      metrics: [
        { label: 'Link Bandwidth', val: `${pcieBandwidth} GB/s` },
        { label: 'Data Transferred', val: `${(dataMovedBytes * 0.85 / 1024 / 1024).toFixed(2)} MB` },
        { label: 'DMA Launch Overhead', val: '0.050 ms' },
        { label: 'Transfer Latency', val: `${pcieTransferMs.toFixed(4)} ms` },
      ],
      insight: `Link dispatch incurs ${pcieTransferMs.toFixed(3)} ms. For small problem sizes, this transfer dominates and CPU wins. For large arrays, internal PIM bandwidth will overcome this!`,
    },
    {
      index: 3,
      title: 'Step 4: DRAM Bank Interleaving & Layout Reorganization',
      shortTitle: '4. Bank Interleaving',
      badge: 'Layout Engine',
      icon: Layers,
      description: 'Converts linear contiguous row arrays into bank-interleaved memory slices partitioned across parallel DRAM banks to prevent bank conflicts.',
      status: 'Interleaving Data across DRAM Banks...',
      metrics: [
        { label: 'Active DRAM Banks', val: `${numBanks} Banks` },
        { label: 'Slice Granularity', val: '64 KB / Bank' },
        { label: 'Bank Collision Rate', val: '0.0% (Interleaved)' },
        { label: 'Layout Reorg Overhead', val: `${layoutReorgMs.toFixed(4)} ms` },
      ],
      insight: `Data is uniformly sliced across ${numBanks} internal banks, enabling all bank row-buffers to operate concurrently without channel contention.`,
    },
    {
      index: 4,
      title: 'Step 5: Near-Bank In-Memory Execution (PIM ALUs)',
      shortTitle: '5. In-Memory Compute',
      badge: 'PIM Execution',
      icon: Zap,
      description: 'Embedded SIMD ALUs located inside the DRAM dies process vector elements directly out of internal bank row buffers at massive throughput.',
      status: 'Computing Adjacent to Row Buffers...',
      metrics: [
        { label: 'Internal Bank Bandwidth', val: `${pimBandwidth} GB/s` },
        { label: 'ALU Concurrency', val: `${numBanks} Parallel Units` },
        { label: 'In-Memory Compute Latency', val: `${nmcComputeMs.toFixed(4)} ms` },
        { label: 'Internal Throughput Gain', val: `${(pimBandwidth / 28.0).toFixed(1)}x vs CPU DDR` },
      ],
      insight: `Processing data inside DRAM at ${pimBandwidth} GB/s is ${(pimBandwidth / 28.0).toFixed(1)}x wider than the CPU bus. Memory stall drops dramatically!`,
    },
    {
      index: 5,
      title: 'Step 6: Completion Barrier & Host Synchronization',
      shortTitle: '6. Barrier Sync',
      badge: 'Host Coherence',
      icon: RefreshCw,
      description: 'DMA completion barrier fires, hardware interrupts host CPU, and final output tensors are validated for host memory coherence.',
      status: 'Synchronizing Results with Host...',
      metrics: [
        { label: 'Sync Overhead', val: `${syncOverheadMs.toFixed(4)} ms` },
        { label: 'Output Retrieval', val: 'Verified DMA' },
        { label: 'Net NMC Wall-Clock', val: `${totalDirectNmcMs.toFixed(4)} ms` },
        { label: 'Coherence State', val: 'Consistent' },
      ],
      insight: `Barrier synchronization completes in ${syncOverheadMs.toFixed(3)} ms. Execution finishes safely with verified mathematical consistency.`,
    },
    {
      index: 6,
      title: 'Step 7: Final Verdict & Decision Output: WHICH ONE TO USE',
      shortTitle: '7. Final Decision',
      badge: 'Compiler Verdict',
      icon: BarChart3,
      description: 'The compiler analytical cost engine compares all candidate targets and declares the optimal strategy with clear justification.',
      status: 'Optimization Verdict Finalized!',
      metrics: [
        { label: 'Winning Strategy', val: bestStrategy },
        { label: 'Winning Latency', val: `${bestLatencyMs.toFixed(4)} ms` },
        { label: 'CPU Baseline Latency', val: `${totalCpuLatencyMs.toFixed(4)} ms` },
        { label: 'Net Speedup', val: `${winnerSpeedup.toFixed(2)}x` },
      ],
      insight: recommendationReason,
    },
  ];

  const currentStepData = steps[currentStep];

  // Preset quick buttons
  const applyPreset = (type: 'vadd_large' | 'gemv_tiled' | 'relu_fused' | 'small_cpu') => {
    if (type === 'vadd_large') {
      setSelectedKernelId('vadd');
      setInputSize(2000000);
      setPcieBandwidth(64);
      setPimBandwidth(160);
      setCurrentStep(0);
    } else if (type === 'gemv_tiled') {
      setSelectedKernelId('gemv');
      setInputSize(4194304); // 2048 x 2048
      setPcieBandwidth(64);
      setPimBandwidth(180);
      setCurrentStep(0);
    } else if (type === 'relu_fused') {
      setSelectedKernelId('relu');
      setInputSize(2500000);
      setPcieBandwidth(64);
      setPimBandwidth(160);
      setCurrentStep(0);
    } else {
      setSelectedKernelId('vadd');
      setInputSize(30000); // 30K items
      setPcieBandwidth(32);
      setPimBandwidth(120);
      setCurrentStep(0);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-slate-300 text-xs font-semibold text-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Step-by-Step Execution Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive Hardware Execution Walkthrough
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Step through every hardware stage of kernel execution. Inspect data movements, DRAM bank interleaving, 
              host link overheads, and see the definitive mathematical verdict of <strong>which one to use</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onNavigateToWorkbench}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              Open Workbench
            </button>
            <button
              onClick={() => {
                setCurrentStep(6);
                setIsPlaying(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30"
            >
              Jump to Verdict
            </button>
          </div>
        </div>

        {/* Quick Simulation Presets */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-slate-500 text-[11px] whitespace-nowrap uppercase tracking-wider">
            Quick Demos:
          </span>
          <button
            onClick={() => applyPreset('vadd_large')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap border transition-all ${
              selectedKernelId === 'vadd' && inputSize === 2000000
                ? 'bg-white text-teal-900 border border-slate-300 shadow-2xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🚀 Direct NMC (Vector Add 2M)
          </button>
          <button
            onClick={() => applyPreset('gemv_tiled')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap border transition-all ${
              selectedKernelId === 'gemv'
                ? 'bg-white text-teal-900 border border-slate-300 shadow-2xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🧩 NMC + Loop Tiling (GEMV 2K)
          </button>
          <button
            onClick={() => applyPreset('relu_fused')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap border transition-all ${
              selectedKernelId === 'relu'
                ? 'bg-white text-teal-900 border border-slate-300 shadow-2xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ⚡ NMC + Loop Fusion (ReLU 2.5M)
          </button>
          <button
            onClick={() => applyPreset('small_cpu')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap border transition-all ${
              inputSize === 30000
                ? 'bg-white text-teal-900 border border-slate-300 shadow-2xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            💻 CPU Wins Baseline (Small 30K)
          </button>
        </div>
      </div>

      {/* Input Configuration Bar */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-sm text-slate-900">
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>Interactive Simulator Input Parameters</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Active: {currentKernel.name} • N = {inputSize.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Input 1: Workload Kernel */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Kernel Workload:</label>
            <select
              value={selectedKernelId}
              onChange={(e) => {
                setSelectedKernelId(e.target.value);
                setCurrentStep(0);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium shadow-2xs"
            >
              {benchmarks.map((bm) => (
                <option key={bm.id} value={bm.id}>
                  {bm.name} ({bm.category})
                </option>
              ))}
            </select>
          </div>

          {/* Input 2: Problem Size */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Input Elements (N):</label>
            <select
              value={inputSize}
              onChange={(e) => {
                setInputSize(parseInt(e.target.value));
                setCurrentStep(0);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium shadow-2xs"
            >
              <option value={30000}>30,000 (Small - CPU wins)</option>
              <option value={100000}>100,000 (Medium)</option>
              <option value={500000}>500,000 (Crossover Threshold)</option>
              <option value={2000000}>2,000,000 (Large - NMC wins)</option>
              <option value={4194304}>4,194,304 (2048 x 2048 Matrix)</option>
              <option value={8000000}>8,000,000 (Very Large Streaming)</option>
            </select>
          </div>

          {/* Input 3: Interconnect Link Bandwidth */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Host Link (PCIe / CXL):</label>
            <select
              value={pcieBandwidth}
              onChange={(e) => setPcieBandwidth(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium shadow-2xs"
            >
              <option value={16}>PCIe Gen4 x8 (16 GB/s)</option>
              <option value={32}>PCIe Gen4 x16 (32 GB/s)</option>
              <option value={64}>PCIe Gen5 x16 (64 GB/s - Standard)</option>
              <option value={128}>CXL 3.0 Fabric (128 GB/s)</option>
            </select>
          </div>

          {/* Input 4: Internal PIM Row-Buffer Bandwidth */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Internal PIM Bandwidth:</label>
            <select
              value={pimBandwidth}
              onChange={(e) => setPimBandwidth(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium shadow-2xs"
            >
              <option value={96}>96 GB/s (Base DRAM-PIM)</option>
              <option value={160}>160 GB/s (Balanced Multi-Bank)</option>
              <option value={256}>256 GB/s (High-Throughput HBM-PIM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stepper Timeline & Stepping Controls */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-2xs space-y-5 transition-colors">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setCurrentStep((prev) => Math.max(0, prev - 1));
                setIsPlaying(false);
              }}
              disabled={currentStep === 0}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Auto-Play Simulation'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentStep((prev) => Math.min(6, prev + 1));
                setIsPlaying(false);
              }}
              disabled={currentStep === 6}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-700">
              Stage {currentStep + 1} of 7:
            </span>
            <span className="font-semibold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-300">
              {currentStepData.badge}
            </span>
          </div>
        </div>

        {/* Step Buttons Rail */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {steps.map((st) => {
            const isPassed = currentStep > st.index;
            const isCurrent = currentStep === st.index;
            return (
              <button
                key={st.index}
                onClick={() => {
                  setCurrentStep(st.index);
                  setIsPlaying(false);
                }}
                className={`p-2.5 rounded-md border text-left transition-all ${
                  isCurrent
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/30'
                    : isPassed
                    ? 'bg-white text-teal-900 border border-slate-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold ${isCurrent ? 'text-teal-100' : 'text-slate-400'}`}>
                    #{st.index + 1}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  ) : null}
                </div>
                <div className="text-[11px] font-bold truncate">
                  {st.shortTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Stage Viewport */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 transition-colors">
        
        {/* Stage Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              Live Stage Simulation
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {currentStepData.title}
            </h2>
          </div>
          <div className="text-xs font-mono px-3 py-1 bg-white rounded-xl text-slate-700 self-start sm:self-auto border border-slate-200 shadow-2xs">
            Status: {currentStepData.status}
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {currentStepData.description}
        </p>

        {/* Metrics Grid for this step */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentStepData.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-1"
            >
              <span className="text-[11px] font-semibold text-slate-400 block truncate">
                {m.label}
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 block truncate">
                {m.val}
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic Architectural Hardware Flow Diagram */}
        <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hardware Execution State Flow
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Box 1: Host System */}
            <div className={`p-4 rounded-md border transition-all ${
              currentStep === 1
                ? 'bg-white border-2 border-blue-500 ring-2 ring-blue-400/20 shadow-xs'
                : 'bg-white border-slate-200 shadow-2xs opacity-80'
            }`}>
              <div className="flex items-center space-x-2 mb-2 font-bold text-xs text-slate-900">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Host CPU (DDR4/5)</span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>Bus BW: 28 GB/s</div>
                <div>L3 Cache: 32 MB</div>
                <div className="font-semibold text-slate-800 pt-1">
                  {currentStep === 1 ? '🔥 High Traffic Stall' : 'Idle / Supervising'}
                </div>
              </div>
            </div>

            {/* Box 2: Interconnect */}
            <div className={`p-4 rounded-md border text-center transition-all ${
              currentStep === 2
                ? 'bg-white border-2 border-amber-500 ring-2 ring-amber-400/20 shadow-xs'
                : 'bg-white border-slate-200 shadow-2xs opacity-80'
            }`}>
              <div className="flex items-center justify-center space-x-1.5 mb-2 font-bold text-xs text-slate-900">
                <HardDrive className="w-4 h-4 text-amber-600" />
                <span>PCIe / CXL Bus</span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>Link Speed: {pcieBandwidth} GB/s</div>
                <div>Status: {currentStep === 2 ? '🌊 Streaming DMA' : 'Standby'}</div>
                <div className="font-semibold text-slate-800 pt-1">
                  Latency: {pcieTransferMs.toFixed(3)} ms
                </div>
              </div>
            </div>

            {/* Box 3: Layout Reorganizer */}
            <div className={`p-4 rounded-md border text-center transition-all ${
              currentStep === 3
                ? 'bg-white border-2 border-purple-500 ring-2 ring-purple-400/20 shadow-xs'
                : 'bg-white border-slate-200 shadow-2xs opacity-80'
            }`}>
              <div className="flex items-center justify-center space-x-1.5 mb-2 font-bold text-xs text-slate-900">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Layout Interleaving</span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>Slices: {numBanks} DRAM Banks</div>
                <div>Granularity: 64 KB Block</div>
                <div className="font-semibold text-slate-800 pt-1">
                  {currentStep === 3 ? '⚙️ Inactive Contention' : 'Mapped'}
                </div>
              </div>
            </div>

            {/* Box 4: DRAM PIM Banks */}
            <div className={`p-4 rounded-md border transition-all ${
              currentStep === 4 || currentStep === 5
                ? 'bg-white border border-slate-300 ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-white border-slate-200 shadow-2xs opacity-80'
            }`}>
              <div className="flex items-center space-x-2 mb-2 font-bold text-xs text-teal-900">
                <Zap className="w-4 h-4 text-teal-600" />
                <span>Near-Memory PIM</span>
              </div>
              <div className="text-[11px] text-teal-800 space-y-0.5">
                <div>Internal BW: {pimBandwidth} GB/s</div>
                <div>Row Buffers: Parallel ALUs</div>
                <div className="font-semibold pt-1">
                  {currentStep === 4 ? '⚡ In-Memory Computing' : 'Ready'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Callout */}
        <div className="p-4 rounded-md bg-white border border-slate-300 text-xs text-teal-950 leading-relaxed shadow-2xs">
          <strong>Compiler Phase Insight:</strong> {currentStepData.insight}
        </div>

        {/* Step 7 Special: Which One to Use Final Output Box */}
        {currentStep === 6 && (
          <div className="p-6 rounded-lg bg-white border border-slate-300 shadow-md space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider bg-teal-600 text-white px-3 py-1 rounded-full inline-block shadow-xs">
                  ★ FINAL VERDICT: WHICH ONE TO USE
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-1">
                  Use: {bestStrategy}
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {recommendationReason}
                </p>
              </div>

              <div className="bg-white p-4 rounded-md border border-teal-200 shadow-xs text-right shrink-0">
                <div className="text-2xl font-black font-mono text-teal-700">
                  {bestLatencyMs.toFixed(4)} ms
                </div>
                <div className="text-xs font-bold text-emerald-600 mt-0.5">
                  ⚡ {winnerSpeedup.toFixed(2)}x vs Host CPU
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Latency Reduction: {((1 - (bestLatencyMs / totalCpuLatencyMs)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Visual Bar Chart of Candidates */}
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Comparative Latency by Target (Lower is Better)</span>
                <span className="text-teal-600 font-bold">Optimal Winner: {bestStrategy}</span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis unit=" ms" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val} ms`, 'Execution Latency']}
                      contentStyle={{ borderRadius: '10px', fontSize: '11px' }}
                    />
                    <Bar dataKey="latency" name="Latency (ms)" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isWinner ? '#0d9488' : '#94a3b8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setCurrentStep(0)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
              >
                Re-run Simulation
              </button>

              <button
                onClick={onNavigateToWorkbench}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30"
              >
                <span>Launch this Kernel in Optimization Workbench</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
