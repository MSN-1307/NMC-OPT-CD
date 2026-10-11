import React from 'react';
import { X, RotateCcw, Sliders, Info, Zap } from 'lucide-react';
import { CostModelParameters } from '../types';
import { DEFAULT_PARAMETERS } from '../data/defaults';

interface ParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: CostModelParameters;
  onChangeParameters: (params: CostModelParameters) => void;
  onReset: () => void;
}

export const ParameterModal: React.FC<ParameterModalProps> = ({
  isOpen,
  onClose,
  parameters,
  onChangeParameters,
  onReset,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof CostModelParameters, value: number) => {
    onChangeParameters({
      ...parameters,
      [field]: value,
    });
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'default':
        onChangeParameters({ ...DEFAULT_PARAMETERS });
        break;
      case 'high_pcie_overhead':
        onChangeParameters({
          ...parameters,
          host_to_nmc_overhead_ms: 0.25,
          nmc_to_host_overhead_ms: 0.25,
          host_link_bandwidth_gbps: 16.0,
          layout_conversion_overhead_ms: 0.20,
        });
        break;
      case 'ultra_nmc_bw':
        onChangeParameters({
          ...parameters,
          nmc_effective_bandwidth_gbps: 256.0,
          nmc_compute_gflops: 36.0,
          host_to_nmc_overhead_ms: 0.02,
        });
        break;
      case 'cpu_high_cache':
        onChangeParameters({
          ...parameters,
          cpu_compute_gflops: 80.0,
          cpu_effective_bandwidth_gbps: 65.0,
          host_to_nmc_overhead_ms: 0.08,
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white rounded-xl text-teal-700 border border-slate-300 shadow-2xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Analytical Cost Model Parameters</h2>
              <p className="text-xs text-slate-500">Configure architectural hardware assumptions (units in GB/s, GFLOPS, ms)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 text-xs flex-wrap">
          <span className="font-semibold text-slate-700">Architectural Presets:</span>
          <button
            onClick={() => applyPreset('default')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 font-medium transition-all shadow-2xs"
          >
            Default Balanced
          </button>
          <button
            onClick={() => applyPreset('high_pcie_overhead')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 font-medium transition-all shadow-2xs"
          >
            Slow Link (Favors CPU)
          </button>
          <button
            onClick={() => applyPreset('ultra_nmc_bw')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 font-medium transition-all shadow-2xs"
          >
            High DRAM PIM BW (Favors NMC)
          </button>
          <button
            onClick={() => applyPreset('cpu_high_cache')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 font-medium transition-all shadow-2xs"
          >
            High-End CPU Node
          </button>
        </div>

        {/* Body Fields */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: Host CPU Parameters */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Host CPU Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">CPU Compute Peak (GFLOPS)</label>
                  <span className="text-xs font-semibold text-blue-600">{parameters.cpu_compute_gflops} GFLOPS</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={parameters.cpu_compute_gflops}
                  onChange={(e) => handleChange('cpu_compute_gflops', parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">Standard host vector execution throughput</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">CPU DRAM Bandwidth (GB/s)</label>
                  <span className="text-xs font-semibold text-blue-600">{parameters.cpu_effective_bandwidth_gbps} GB/s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="2"
                  value={parameters.cpu_effective_bandwidth_gbps}
                  onChange={(e) => handleChange('cpu_effective_bandwidth_gbps', parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">Host memory bus saturation limit</span>
              </div>
            </div>
          </div>

          {/* Section 2: NMC / PIM Architecture */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              Near-Memory Computing (NMC/PIM)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">NMC DRAM Bank Bandwidth (GB/s)</label>
                  <span className="text-xs font-semibold text-teal-600">{parameters.nmc_effective_bandwidth_gbps} GB/s</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="350"
                  step="8"
                  value={parameters.nmc_effective_bandwidth_gbps}
                  onChange={(e) => handleChange('nmc_effective_bandwidth_gbps', parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">Direct parallel row-buffer internal memory throughput</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">NMC Compute Throughput (GFLOPS)</label>
                  <span className="text-xs font-semibold text-teal-600">{parameters.nmc_compute_gflops} GFLOPS</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="100"
                  step="2"
                  value={parameters.nmc_compute_gflops}
                  onChange={(e) => handleChange('nmc_compute_gflops', parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400">Aggregate ALUs located near DRAM banks</span>
              </div>
            </div>
          </div>

          {/* Section 3: Data Movement & Overheads */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Interconnect & Data Movement Overheads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">PCIe / CXL Link (GB/s)</label>
                  <span className="text-xs font-semibold text-amber-600">{parameters.host_link_bandwidth_gbps} GB/s</span>
                </div>
                <input
                  type="number"
                  min="4"
                  max="128"
                  value={parameters.host_link_bandwidth_gbps}
                  onChange={(e) => handleChange('host_link_bandwidth_gbps', parseFloat(e.target.value) || 32)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">Host→NMC Launch (ms)</label>
                  <span className="text-xs font-semibold text-amber-600">{parameters.host_to_nmc_overhead_ms} ms</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1.0"
                  value={parameters.host_to_nmc_overhead_ms}
                  onChange={(e) => handleChange('host_to_nmc_overhead_ms', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">NMC→Host Launch (ms)</label>
                  <span className="text-xs font-semibold text-amber-600">{parameters.nmc_to_host_overhead_ms} ms</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1.0"
                  value={parameters.nmc_to_host_overhead_ms}
                  onChange={(e) => handleChange('nmc_to_host_overhead_ms', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">Layout Reorg (ms)</label>
                  <span className="text-xs font-semibold text-purple-600">{parameters.layout_conversion_overhead_ms} ms</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1.0"
                  value={parameters.layout_conversion_overhead_ms}
                  onChange={(e) => handleChange('layout_conversion_overhead_ms', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">Sync Barrier (ms/event)</label>
                  <span className="text-xs font-semibold text-purple-600">{parameters.synchronization_overhead_ms} ms</span>
                </div>
                <input
                  type="number"
                  step="0.005"
                  min="0"
                  max="0.5"
                  value={parameters.synchronization_overhead_ms}
                  onChange={(e) => handleChange('synchronization_overhead_ms', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">Sync Events Count</label>
                  <span className="text-xs font-semibold text-purple-600">{parameters.sync_events}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={parameters.sync_events}
                  onChange={(e) => handleChange('sync_events', parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between transition-colors">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/30"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
