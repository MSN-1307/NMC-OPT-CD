import React, { useState } from 'react';
import { 
  FileCode, 
  CheckCircle2, 
  Search, 
  Cpu, 
  Calculator, 
  GitFork, 
  Sparkles, 
  ChevronRight, 
  Code, 
  Copy, 
  Check 
} from 'lucide-react';
import type { AnalysisResponse } from '../types';

interface PipelineViewProps {
  analysisResult: AnalysisResponse | null;
  onNavigateWorkbench: () => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  analysisResult,
  onNavigateWorkbench,
}) => {
  const [selectedStage, setSelectedStage] = useState<number>(3);
  const [copiedIR, setCopiedIR] = useState(false);

  if (!analysisResult) {
    return (
      <div className="bg-white rounded-lg p-12 border border-slate-200/90 text-center space-y-4 transition-colors max-w-2xl mx-auto my-12">
        <div className="w-14 h-14 bg-white text-teal-600 rounded-md flex items-center justify-center mx-auto border border-slate-300 shadow-2xs">
          <Cpu className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Pipeline Unpopulated</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Run an analysis on any benchmark kernel in the Workbench to inspect intermediate compiler pipeline stages.
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

  const stages = [
    { id: 0, title: 'Source Intake', desc: 'Canonical Loop Input', icon: FileCode },
    { id: 1, title: 'Validation', desc: 'Syntax & Bounds Check', icon: CheckCircle2 },
    { id: 2, title: 'Loop Profiling', desc: 'Footprint & Intensity', icon: Search },
    { id: 3, title: 'SSA IR', desc: 'Compiler IR Generation', icon: Code },
    { id: 4, title: 'Cost Modeling', desc: 'Analytical Estimation', icon: Calculator },
    { id: 5, title: 'Placement Matrix', desc: 'Candidate Latency Matrix', icon: GitFork },
    { id: 6, title: 'Final Verdict', desc: 'Placement Decision', icon: Sparkles },
  ];

  const handleCopyIR = () => {
    navigator.clipboard.writeText(analysisResult.ir_text);
    setCopiedIR(true);
    setTimeout(() => setCopiedIR(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Visual Pipeline Flow Bar */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200/90 shadow-2xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            7-Stage Compiler Decision Pipeline
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Stage {selectedStage + 1} of 7 Selected
          </span>
        </div>
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = selectedStage === stage.id;
            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => setSelectedStage(stage.id)}
                  className={`flex items-center space-x-2.5 p-3 rounded-md text-left transition-all shrink-0 border ${
                    isCurrent
                      ? 'bg-white border border-slate-300 text-teal-950 shadow-xs ring-2 ring-teal-500/20 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isCurrent ? 'bg-teal-600 text-white' : 'bg-white text-slate-500 shadow-2xs'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{stage.title}</div>
                    <div className="text-[10px] text-slate-400">{stage.desc}</div>
                  </div>
                </button>
                {idx < stages.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Panel */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs transition-colors">
        {selectedStage === 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-teal-600" />
              <span>Stage 1: Source Code Intake</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The workbench ingests a canonical C loop representation. Loop bounds are explicitly defined or annotated via pragmas.
            </p>
            <div className="bg-white text-slate-800 p-4 rounded-md font-mono text-xs overflow-x-auto leading-relaxed border border-slate-200/90 shadow-2xs">
              <pre>{analysisResult.source_code}</pre>
            </div>
          </div>
        )}

        {selectedStage === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Stage 2: Semantic Validation & Subset Check</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The front-end parses the AST to confirm the kernel matches supported loop constructs (constant/affine index expressions, well-formed bounds, and lack of arbitrary pointer aliasing).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-md border border-slate-300 text-xs shadow-2xs">
                <span className="font-bold text-emerald-800 block mb-1">Affine Loop Bounds</span>
                <span className="text-emerald-700">Valid: Verified induction variable limits [0, N)</span>
              </div>
              <div className="p-4 bg-white rounded-md border border-slate-300 text-xs shadow-2xs">
                <span className="font-bold text-emerald-800 block mb-1">Memory Indexing</span>
                <span className="text-emerald-700">Valid: Canonical 1D/2D array strides</span>
              </div>
              <div className="p-4 bg-white rounded-md border border-slate-300 text-xs shadow-2xs">
                <span className="font-bold text-emerald-800 block mb-1">Data Types</span>
                <span className="text-emerald-700">Valid: IEEE-754 32-bit Single Precision (float)</span>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span>Stage 3: Loop & Memory Access Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quantitative extraction of loop iteration space, FLOP count, memory footprints, and arithmetic intensity.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-md border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Iterations</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {analysisResult.analysis.iterations.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{analysisResult.analysis.loop_bounds}</span>
              </div>

              <div className="p-4 bg-white rounded-md border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">FLOP Count</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {analysisResult.analysis.estimated_operations.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Arithmetic ops</span>
              </div>

              <div className="p-4 bg-white rounded-md border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Data Moved</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {(analysisResult.analysis.total_bytes_moved / 1024 / 1024).toFixed(2)} MB
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  R: {(analysisResult.analysis.estimated_bytes_read / 1024 / 1024).toFixed(1)}MB | W: {(analysisResult.analysis.estimated_bytes_written / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>

              <div className="p-4 bg-white rounded-md border border-slate-300 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-teal-700 block mb-1">Arithmetic Intensity</span>
                <span className="text-lg font-bold text-teal-800 font-mono">
                  {analysisResult.analysis.arithmetic_intensity} FLOP/B
                </span>
                <span className="text-[11px] text-teal-600 font-semibold block mt-0.5">
                  {analysisResult.analysis.is_bandwidth_bound ? 'Memory Bandwidth Bound' : 'Compute Bound'}
                </span>
              </div>
            </div>

            {/* Transformation Eligibility */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Compiler Transformation Legality
              </h4>
              <div className="space-y-2.5">
                {analysisResult.transformations.map((t, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-md border border-slate-200/80 shadow-2xs text-xs flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{t.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.eligible ? 'bg-white text-emerald-800 border border-emerald-400' : 'bg-white text-slate-600 border border-slate-300'
                        }`}>
                          {t.eligible ? 'Eligible' : 'Ineligible'}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">{t.reason}</p>
                    </div>
                    {t.eligible && (
                      <span className="text-[11px] font-semibold text-teal-800 bg-white px-2.5 py-1 rounded-xl shrink-0 border border-slate-300 ml-2">
                        {t.potential_benefit}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedStage === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-teal-600" />
                  <span>Stage 4: Simplified SSA Intermediate Representation (IR)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  SSA-style IR demonstrating loop control flow, load/store pointer arithmetic, and ALU operations.
                </p>
              </div>
              <button
                onClick={handleCopyIR}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
              >
                {copiedIR ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIR ? 'Copied' : 'Copy IR'}</span>
              </button>
            </div>

            <div className="border border-slate-200/90 rounded-md overflow-hidden shadow-2xs">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-slate-400">#</th>
                      <th className="py-2.5 px-3 w-28">Label</th>
                      <th className="py-2.5 px-3 w-28 text-teal-700">Opcode</th>
                      <th className="py-2.5 px-3 text-slate-800">Operands</th>
                      <th className="py-2.5 px-3 text-slate-400 font-sans">Compiler Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {analysisResult.simplified_ir.map((instr) => (
                      <tr key={instr.line} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-slate-400">{instr.line}</td>
                        <td className="py-2 px-3 font-semibold text-purple-700">{instr.label || ''}</td>
                        <td className="py-2 px-3 font-bold text-teal-600">{instr.opcode}</td>
                        <td className="py-2 px-3 text-slate-800">{instr.operands}</td>
                        <td className="py-2 px-3 text-slate-500 font-sans text-[11px]">{instr.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Stage 5: Analytical Cost Model Formulation</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analytical equations evaluated to estimate execution latency across candidate placement targets in milliseconds.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-5 bg-white rounded-md border border-slate-200/80 shadow-2xs space-y-2">
                <span className="font-bold text-blue-700 block text-sm font-sans">CPU Latency Model</span>
                <p className="text-slate-800">CPU_total = CPU_compute + CPU_memory</p>
                <div className="text-[11px] text-slate-500 space-y-1 font-sans pt-1">
                  <p>• Compute = {analysisResult.analysis.estimated_operations.toLocaleString()} ops / (CPU_GFLOPS × 10⁶)</p>
                  <p>• Memory = {(analysisResult.analysis.total_bytes_moved / 1024 / 1024).toFixed(2)} MB / (CPU_BW × 10⁶)</p>
                </div>
              </div>

              <div className="p-5 bg-white rounded-md border border-slate-200/80 shadow-2xs space-y-2">
                <span className="font-bold text-teal-700 block text-sm font-sans">NMC Latency Model</span>
                <p className="text-slate-800">NMC_total = NMC_comp + T_link + T_layout + T_sync</p>
                <div className="text-[11px] text-slate-500 space-y-1 font-sans pt-1">
                  <p>• In-Memory ALU execution directly out of DRAM row-buffers</p>
                  <p>• PCIe / CXL link transfer for parameters and outputs</p>
                  <p>• DRAM bank interleaving layout conversion</p>
                  <p>• Completion barrier synchronization</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedStage === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-purple-600" />
              <span>Stage 6: Candidate Strategy Evaluation Matrix</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisResult.candidates.map((cand) => (
                <div key={cand.strategy} className="p-4 rounded-md border border-slate-200/80 bg-white shadow-2xs space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{cand.strategy}</span>
                    <span className="font-mono font-bold text-teal-700">
                      {cand.valid ? `${cand.estimated_total_ms.toFixed(4)} ms` : 'Ineligible'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{cand.notes}</p>
                  {cand.valid && (
                    <div className="text-[11px] text-slate-600">
                      Dominant Factor: <strong className="text-slate-800">{cand.dominant_factor}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedStage === 6 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Stage 7: Optimal Recommendation Rationale</span>
            </h3>
            <div className="p-6 rounded-lg bg-white border border-slate-300 shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-lg text-teal-950">
                  Recommended: {analysisResult.recommendation.strategy}
                </span>
                <span className="font-mono font-bold text-teal-800 bg-white px-3 py-1 rounded-xl border border-teal-200 text-sm shadow-2xs">
                  {analysisResult.recommendation.estimated_cost_ms.toFixed(4)} ms
                </span>
              </div>
              <p className="text-xs text-teal-900 leading-relaxed">
                {analysisResult.recommendation.reason}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
