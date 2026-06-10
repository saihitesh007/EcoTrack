import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants/emissions';
import { formatDayShort, formatKg } from '../utils/formatters';
import type { DailyTotal } from '../types';

interface CO2ChartProps {
  data: DailyTotal[];
}

type CO2ChartRow = {
  name: string;
  fullDate: string;
  total: number;
  [key: string]: string | number;
};

function CO2Chart({ data }: CO2ChartProps) {
  const chartData: CO2ChartRow[] = data.map(d => ({
    name: formatDayShort(d.date),
    fullDate: d.date,
    total: d.total,
    ...d.byCategory,
  }));

  const categories = Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>;

  return (
    <div className="w-full h-[300px]" aria-label="CO2 Emissions Bar Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
          <XAxis
            dataKey="name"
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
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number, name: string) => [
              formatKg(value),
              CATEGORY_LABELS[name] || name,
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return `Date: ${payload[0].payload.fullDate}`;
              }
              return label;
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} iconType="circle" />
          {categories.map(cat => (
            <Bar
              key={cat}
              dataKey={cat}
              stackId="a"
              fill={CATEGORY_COLORS[cat]}
              radius={
                cat === categories[categories.length - 1]
                  ? [4, 4, 0, 0] // Only round top corners for the last segment
                  : [0, 0, 0, 0]
              }
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>CO2 Emissions by Day and Category</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            {categories.map(c => <th key={c} scope="col">{CATEGORY_LABELS[c]}</th>)}
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map(d => (
            <tr key={d.fullDate}>
              <td>{d.fullDate}</td>
              {categories.map(c => (
                <td key={c}>{(d[c] as number) || 0} kg</td>
              ))}
              <td>{d.total} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(CO2Chart);
