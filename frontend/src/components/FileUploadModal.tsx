import React, { useState } from 'react';
import { X, Upload, FileCode, CheckCircle2, AlertCircle, Sparkles, Play } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadCustomKernel: (kernelCode: string, kernelName: string) => void;
}

const SAMPLE_CUSTOM_FILES = [
  {
    name: 'saxpy_scaled.c',
    code: `// Single-Precision AXPY Kernel
void saxpy(float a, const float* X, float* Y, int N) {
    for (int i = 0; i < N; ++i) {
        Y[i] = a * X[i] + Y[i];
    }
}`,
    desc: 'Dual-input streaming operation with scalar multiplier',
  },
  {
    name: 'stencil1d.c',
    code: `// 1D 3-Point Jacobi Stencil
void stencil1d(const float* in, float* out, int N) {
    for (int i = 1; i < N - 1; ++i) {
        out[i] = 0.5f * (in[i - 1] + in[i + 1]);
    }
}`,
    desc: 'Local neighbor memory access with temporal reuse potential',
  },
  {
    name: 'dot_product.c',
    code: `// Vector Dot Product Kernel
float dot_product(const float* A, const float* B, int N) {
    float sum = 0.0f;
    for (int i = 0; i < N; ++i) {
        sum += A[i] * B[i];
    }
    return sum;
}`,
    desc: 'Dual array streaming read with scalar accumulator',
  },
];

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadCustomKernel,
}) => {
  const [code, setCode] = useState(SAMPLE_CUSTOM_FILES[0].code);
  const [fileName, setFileName] = useState(SAMPLE_CUSTOM_FILES[0].name);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCode(text);
        setStatusMessage(`Loaded "${file.name}" (${file.size} bytes)`);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCode(text);
        setStatusMessage(`Dropped "${file.name}" successfully!`);
      };
      reader.readAsText(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_CUSTOM_FILES[0]) => {
    setFileName(sample.name);
    setCode(sample.code);
    setStatusMessage(`Loaded template sample: ${sample.name}`);
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    onUploadCustomKernel(code, fileName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white rounded-xl text-teal-700 border border-slate-300 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upload Custom C Loop Kernel
              </h2>
              <p className="text-xs text-slate-500">
                Upload or paste a C/C++ loop file for automated loop & memory access analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
              dragActive
                ? 'border-teal-500 bg-white shadow-xs'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="text-xs font-semibold text-slate-700">
              Drag & Drop your <code className="text-teal-600 font-mono">.c</code> or <code className="text-teal-600 font-mono">.cpp</code> loop kernel here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">or click to browse files from your disk</p>
            <label className="inline-block mt-3 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300 shadow-2xs">
              Browse File
              <input
                type="file"
                accept=".c,.cpp,.h,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick Pre-made Samples */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Or Try A Sample Template:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_CUSTOM_FILES.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    fileName === sample.name
                      ? 'border border-slate-300 bg-white text-teal-900 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-mono font-semibold text-[11px] flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-teal-600" />
                    {sample.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{sample.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Source Code Editor Area */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-teal-600" />
                <span>Kernel Source Code: {fileName}</span>
              </label>
              {statusMessage && (
                <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {statusMessage}
                </span>
              )}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              className="w-full font-mono text-xs p-3.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed shadow-2xs"
              placeholder="// Paste your canonical C loop kernel here..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Parser extracts array accesses, loop induction variables, and operation intensity.
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Analyze In Workbench</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
