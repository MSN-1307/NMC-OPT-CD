import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SensitivityItem } from '../types';

interface BandwidthSensitivityChartProps {
  sensitivityData: SensitivityItem[];
}

export const BandwidthSensitivityChart: React.FC<BandwidthSensitivityChartProps> = ({ sensitivityData }) => {
  // Find approximate crossover bandwidth where NMC becomes faster than CPU
  const crossoverItem = sensitivityData.find((item) => item.nmc_ms < item.cpu_ms);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-1">NMC Bank Bandwidth: {label} GB/s</p>
          <div className="space-y-1">
            {payload.map((p: any) => (
              <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
                {p.name}: {Number(p.value).toFixed(4)} ms
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sensitivityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="bandwidth_gbps" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: 'Internal NMC DRAM Bandwidth (GB/s)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#94a3b8' } }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: 'Estimated Time (ms)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          <Line 
            type="monotone" 
            dataKey="cpu_ms" 
            name="CPU Baseline (Fixed)" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="nmc_ms" 
            name="NMC Offload (Varying BW)" 
            stroke="#0d9488" 
            strokeWidth={2.5} 
            dot={{ r: 4 }}
          />
          {crossoverItem && (
            <ReferenceLine 
              x={crossoverItem.bandwidth_gbps} 
              stroke="#e11d48" 
              strokeDasharray="3 3"
              label={{ value: `Crossover ~${crossoverItem.bandwidth_gbps} GB/s`, fill: '#e11d48', fontSize: 10, position: 'top' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
