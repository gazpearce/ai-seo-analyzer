import React, { useState, useMemo } from 'react';
import type { HistoricalAnalysis } from '../types';
import { TrashIcon, MagnifyingGlassIcon } from '../components/icons/Icons';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';

interface ReportsPageProps {
  history: Record<string, HistoricalAnalysis[]>;
  onSelectAnalysis: (record: HistoricalAnalysis) => void;
  onClearHistory: () => void;
}

const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/50';
    if (score >= 50) return 'text-yellow-400 bg-yellow-900/50';
    return 'text-red-400 bg-red-900/50';
};


const ReportsPage: React.FC<ReportsPageProps> = ({ history, onSelectAnalysis, onClearHistory }) => {
  const [filter, setFilter] = useState('');

  const allAnalyses = useMemo(() => {
    return Object.values(history).flat().sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  const filteredAnalyses = useMemo(() => {
    if (!filter) return allAnalyses;
    return allAnalyses.filter(
      (a) => 
        a.url.toLowerCase().includes(filter.toLowerCase()) ||
        a.keyword.toLowerCase().includes(filter.toLowerCase())
    );
  }, [allAnalyses, filter]);


  if (allAnalyses.length === 0) {
    return (
        <div className="text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-slate-200">No Reports Yet</h2>
            <p className="text-slate-400 mt-2">Run a site audit to generate your first report.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-100">All Reports</h1>
                <p className="text-slate-400">Review all historical analyses you've run.</p>
            </div>
            <button
                onClick={onClearHistory}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-900/50 border border-red-800 rounded-md hover:bg-red-900 transition-colors"
            >
                <TrashIcon className="w-4 h-4" />
                Clear History
            </button>
        </div>

        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
                type="text"
                placeholder="Filter by URL or keyword..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full rounded-md border-0 bg-white/5 py-2 pl-10 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
            />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800">
                            <TableCell as="th">Date</TableCell>
                            <TableCell as="th">URL</TableCell>
                            <TableCell as="th">Keyword</TableCell>
                            <TableCell as="th" className="text-center">Score</TableCell>
                            <TableCell as="th"><span className="sr-only">Actions</span></TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAnalyses.map((record) => (
                            <TableRow key={record.timestamp}>
                                <TableCell className="whitespace-nowrap">{new Date(record.timestamp).toLocaleString()}</TableCell>
                                <TableCell className="max-w-xs truncate font-medium text-slate-200">{record.url}</TableCell>
                                <TableCell>{record.keyword || '-'}</TableCell>
                                <TableCell className="text-center">
                                    <span className={`px-2 py-1 font-bold rounded-md text-xs ${getScoreColor(record.analysis.overall.score)}`}>
                                        {record.analysis.overall.score}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button
                                        onClick={() => onSelectAnalysis(record)}
                                        className="font-medium text-indigo-400 hover:text-indigo-300"
                                    >
                                        View Report
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             {filteredAnalyses.length === 0 && (
                <div className="text-center py-12 px-6">
                    <h3 className="text-lg font-semibold text-slate-200">No Matching Reports</h3>
                    <p className="text-slate-400 mt-1">Try adjusting your filter.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ReportsPage;
