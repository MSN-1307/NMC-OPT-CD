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
} from 'recharts';
import { ChartSeriesItem } from '../types';

interface ScalingLineChartProps {
  scalingData: ChartSeriesItem[];
}

export const ScalingLineChart: React.FC<ScalingLineChartProps> = ({ scalingData }) => {
  const formatSize = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-1">Problem Size: {label ? label.toLocaleString() : ''} elements</p>
          <div className="space-y-1">
            {payload.map((p: any) => (
              <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
                {p.name}: {p.value ? `${Number(p.value).toFixed(4)} ms` : 'N/A'}
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
        <LineChart data={scalingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="input_size" 
            tickFormatter={formatSize}
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: 'Input Elements (N)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#94a3b8' } }}
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
            name="CPU-only Baseline" 
            stroke="#3b82f6" 
            strokeWidth={2.5} 
            dot={{ r: 4 }} 
          />
          <Line 
            type="monotone" 
            dataKey="nmc_ms" 
            name="Direct NMC Offload" 
            stroke="#0d9488" 
            strokeWidth={2.5} 
            dot={{ r: 4 }} 
          />
          {scalingData.some(d => d.transformed_ms !== null && d.transformed_ms !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="transformed_ms" 
              name="NMC + Transformed" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              dot={{ r: 3 }} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
