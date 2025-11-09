import React, { useState, useMemo, useCallback } from 'react';
import type { KeywordIdea, KeywordCluster } from '../types';
import { clusterKeywords } from '../services/geminiService';
import { KeyIcon } from '../components/icons/Icons';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import KeywordClusters from '../components/KeywordClusters';

interface KeywordExplorerPageProps {
    onExplore: (seedKeyword: string) => void;
    isLoading: boolean;
    error: string | null;
    results: KeywordIdea[];
}

type View = 'list' | 'clusters';

const getDifficultyStyles = (difficulty: KeywordIdea['difficulty']) => {
    switch (difficulty) {
        case 'Low': return 'bg-green-500/20 text-green-300';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-300';
        case 'High': return 'bg-red-500/20 text-red-300';
        default: return 'bg-slate-600/20 text-slate-300';
    }
};

const KeywordExplorerPage: React.FC<KeywordExplorerPageProps> = ({ onExplore, isLoading, error, results }) => {
    const [seedKeyword, setSeedKeyword] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof KeywordIdea; direction: 'asc' | 'desc' } | null>({ key: 'volume', direction: 'desc' });
    const [view, setView] = useState<View>('list');
    const [clusters, setClusters] = useState<KeywordCluster[] | null>(null);
    const [isClustering, setIsClustering] = useState(false);
    const [clusterError, setClusterError] = useState<string | null>(null);

    const handleExplore = (e: React.FormEvent) => {
        e.preventDefault();
        if (seedKeyword.trim()) {
            // Reset state for new search
            setClusters(null);
            setClusterError(null);
            setView('list');
            onExplore(seedKeyword.trim());
        }
    };
    
    const handleClusterKeywords = useCallback(async () => {
        if (results.length === 0) return;
        setIsClustering(true);
        setClusterError(null);
        try {
            const clusterResults = await clusterKeywords(results);
            setClusters(clusterResults);
            setView('clusters');
        } catch (err: any) {
            setClusterError(err.message || "Failed to generate keyword clusters.");
        } finally {
            setIsClustering(false);
        }
    }, [results]);

    const sortedResults = useMemo(() => {
        let sortableItems = [...results];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [results, sortConfig]);

    const requestSort = (key: keyof KeywordIdea) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: keyof KeywordIdea, children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig?.key === sortKey;
        const directionIcon = sortConfig?.direction === 'asc' ? '▲' : '▼';
        return (
            <TableCell as="th">
                <button className="flex items-center gap-1 group" onClick={() => requestSort(sortKey)}>
                    <span>{children}</span>
                    <span className={`text-xs transition-opacity ${isSorted ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>{isSorted ? directionIcon : '↕'}</span>
                </button>
            </TableCell>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-100">Keyword Explorer</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Discover new keyword ideas, analyze their potential, and understand user intent.
                </p>
            </div>

            <form onSubmit={handleExplore} className="mb-8 max-w-2xl mx-auto">
                <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                        type="text"
                        value={seedKeyword}
                        onChange={(e) => setSeedKeyword(e.target.value)}
                        placeholder="Enter a seed keyword, e.g., 'sustainable coffee'"
                        className="w-full flex-1 bg-transparent p-3 text-lg text-slate-200 placeholder-slate-500 focus:outline-none"
                        disabled={isLoading}
                        aria-label="Seed Keyword"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !seedKeyword.trim()}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Searching...' : 'Find Keywords'}
                    </button>
                </div>
            </form>

            {isLoading && (
                 <div className="text-center mt-8 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mb-4"></div>
                    <p className="text-lg text-slate-300">Finding keyword ideas...</p>
                </div>
            )}
            
            {error && (
                <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-2xl mx-auto text-center">
                    {error}
                </div>
            )}
            
            {!isLoading && !error && results.length === 0 && (
                <div className="text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-xl">
                    <KeyIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-200">Ready to explore?</h2>
                    <p className="text-slate-400 mt-2">Enter a keyword above to generate related terms and ideas.</p>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                 <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm rounded-md ${view === 'list' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}>List View</button>
                             <button onClick={() => setView('clusters')} className={`px-3 py-1.5 text-sm rounded-md ${view === 'clusters' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}>Cluster View</button>
                         </div>
                        {view === 'list' && (
                            <button onClick={handleClusterKeywords} disabled={isClustering} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 text-sm disabled:bg-slate-600">
                                {isClustering ? 'Clustering...' : 'AI Cluster Keywords'}
                            </button>
                        )}
                    </div>
                    {clusterError && <div className="p-4 text-center text-red-400 bg-red-900/40">{clusterError}</div>}
                    {view === 'list' ? (
                        <div className="overflow-x-auto">
                             <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableCell as="th">Keyword</TableCell>
                                        <SortableHeader sortKey="volume">Est. Volume</SortableHeader>
                                        <SortableHeader sortKey="difficulty">Difficulty</SortableHeader>
                                        <SortableHeader sortKey="intent">Intent</SortableHeader>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedResults.map((idea) => (
                                        <TableRow key={idea.keyword}>
                                            <TableCell className="font-medium text-slate-200">{idea.keyword}</TableCell>
                                            <TableCell>{idea.volume.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 font-medium rounded-md text-xs ${getDifficultyStyles(idea.difficulty)}`}>
                                                    {idea.difficulty}
                                                </span>
                                            </TableCell>
                                            <TableCell>{idea.intent}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <KeywordClusters clusters={clusters} isLoading={isClustering} />
                    )}
                </div>
            )}
        </div>
    );
};

export default KeywordExplorerPage;