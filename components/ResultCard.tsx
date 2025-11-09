import React from 'react';
import TrendChart from './TrendChart';

interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  status: 'Good' | 'Needs Improvement' | 'Poor';
  feedback: string;
  history?: number[];
  keywords?: string[];
  id?: string;
  url?: string;
}

const getStatusStyles = (status: 'Good' | 'Needs Improvement' | 'Poor') => {
  switch (status) {
    case 'Good':
      return {
        pill: 'bg-green-500/20 text-green-300 border-green-500/30',
        ring: 'ring-green-400',
        text: 'text-green-400',
      };
    case 'Needs Improvement':
      return {
        pill: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        ring: 'ring-yellow-400',
        text: 'text-yellow-400',
      };
    case 'Poor':
      return {
        pill: 'bg-red-500/20 text-red-300 border-red-500/30',
        ring: 'ring-red-400',
        text: 'text-red-400',
      };
    default:
      return {
        pill: 'bg-slate-600 text-slate-300',
        ring: 'ring-slate-500',
        text: 'text-slate-400',
      };
  }
};

const ResultCard: React.FC<ResultCardProps> = ({ icon, title, score, status, feedback, history, keywords, id, url }) => {
  const styles = getStatusStyles(status);
  const circumference = 2 * Math.PI * 18; // 2 * pi * radius
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col h-full shadow-md hover:border-indigo-500/50 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-indigo-400">{icon}</div>
          <h3 className="font-semibold text-lg text-white">{title}</h3>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="absolute w-full h-full" viewBox="0 0 40 40">
                <circle
                    className="text-slate-700"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                />
                <circle
                    className={`${styles.text} transform -rotate-90 origin-center`}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <span className={`text-sm font-bold ${styles.text}`}>{score}</span>
        </div>
      </div>
      <p className="text-slate-400 text-sm flex-grow">{feedback}</p>
      
      {id === 'pageSpeed' && url && url.startsWith('http') && (
        <a
            href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 group"
        >
            Analyze with Google PageSpeed Insights
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      )}

      {keywords && keywords.length > 0 && (
        <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Top Keywords Identified</h4>
            <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-md font-mono">
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
      )}

      <div className="mt-4">
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${styles.pill}`}
        >
          {status}
        </span>
      </div>

      {history && history.length > 1 && (
        <div className="mt-5 border-t border-slate-700/50 pt-3">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Score Trend</h4>
            <div className="h-10 text-slate-500">
                <TrendChart scores={history} />
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;