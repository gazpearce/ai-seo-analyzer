import React from 'react';
import type { KeywordCluster, KeywordIdea } from '../types';

interface KeywordClustersProps {
    clusters: KeywordCluster[] | null;
    isLoading: boolean;
}

const getDifficultyColor = (difficulty: KeywordIdea['difficulty']) => {
    switch (difficulty) {
        case 'Low': return 'bg-green-500';
        case 'Medium': return 'bg-yellow-500';
        case 'High': return 'bg-red-500';
        default: return 'bg-slate-500';
    }
};

const KeywordClusters: React.FC<KeywordClustersProps> = ({ clusters, isLoading }) => {
    if (isLoading) {
        return (
            <div className="text-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-3"></div>
                <p className="text-slate-400">AI is grouping keywords...</p>
            </div>
        );
    }

    if (!clusters) {
        return (
             <div className="text-center p-12">
                <p className="text-slate-500">Click "AI Cluster Keywords" to group these keywords into semantic topics.</p>
            </div>
        );
    }
    
    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusters.map((cluster) => (
                <div key={cluster.clusterName} className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex flex-col">
                    <h3 className="text-lg font-semibold text-indigo-400 mb-3">{cluster.clusterName}</h3>
                    <div className="space-y-2">
                        {cluster.keywords.map(kw => (
                             <div key={kw.keyword} className="flex items-center justify-between text-sm bg-slate-800 p-2 rounded-md">
                                <span className="text-slate-300 flex-1 truncate pr-2">{kw.keyword}</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-slate-400 w-12 text-right">{kw.volume.toLocaleString()}</span>
                                    <div className={`w-2.5 h-2.5 rounded-full ${getDifficultyColor(kw.difficulty)}`} title={kw.difficulty}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KeywordClusters;