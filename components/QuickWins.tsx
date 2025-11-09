import React from 'react';
import type { QuickWin } from '../types';
import { SparklesIcon } from './icons/Icons';

interface QuickWinsProps {
  wins: QuickWin[];
}

const getStatusStyles = (status: 'Poor' | 'Needs Improvement') => {
    return status === 'Poor' 
        ? 'border-red-500/50 text-red-300' 
        : 'border-yellow-500/50 text-yellow-300';
}

const QuickWins: React.FC<QuickWinsProps> = ({ wins }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <SparklesIcon className="w-6 h-6 text-indigo-400" />
        <h3 className="font-semibold text-lg text-slate-200">Quick Wins</h3>
      </div>
      {wins.length > 0 ? (
        <div className="space-y-3">
            {wins.map(win => (
                <div key={win.key} className={`p-3 border-l-4 rounded-r-md bg-slate-800/60 ${getStatusStyles(win.status)}`}>
                    <h4 className="font-semibold text-sm text-slate-200">{win.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{win.feedback}</p>
                </div>
            ))}
        </div>
      ) : (
         <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm text-slate-500">No critical issues found in the last analysis. Great job!</p>
        </div>
      )}
    </div>
  );
};

export default QuickWins;