import React, { useState } from 'react';
// Fix: Corrected import path for types, though it was visually the same, this ensures it resolves correctly after fixing types.ts
import type { SeoAnalysis } from '../types';
import { rankingFactors, FactorCategory } from '../services/rankingFactors';
import { ChevronUpDownIcon } from './icons/Icons';

const categoryOrder: FactorCategory[] = ['Content & Authority', 'Technical SEO', 'User Experience', 'Off-Page & Local'];

const getStatusStyles = (status: 'Good' | 'Needs Improvement' | 'Poor') => {
  switch (status) {
    case 'Good': return { bg: 'bg-green-500/10', text: 'text-green-300', border: 'border-green-500/30' };
    case 'Needs Improvement': return { bg: 'bg-yellow-500/10', text: 'text-yellow-300', border: 'border-yellow-500/30' };
    case 'Poor': return { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/30' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' };
  }
};

const ScoreDisplay: React.FC<{ score: number, status: 'Good' | 'Needs Improvement' | 'Poor' }> = ({ score, status }) => {
    const styles = getStatusStyles(status);
    // Use the text color for the bar fill for better visibility
    const barColor = styles.text.replace('text-', 'bg-');

    return (
        <div className="flex items-center gap-3" style={{ minWidth: '120px' }}>
            <div className="w-full bg-slate-700 rounded-full h-2 flex-1">
                <div 
                    className={`${barColor} h-2 rounded-full`} 
                    style={{ width: `${score}%`, transition: 'width 0.5s ease-out' }}
                ></div>
            </div>
            <span className={`font-semibold text-sm w-8 text-right ${styles.text}`}>{score}</span>
        </div>
    );
};


interface FullReportProps {
  analysis: SeoAnalysis;
  primaryUrl: string;
}

const FullReport: React.FC<FullReportProps> = ({ analysis, primaryUrl }) => {
    const [openCategories, setOpenCategories] = useState<Record<FactorCategory, boolean>>({
        'Content & Authority': true,
        'Technical SEO': true,
        'User Experience': false,
        'Off-Page & Local': false,
    });

    const toggleCategory = (category: FactorCategory) => {
        setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    const factorsByCategory = rankingFactors.reduce((acc, factor) => {
        const factorData = analysis[factor.id] as any;
        if (factor.id === 'overall' || !factorData || typeof factorData.score !== 'number') return acc;
        
        (acc[factor.category] = acc[factor.category] || []).push({
            ...factor,
            ...factorData,
        });
        return acc;
    }, {} as Record<FactorCategory, (typeof rankingFactors[0] & { score: number; status: 'Good' | 'Needs Improvement' | 'Poor', feedback: string } & any)[]>);


    // Sort factors within each category by score (lowest first)
    for (const category in factorsByCategory) {
        factorsByCategory[category as FactorCategory].sort((a, b) => a.score - b.score);
    }
    
    return (
        <section>
            <div className="border-b border-slate-700 pb-2 mb-6">
                <h2 className="text-xl font-semibold text-slate-200">Full Report Breakdown</h2>
            </div>
            <div className="space-y-4">
                {categoryOrder.map(category => (
                    <div key={category} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <button
                            className="w-full flex items-center justify-between p-4 text-left"
                            onClick={() => toggleCategory(category)}
                            aria-expanded={openCategories[category]}
                        >
                            <h3 className="text-lg font-semibold text-slate-200">{category}</h3>
                            <ChevronUpDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${openCategories[category] ? 'rotate-180' : ''}`} />
                        </button>
                        {openCategories[category] && (
                            <div className="px-4 pb-4 animate-fade-in">
                                <ul className="space-y-3">
                                    {factorsByCategory[category]?.map(item => {
                                        const styles = getStatusStyles(item.status);
                                        return (
                                            <li key={item.id} className={`p-4 rounded-lg ${styles.bg} border ${styles.border}`}>
                                                <div className="flex items-center justify-between gap-4">
                                                    <h4 className="font-semibold text-slate-200 flex-1">{item.title}</h4>
                                                    <ScoreDisplay score={item.score} status={item.status} />
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-sm text-slate-400">{item.feedback}</p>
                                                    {item.id === 'pageSpeed' && primaryUrl.startsWith('http') && (
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
                                                    {item.id === 'metaTagOptimization' && item.suggested_keywords?.length > 0 && (
                                                        <div className="mt-3 border-t border-slate-600/50 pt-3">
                                                            <h5 className="text-xs font-semibold text-slate-300 mb-2">AI Suggested Keywords:</h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.suggested_keywords.map((kw: string) => (
                                                                    <span key={kw} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-md font-mono">
                                                                        {kw}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FullReport;