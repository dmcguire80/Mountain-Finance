import { useMemo, useCallback } from 'react';
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
import type { ChartDataPoint } from '../types';
import { formatCurrency } from '../utils/calculations';

interface PortfolioChartProps {
  data: ChartDataPoint[];
  accounts: string[];
  showIndividualAccounts: boolean;
}

// Colors for different accounts
const accountColors = [
  '#667eea',
  '#f093fb',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#fee140',
  '#30cfd0',
  '#a8edea',
];

export function PortfolioChart({ data, accounts, showIndividualAccounts }: PortfolioChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [data]);

  const yDomain = useCallback(([dataMin, dataMax]: [number, number]): [number, number] => {
    const padding = (dataMax - dataMin) * 0.1 || dataMax * 0.05;
    return [Math.max(0, Math.floor(dataMin - padding)), Math.ceil(dataMax + padding)];
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-[var(--text-secondary)]">
        <p>No data available for the selected time period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
        <YAxis
          domain={yDomain}
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'var(--text-primary)' }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend />

        {/* Total portfolio line */}
        <Line
          type="monotone"
          dataKey="totalValue"
          name="Total Portfolio"
          stroke="#667eea"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6 }}
        />

        {/* Individual account lines */}
        {showIndividualAccounts &&
          accounts.map((accountName, index) => (
            <Line
              key={accountName}
              type="monotone"
              dataKey={`accounts.${accountName}`}
              name={accountName}
              stroke={accountColors[index % accountColors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
