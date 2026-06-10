import { memo, useEffect, useRef } from 'react';
import { getGradeColor } from '../utils/sustainabilityScore';
import type { ScoreGrade } from '../types';

interface ScoreRingProps {
  score: number;
  grade: ScoreGrade;
  size?: number;
  strokeWidth?: number;
}

function ScoreRing({ score, grade, size = 160, strokeWidth = 12 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.setProperty('--score-offset', `${offset}`);
    }
  }, [offset]);

  // Map grade to stroke color
  const getStrokeColor = () => {
    switch (grade) {
      case 'Excellent':
        return 'var(--tw-colors-green-500, #22c55e)';
      case 'Good':
        return 'var(--tw-colors-teal-500, #14b8a6)';
      case 'Average':
        return 'var(--tw-colors-amber-500, #f59e0b)';
      case 'Poor':
        return 'var(--tw-colors-red-500, #ef4444)';
      default:
        return 'var(--tw-colors-gray-500, #6b7280)';
    }
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Sustainability Score: ${score} out of 100`}
    >
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          ref={ringRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="transition-all duration-1500 ease-out animate-score-fill"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">
          {Math.round(score)}
        </span>
        <span className={`text-sm font-medium mt-1 ${getGradeColor(grade)}`}>
          {grade}
        </span>
      </div>
    </div>
  );
}

export default memo(ScoreRing);
