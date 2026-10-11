import React from 'react';
import { 
  GitCommit, 
  ArrowRight, 
  Sparkles,
  Code
} from 'lucide-react';
import type { BenchmarkMetadata } from '../types';

interface BenchmarkSuiteViewProps {
  benchmarks: BenchmarkMetadata[];
  onSelectAndRun: (bm: BenchmarkMetadata) => void;
}

export const BenchmarkSuiteView: React.FC<BenchmarkSuiteViewProps> = ({
  benchmarks,
  onSelectAndRun,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white rounded-md text-teal-700 border border-slate-300 shadow-2xs">
            <GitCommit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Supported Compiler Benchmark Suite</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated data-intensive kernels featuring distinct arithmetic intensity, access patterns, and transformation rules.
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benchmarks.map((bm) => (
          <div
            key={bm.id}
            className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between hover:border-teal-400 transition-all hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {bm.category}
                </span>
                <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300">
                  Default: {(bm.default_size / 1_000_000).toFixed(1)}M items
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5">{bm.name}</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{bm.description}</p>

              {/* Source Code Snippet */}
              <div className="bg-white text-slate-800 p-3.5 rounded-md font-mono text-[11px] mb-4 overflow-x-auto border border-slate-200/90 shadow-2xs">
                <pre>{bm.source_code}</pre>
              </div>

              {/* Supported Transformations */}
              <div className="mb-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Eligible Compiler Transformations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bm.supported_transforms.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-white text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg font-medium shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectAndRun(bm)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30"
            >
              <span>Load into Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
