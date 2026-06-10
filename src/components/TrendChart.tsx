import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatMonthLabel, formatKg } from '../utils/formatters';

interface TrendData {
  month: string; // YYYY-MM
  total: number;
}

interface TrendChartProps {
  data: TrendData[];
}

function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
        Not enough historical data
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    label: formatMonthLabel(d.month),
  }));

  return (
    <div className="w-full h-[250px]" aria-label="Monthly CO2 Trend Chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={value => `${value}`}
          />
          <Tooltip
            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [formatKg(value), 'Total CO₂']}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ fill: '#16a34a', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>Monthly CO2 Trends</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Amount (kg)</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map(d => (
            <tr key={d.month}>
              <td>{d.label}</td>
              <td>{d.total} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(TrendChart);
