import { memo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants/emissions';
import { formatKg } from '../utils/formatters';

interface PieChartProps {
  data: Record<string, number>;
}

function PieChart({ data }: PieChartProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
    }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
        No data for this period
      </div>
    );
  }

  return (
    <div className="w-full h-[250px]" aria-label="CO2 Emissions Pie Chart">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              formatKg(value),
              CATEGORY_LABELS[name] || name,
            ]}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={value => CATEGORY_LABELS[value] || value}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Screen Reader Table Fallback */}
      <table className="sr-only">
        <caption>CO2 Emissions by Category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Amount (kg)</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map(d => (
            <tr key={d.name}>
              <td>{CATEGORY_LABELS[d.name]}</td>
              <td>{d.value} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(PieChart);
