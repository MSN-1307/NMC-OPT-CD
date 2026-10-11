import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CandidateStrategy } from '../types';

interface StrategyComparisonChartProps {
  candidates: CandidateStrategy[];
  recommendedStrategy: string;
}

export const StrategyComparisonChart: React.FC<StrategyComparisonChartProps> = ({
  candidates,
  recommendedStrategy,
}) => {
  const data = candidates.map((c) => ({
    strategy: c.strategy,
    total_ms: c.valid ? c.estimated_total_ms : 0,
    compute: c.valid ? c.components_ms.compute_ms : 0,
    transfer: c.valid ? c.components_ms.memory_or_transfer_ms : 0,
    layout: c.valid ? c.components_ms.layout_conversion_ms : 0,
    sync_and_overhead: c.valid ? c.components_ms.synchronization_ms + c.components_ms.overhead_ms : 0,
    isValid: c.valid,
    isRecommended: c.strategy === recommendedStrategy,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-1">{item.strategy}</p>
          {item.isValid ? (
            <div className="space-y-1">
              <p className="text-teal-700 font-semibold">Total Estimated: {item.total_ms.toFixed(4)} ms</p>
              <div className="pt-1 border-t border-slate-100 text-slate-600 space-y-0.5">
                <p>• Compute & Bank Mem: {item.compute.toFixed(4)} ms</p>
                <p>• Link Transfer / Host Mem: {item.transfer.toFixed(4)} ms</p>
                <p>• Layout Conversion: {item.layout.toFixed(4)} ms</p>
                <p>• Sync & Launch Overhead: {item.sync_and_overhead.toFixed(4)} ms</p>
              </div>
            </div>
          ) : (
            <p className="text-rose-600 italic">Strategy Ineligible for this Kernel</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="strategy" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            interval={0}
            angle={-10}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: 'Estimated Time (ms)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total_ms" name="Total Latency (ms)" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => {
              let fillColor = '#94a3b8'; // grey
              if (!entry.isValid) fillColor = '#e2e8f0';
              else if (entry.isRecommended) fillColor = '#0d9488'; // teal (winner)
              else if (entry.strategy === 'CPU-only') fillColor = '#3b82f6'; // blue
              else fillColor = '#14b8a6'; // lighter teal

              return <Cell key={`cell-${index}`} fill={fillColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
