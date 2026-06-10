import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate, formatKg } from '../utils/formatters';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants/emissions';
import type { Activity, TransportDetails, FoodDetails, EnergyDetails, WaterDetails, ShoppingDetails } from '../types';

interface ActivityRowProps {
  activity: Activity;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ActivityRow({ activity, onDelete, isDeleting }: ActivityRowProps) {
  const getDetailsString = () => {
    switch (activity.category) {
      case 'transport': {
        const details = activity.details as TransportDetails;
        return `${details.distanceKm} km via ${details.vehicle}`;
      }
      case 'food': {
        const details = activity.details as FoodDetails;
        return `${details.meals} ${details.foodType} meals`;
      }
      case 'energy': {
        const details = activity.details as EnergyDetails;
        return `${details.electricityKwh} kWh, ${details.gasM3} m³ gas`;
      }
      case 'water': {
        const details = activity.details as WaterDetails;
        return `${details.litres} litres`;
      }
      case 'shopping': {
        const details = activity.details as ShoppingDetails;
        return `${details.quantity} x ${details.shoppingCategory}`;
      }
      default:
        return 'Details recorded';
    }
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
        {formatDate(activity.date)}
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[activity.category] }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {CATEGORY_LABELS[activity.category]}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
        {getDetailsString()}
      </td>
      <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
        {formatKg(activity.co2kg)}
      </td>
      <td className="py-4 px-4 text-right whitespace-nowrap">
        <button
          onClick={() => onDelete(activity.id)}
          disabled={isDeleting}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          aria-label={`Delete activity from ${formatDate(activity.date)}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

export default memo(ActivityRow);
