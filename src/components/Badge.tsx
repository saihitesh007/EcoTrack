import { memo } from 'react';
import { getGradeBgColor } from '../utils/sustainabilityScore';
import type { ScoreGrade } from '../types';

interface BadgeProps {
  grade: ScoreGrade;
  className?: string;
}

function Badge({ grade, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBgColor(
        grade
      )} ${className}`}
    >
      {grade}
    </span>
  );
}

export default memo(Badge);
