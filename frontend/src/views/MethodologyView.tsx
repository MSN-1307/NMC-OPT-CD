import React from 'react';
import { BookOpen, ShieldAlert } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white rounded-md text-teal-700 border border-slate-300 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Research Methodology & Theoretical Foundation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compiler design principles, analytical cost model formulation, and academic research citations.
            </p>
          </div>
        </div>
      </div>

      {/* Scope & Academic Honesty Notice */}
      <div className="bg-white border-2 border-amber-300 rounded-lg p-5 text-xs text-amber-900 space-y-2 shadow-2xs transition-colors">
        <div className="flex items-center space-x-2 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Research Scope & Simulation Disclosure</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          <strong>NMC-Opt Studio</strong> is an educational compiler-analysis simulator and decision workbench designed for Compiler Design laboratory exploration. 
          All reported latency figures and crossover points are calculated via <strong>first-principles analytical cost modeling</strong>, not physical silicon measurement. 
          No made-up hardware numbers or claims of production UPMEM toolchains are made.
        </p>
      </div>

      {/* Mathematical Cost Model Equations */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4 transition-colors">
        <h3 className="font-bold text-sm text-slate-900">Analytical Cost Model Equations</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The workbench models execution latency across CPU and Near-Memory Computing (NMC) targets using unified millisecond (ms) units:
        </p>

        <div className="space-y-3 font-mono text-xs bg-white p-4 rounded-md border border-slate-200/90 shadow-2xs">
          <div>
            <span className="text-blue-700 font-bold font-sans block mb-1">1. Conventional Host CPU Model:</span>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 shadow-2xs">
              Latency_CPU = (Operations / CPU_GFLOPS × 10⁶) + (TotalBytesMoved / CPU_Bandwidth_GBps × 10⁶)
            </div>
          </div>

          <div>
            <span className="text-teal-700 font-bold font-sans block mb-1">2. Direct Near-Memory Computing (NMC) Offload Model:</span>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed shadow-2xs">
              Latency_NMC = NMC_compute + NMC_internal_DRAM + Host_to_NMC_transfer + NMC_to_Host_transfer + Layout_conversion + Sync_barrier
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-sans space-y-1 pt-1">
            <p>• <strong>Host-Device Link:</strong> T_transfer = (Bytes / PCIe_BW × 10⁶) + Overhead_launch</p>
            <p>• <strong>Layout Reorganization:</strong> Converts contiguous row arrays into bank-interleaved slices to eliminate bank conflicts.</p>
            <p>• <strong>Synchronization:</strong> Models DMA completion barriers and host-device coherence.</p>
          </div>
        </div>
      </div>

      {/* Academic Grounding & Literature Citations */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4 transition-colors">
        <h3 className="font-bold text-sm text-slate-900">Literature Citations & Prior Art</h3>
        
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-md border border-slate-200/90 bg-white shadow-2xs space-y-1">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>IMTP: Search-based Code Generation for In-memory Tensor Programs</span>
              <span className="text-slate-400 font-normal">arXiv:2412.19630 (Dec 2024)</span>
            </div>
            <p className="text-slate-600">
              Yongwon Shin, Dookyung Kang, and Hyojin Sung. Investigates host/PIM coordination, kernel boundary checks, and tiling on UPMEM DRAM-PIM architectures.
            </p>
          </div>

          <div className="p-4 rounded-md border border-slate-200/90 bg-white shadow-2xs space-y-1">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Near-Memory Computing: Past, Present, and Future</span>
              <span className="text-slate-400 font-normal">Microprocessors and Microsystems (2019)</span>
            </div>
            <p className="text-slate-600">
              G. Singh, L. Chelini, S. Corda, et al. Comprehensive survey of NMC taxonomy, internal bank parallelism, and analytical performance modeling.
            </p>
          </div>

          <div className="p-4 rounded-md border border-slate-200/90 bg-white shadow-2xs space-y-1">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Computing with Near Data</span>
              <span className="text-slate-400 font-normal">ACM SIGMETRICS PER (2019)</span>
            </div>
            <p className="text-slate-600">
              X. Tang, M. T. Kandemir, H. Zhao, M. Jung, and M. Karakoy. Explores compiler optimizations and recomputation strategies to mitigate off-chip memory traffic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
