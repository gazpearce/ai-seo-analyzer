import React from 'react';
import type { CompetitorAnalysis, AnalysisKeyWithScore } from '../types';
import { ChartBarIcon } from './icons/Icons';
import { Table, TableHeader, TableBody, TableRow, TableCell } from './ui/Table';

interface CompetitorComparisonProps {
  primaryAnalysis: CompetitorAnalysis;
  competitorAnalyses: CompetitorAnalysis[];
}

const factorsToCompare: { key: AnalysisKeyWithScore; label: string }[] = [
  { key: 'overall', label: 'Overall Score' },
  { key: 'title', label: 'Title Tag' },
  { key: 'metaDescription', label: 'Meta Description' },
  { key: 'headings', label: 'Headings' },
  { key: 'e_e_a_t', label: 'E-E-A-T' },
  { key: 'contentFreshness', label: 'Content Freshness' },
  { key: 'pageSpeed', label: 'Page Speed' },
  { key: 'mobileFriendly', label: 'Mobile Friendly' },
];

const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/10';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
};

const CompetitorComparison: React.FC<CompetitorComparisonProps> = ({ primaryAnalysis, competitorAnalyses }) => {
  const allAnalyses = [primaryAnalysis, ...competitorAnalyses];

  const headers = ['Factor', ...allAnalyses.map((a, i) => i === 0 ? 'You' : `Competitor ${i}`)];

  return (
    <section>
        <div className="border-b border-slate-700 pb-2 mb-6 flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-200">Competitor Snapshot</h2>
        </div>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map((header, index) => (
                             <TableCell as="th" key={index} className={index > 0 ? 'text-center' : ''}>
                                {index > 0 && allAnalyses[index-1] ? (
                                    <a href={allAnalyses[index-1].url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate block">
                                        {header}
                                    </a>
                                ) : header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {factorsToCompare.map(({ key, label }) => {
                        const factorData = allAnalyses.map(a => a[key]);
                        if (!factorData[0] || typeof factorData[0] !== 'object' || !('score' in factorData[0])) {
                            return null;
                        }

                        const scores = factorData.map(fd => fd && 'score' in fd ? fd.score : null);
                        const bestScore = Math.max(...scores.filter((s): s is number => s !== null));
                        
                        return (
                            <TableRow key={key}>
                                <TableCell as="th" className="font-medium text-slate-200">
                                    {label}
                                </TableCell>
                                {scores.map((score, index) => (
                                    <TableCell key={index} className="text-center">
                                        {score !== null ? (
                                            <span className={`px-2 py-1 font-bold rounded-md text-base ${getScoreColor(score)} ${score === bestScore ? 'ring-1 ring-cyan-400' : ''}`}>
                                                {score}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500">-</span>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    </section>
  );
};

export default CompetitorComparison;