import React from 'react';
import { rankingFactors, FactorCategory } from '../services/rankingFactors';
import { CheckCircleIcon } from '../components/icons/Icons';

const categoryOrder: FactorCategory[] = ['Content & Authority', 'Technical SEO', 'User Experience', 'Off-Page & Local'];

const MethodologyPage: React.FC = () => {

    const factorsByCategory = rankingFactors.reduce((acc, factor) => {
        if(factor.id === 'overall') return acc; // Don't show the 'overall' factor here
        (acc[factor.category] = acc[factor.category] || []).push(factor);
        return acc;
    }, {} as Record<FactorCategory, typeof rankingFactors>);

    // Sort factors within each category by importance
    for (const category in factorsByCategory) {
        factorsByCategory[category as FactorCategory].sort((a, b) => b.importance - a.importance);
    }

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
                 <h1 className="text-3xl font-bold text-slate-100">Ranking Factor Methodology</h1>
                <p className="text-slate-400 max-w-3xl mx-auto mt-2">
                    Our AI analyzes dozens of signals to provide a holistic SEO score. Here’s a breakdown of what we look for, why it matters, and how each factor is scored.
                </p>
            </div>

            <div className="space-y-12">
                {categoryOrder.map(category => (
                    <section key={category}>
                        <h2 className="text-2xl font-semibold text-indigo-400 border-b border-slate-700 pb-3 mb-6">{category}</h2>
                        <div className="space-y-6">
                            {factorsByCategory[category].map(factor => (
                                <div key={factor.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-semibold text-slate-100">{factor.title}</h3>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="text-sm text-slate-400">Importance</p>
                                            <p className="text-2xl font-bold text-slate-200">{factor.importance}<span className="text-base font-normal text-slate-500">/10</span></p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 mt-2">{factor.description}</p>
                                    <div className="mt-4 border-t border-slate-800 pt-4">
                                        <h4 className="font-semibold text-slate-300 mb-2">Scoring Criteria:</h4>
                                        <ul className="space-y-2">
                                            {factor.criteria.map((criterion, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-slate-400 text-sm">{criterion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default MethodologyPage;