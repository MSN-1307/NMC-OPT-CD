import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Layers, 
  Cpu, 
  HardDrive, 
  ArrowRight,
  Database,
  Zap,
  Info
} from 'lucide-react';
import type { AnalysisResponse } from '../types';

interface MemoryLayoutViewProps {
  analysisResult: AnalysisResponse | null;
}

export const MemoryLayoutView: React.FC<MemoryLayoutViewProps> = () => {
  const [step, setStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const steps = [
    {
      title: 'Step 1: Host CPU Memory Allocation',
      desc: 'Arrays reside contiguously in standard Host System DRAM. In CPU-only mode, the CPU core pulls all elements sequentially through L1/L2/L3 caches via the narrow memory bus.',
      activeComponent: 'host',
      bandwidthNotice: 'Host Bus Bandwidth limit: ~28 GB/s',
    },
    {
      title: 'Step 2: Interconnect Data Dispatch (Host → NMC)',
      desc: 'Input arrays are transferred across the PCIe / CXL link. This introduces fixed dispatch setup latency plus bandwidth-limited stream transfer.',
      activeComponent: 'link_out',
      bandwidthNotice: 'Link Bandwidth: ~64 GB/s + DMA setup ~0.02 ms',
    },
    {
      title: 'Step 3: Data-Layout Rearrangement (Bank Interleaving)',
      desc: 'Contiguous vectors are rearranged into bank-aligned slices across DRAM channels. This prevents bank conflict stalls and ensures all PIM units can access data in parallel.',
      activeComponent: 'layout',
      bandwidthNotice: 'Layout Conversion Overhead: ~0.02 ms',
    },
    {
      title: 'Step 4: Parallel In-Bank Near-Memory Execution',
      desc: 'Processing-in-Memory (PIM) units compute directly beside DRAM row-buffers. Data is processed locally without leaving the DRAM chip, leveraging massive aggregate internal bandwidth.',
      activeComponent: 'banks',
      bandwidthNotice: 'Internal DRAM Bank Aggregate Bandwidth: ~160 GB/s',
    },
    {
      title: 'Step 5: Output Writeback & Host Synchronization',
      desc: 'Computed outputs (or reduced scalar sum) are returned to the host CPU, followed by a global synchronization barrier.',
      activeComponent: 'sync',
      bandwidthNotice: 'Sync Barrier: ~0.01 ms per barrier',
    },
  ];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Notice Banner */}
      <div className="p-4 bg-white border-2 border-amber-300 rounded-lg flex items-start space-x-3 text-xs text-amber-900 transition-colors shadow-2xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Conceptual Architectural Illustration:</span> This model illustrates data movement, bank interleaving, and interconnect dispatch principles. It provides an educational visualization grounded in first-principles memory hierarchies.
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-teal-600" />
            <span>Interactive Memory Movement & Bank Layout Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Step through the data movement pipeline from Host RAM to Near-Memory Banks</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStep(0)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/30 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isPlaying ? 'Pause' : 'Auto-Play'}</span>
          </button>

          <button
            onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={step >= steps.length - 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-40 transition-all border border-slate-200"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => { setStep(idx); setIsPlaying(false); }}
            className={`p-3 rounded-md text-left border transition-all ${
              step === idx
                ? 'bg-white border border-slate-300 text-teal-950 shadow-xs ring-2 ring-teal-500/20 font-bold'
                : step > idx
                ? 'bg-white border-slate-200/80 text-slate-700 shadow-2xs'
                : 'bg-white border-slate-200/80 text-slate-400'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-slate-400">Step {idx + 1}</div>
            <div className="text-xs truncate font-medium mt-0.5">{s.title.split(':')[1] || s.title}</div>
          </button>
        ))}
      </div>

      {/* Architectural Diagram Canvas */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6 transition-colors">
        {/* Step Explanation Header */}
        <div className="p-4 bg-white rounded-md border border-slate-200/80 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-slate-900">{steps[step].title}</h3>
            <span className="text-[11px] font-mono font-semibold text-teal-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300 self-start sm:self-auto">
              {steps[step].bandwidthNotice}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-1">{steps[step].desc}</p>
        </div>

        {/* Visual Hardware Architecture Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Node 1: Host System (3 Cols) */}
          <div className={`md:col-span-3 p-4 rounded-md border transition-all ${
            steps[step].activeComponent === 'host'
              ? 'bg-white border-2 border-blue-500 ring-2 ring-blue-400/20 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-2xs opacity-85'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs text-slate-900">Host CPU System</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800">
                <span className="text-slate-400">Array A:</span> [A0, A1, A2, ... AN]
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800">
                <span className="text-slate-400">Array B:</span> [B0, B1, B2, ... BN]
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Contiguous linear memory layout in Host DDR4/DDR5
              </div>
            </div>
          </div>

          {/* Node 2: Interconnect / PCIe link (2 Cols) */}
          <div className={`md:col-span-2 p-3.5 rounded-md border text-center transition-all ${
            steps[step].activeComponent === 'link_out' || steps[step].activeComponent === 'sync'
              ? 'bg-white border-2 border-amber-500 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-2xs opacity-85'
          }`}>
            <div className="text-[11px] font-bold text-slate-700 mb-1">PCIe Gen5 / CXL</div>
            <div className="flex items-center justify-center space-x-1 my-2">
              <span className={`w-2 h-2 rounded-full ${steps[step].activeComponent === 'link_out' ? 'bg-amber-500 animate-ping' : 'bg-slate-300'}`}></span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
              <span className={`w-2 h-2 rounded-full ${steps[step].activeComponent === 'sync' ? 'bg-amber-500 animate-ping' : 'bg-slate-300'}`}></span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              DMA Packet Stream
            </div>
          </div>

          {/* Node 3: Layout Rearranger (2 Cols) */}
          <div className={`md:col-span-2 p-3.5 rounded-md border text-center transition-all ${
            steps[step].activeComponent === 'layout'
              ? 'bg-white border-2 border-purple-500 ring-2 ring-purple-400/20 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-2xs opacity-85'
          }`}>
            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold text-slate-800">Layout Engine</span>
            </div>
            <div className="text-[10px] text-slate-500 my-1">
              Linear ➔ Bank Slices
            </div>
            <span className="text-[9px] bg-white text-purple-800 border border-purple-300 px-2 py-0.5 rounded-full font-mono font-semibold">
              Interleaving
            </span>
          </div>

          {/* Node 4: Near-Memory DRAM Banks & ALUs (5 Cols) */}
          <div className={`md:col-span-5 p-4 rounded-md border transition-all ${
            steps[step].activeComponent === 'banks'
              ? 'bg-white border border-slate-300 ring-2 ring-teal-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-2xs opacity-85'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-xs text-slate-900">DRAM PIM Banks</span>
              </div>
              <span className="text-[10px] bg-white text-teal-800 border border-teal-400 px-2 py-0.5 rounded-full font-bold">
                8 Parallel Banks
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((bankId) => (
                <div
                  key={bankId}
                  className={`p-2 rounded-xl border text-center text-[10px] font-mono transition-all ${
                    steps[step].activeComponent === 'banks'
                      ? 'bg-white border-teal-400 text-teal-950 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">Bank {bankId}</div>
                  <div className="flex items-center justify-center gap-0.5 text-teal-700 mt-0.5">
                    <Zap className="w-2.5 h-2.5 text-teal-500" />
                    <span>ALU</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 mt-2">
              Each bank possesses dedicated row-buffers and ALU pipelines operating concurrently.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
