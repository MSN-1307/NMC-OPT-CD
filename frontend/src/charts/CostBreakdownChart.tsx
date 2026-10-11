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
} from 'recharts';
import { CandidateStrategy } from '../types';

interface CostBreakdownChartProps {
  candidates: CandidateStrategy[];
}

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ candidates }) => {
  const validCandidates = candidates.filter((c) => c.valid);

  const data = validCandidates.map((c) => ({
    strategy: c.strategy,
    compute: c.components_ms.compute_ms,
    transfer: c.components_ms.memory_or_transfer_ms,
    layout: c.components_ms.layout_conversion_ms,
    sync: c.components_ms.synchronization_ms + c.components_ms.overhead_ms,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, p: any) => sum + (Number(p.value) || 0), 0);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((p: any) => {
              const val = Number(p.value) || 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
              return (
                <div key={p.dataKey} className="flex justify-between gap-4">
                  <span style={{ color: p.color }} className="font-medium">{p.name}:</span>
                  <span className="font-mono text-slate-700">{val.toFixed(4)} ms ({pct}%)</span>
                </div>
              );
            })}
            <div className="pt-1 mt-1 border-t border-slate-100 flex justify-between font-bold text-slate-900">
              <span>Total:</span>
              <span className="font-mono">{total.toFixed(4)} ms</span>
            </div>
          </div>
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
            label={{ value: 'Component Time (ms)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          <Bar dataKey="compute" name="Compute / Bank Mem" stackId="a" fill="#0d9488" />
          <Bar dataKey="transfer" name="Interconnect / Host DRAM" stackId="a" fill="#3b82f6" />
          <Bar dataKey="layout" name="Layout Rearrangement" stackId="a" fill="#f59e0b" />
          <Bar dataKey="sync" name="Sync & Dispatch" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
