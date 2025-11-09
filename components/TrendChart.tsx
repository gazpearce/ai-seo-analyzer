
import React from 'react';

interface TrendChartProps {
  scores: number[];
}

const TrendChart: React.FC<TrendChartProps> = ({ scores }) => {
  if (scores.length < 2) {
    return null; // Can't draw a line with less than 2 points
  }

  const width = 100;
  const height = 40;
  const padding = 2; // To prevent clipping of the stroke

  // Normalize scores to fit within the chart height
  const normalizedScores = scores.map(score => Math.max(0, Math.min(100, score)));

  const points = normalizedScores.map((score, index) => {
    const x = (index / (scores.length - 1)) * width;
    const y = height - (score / 100) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TrendChart;
