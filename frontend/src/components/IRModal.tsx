import React, { useState } from 'react';
import { FileText, X, Copy, Check } from 'lucide-react';
import type { IRInstruction } from '../types';

interface IRModalProps {
  isOpen: boolean;
  onClose: () => void;
  kernelName: string;
  irText: string;
  irInstructions: IRInstruction[];
}

export const IRModal: React.FC<IRModalProps> = ({
  isOpen,
  onClose,
  kernelName,
  irText,
  irInstructions,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(irText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white rounded-xl text-teal-700 border border-slate-300 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Intermediate Representation (IR) — {kernelName}
              </h2>
              <p className="text-xs text-slate-500">SSA-style compiler instructions and memory load/store operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          <div className="rounded-md border border-slate-200/80 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white text-slate-700 uppercase text-[10px] sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-slate-400">#</th>
                  <th className="py-2.5 px-3 w-28">Label</th>
                  <th className="py-2.5 px-3 w-28 text-teal-700">Opcode</th>
                  <th className="py-2.5 px-3 text-slate-800">Operands</th>
                  <th className="py-2.5 px-3 text-slate-500 font-sans">Compiler Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {irInstructions.map((instr) => (
                  <tr key={instr.line} className="hover:bg-slate-50 transition-colors">
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between transition-colors">
          <span className="text-xs text-slate-500 font-mono">
            {irInstructions.length} Total SSA Instructions Generated
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy IR Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/30"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
