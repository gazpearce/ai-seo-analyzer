import React, { useState } from 'react';
import type { SeoAnalysis } from '../types';
import { XCircleIcon, InformationCircleIcon, ClipboardDocumentCheckIcon, CheckCircleIcon, CheckIcon } from './icons/Icons';

interface ActionableChecklistProps {
  analysis: SeoAnalysis;
  factorTitles: { [K in keyof SeoAnalysis]?: string };
  primaryUrl: string;
}

const ActionableChecklist: React.FC<ActionableChecklistProps> = ({ analysis, factorTitles, primaryUrl }) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleToggleComplete = (key: string) => {
    setCompletedTasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        return newSet;
    });
  };

  const items = Object.entries(analysis)
    .map(([key, value]) => {
      if (typeof value === 'object' && value && 'status' in value && 'feedback' in value) {
        if (value.status === 'Poor' || value.status === 'Needs Improvement') {
          return {
            key: key as keyof SeoAnalysis,
            title: factorTitles[key as keyof SeoAnalysis] || key,
            status: value.status,
            feedback: value.feedback,
          };
        }
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      const aIsCompleted = completedTasks.has(a.key);
      const bIsCompleted = completedTasks.has(b.key);

      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;
      
      if (a.status === 'Poor' && b.status !== 'Poor') return -1;
      if (a.status !== 'Poor' && b.status === 'Poor') return 1;
      
      return 0;
    });

  if (items.length === 0) {
    return (
        <section>
            <div className="border-b border-slate-700 pb-2 mb-6 flex items-center gap-3">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-slate-200">Prioritized Action Plan</h2>
            </div>
            <div className="text-center py-10 px-6 bg-slate-800/60 border border-slate-700 rounded-lg">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-200">Excellent Work!</h3>
                <p className="text-slate-400 mt-1">No critical issues or items needing improvement were found in this analysis.</p>
            </div>
        </section>
    );
  }

  return (
    <section>
        <div className="border-b border-slate-700 pb-2 mb-6 flex items-center gap-3">
            <ClipboardDocumentCheckIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-200">Prioritized Action Plan</h2>
        </div>
        <div className="space-y-4">
            {items.map(item => {
                const isCompleted = completedTasks.has(item.key);
                return (
                    <div
                        key={item.key}
                        className={`bg-slate-800/60 border border-slate-700 p-4 rounded-lg flex items-start gap-4 transition-all duration-300 ease-in-out ${
                            isCompleted ? 'opacity-50' : 'opacity-100'
                        }`}
                    >
                        <div className="flex-shrink-0 mt-1">
                             <button
                                onClick={() => handleToggleComplete(item.key)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                                    isCompleted 
                                        ? 'bg-green-500 border-green-500' 
                                        : item.status === 'Poor' 
                                            ? 'border-red-400 hover:bg-red-400/20' 
                                            : 'border-yellow-400 hover:bg-yellow-400/20'
                                }`}
                                aria-label={`Mark ${item.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                                aria-pressed={isCompleted}
                            >
                                {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
                            </button>
                        </div>
                        <div className={`flex-1 transition-all duration-300 ease-in-out ${isCompleted ? 'line-through' : ''}`}>
                            <h4 className="font-semibold text-slate-200">{item.title}</h4>
                            <p className="text-sm text-slate-400">{item.feedback}</p>
                            {item.key === 'pageSpeed' && primaryUrl.startsWith('http') && (
                                <a 
                                    href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(primaryUrl)}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 group"
                                >
                                    Analyze with Google PageSpeed Insights
                                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                                </a>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    </section>
  );
};

export default ActionableChecklist;