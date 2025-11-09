import React from 'react';
import type { SeoAnalysis, AnalyzedLink } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableCell } from './ui/Table';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from './icons/Icons';

interface InternalLinkAnalysisProps {
  data: SeoAnalysis['internalLinking'];
}

const getStatusStyles = (status: AnalyzedLink['status']) => {
    switch (status) {
        case 'Good': return { icon: <CheckCircleIcon className="w-5 h-5 text-green-400" />, text: 'text-green-300' };
        case 'Needs Improvement': return { icon: <InformationCircleIcon className="w-5 h-5 text-yellow-400" />, text: 'text-yellow-300' };
        case 'Poor': return { icon: <XCircleIcon className="w-5 h-5 text-red-400" />, text: 'text-red-300' };
        default: return { icon: null, text: 'text-slate-400' };
    }
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-800 p-4 rounded-lg text-center shadow-inner flex items-center gap-4">
    <div className="text-indigo-400">{icon}</div>
    <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
    </div>
  </div>
);

const InternalLinkAnalysis: React.FC<InternalLinkAnalysisProps> = ({ data }) => {
  if (!data || !data.links) {
    return null;
  }

  return (
    <section>
      <div className="border-b border-slate-700 pb-2 mb-6">
        <h2 className="text-xl font-semibold text-slate-200">Internal Linking Analysis</h2>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <StatCard label="Good Links" value={data.goodLinkCount} icon={<CheckCircleIcon className="w-8 h-8"/>} />
             <StatCard label="Links to Improve" value={data.badLinkCount} icon={<XCircleIcon className="w-8 h-8"/>} />
            <div className="bg-slate-800 p-4 rounded-lg shadow-inner md:col-span-1">
                <p className="font-semibold text-slate-200">Overall Feedback</p>
                <p className="text-sm text-slate-400 mt-1">{data.feedback}</p>
            </div>
        </div>

        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell as="th" className="w-1/4">Anchor Text</TableCell>
                        <TableCell as="th" className="w-1/4">URL</TableCell>
                        <TableCell as="th" className="w-1/2">Feedback</TableCell>
                        <TableCell as="th">Status</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.links.map((link, index) => {
                        const { icon, text } = getStatusStyles(link.status);
                        return (
                            <TableRow key={index}>
                                <TableCell className="font-mono text-sm text-indigo-300 max-w-xs truncate">{link.anchorText}</TableCell>
                                <TableCell className="font-mono text-sm max-w-xs truncate">{link.url}</TableCell>
                                <TableCell className="text-slate-400">{link.feedback}</TableCell>
                                <TableCell>
                                    <span className="flex items-center justify-center" title={link.status}>
                                        {icon}
                                    </span>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
             {data.links.length === 0 && (
                <div className="text-center py-12 px-6">
                    <p className="text-slate-500">No internal links were found in the provided content.</p>
                </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default InternalLinkAnalysis;
