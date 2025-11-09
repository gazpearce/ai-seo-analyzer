import React from 'react';
import type { SeoAnalysis } from '../types';
import { ClipboardDocumentListIcon } from './icons/Icons';

interface ContentStructureAnalysisProps {
  analysis: SeoAnalysis;
}

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-800 p-4 rounded-lg text-center shadow-inner">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-slate-100">{value}</p>
  </div>
);

const ContentStructureAnalysis: React.FC<ContentStructureAnalysisProps> = ({ analysis }) => {
  const { headings, contentKeywords, llmReadiness, userIntentMatch } = analysis;
  
  const getStatusColor = (status: 'Good' | 'Needs Improvement' | 'Poor') => {
    if (status === 'Good') return 'text-green-400';
    if (status === 'Needs Improvement') return 'text-yellow-400';
    return 'text-red-400';
  };

  const RelevanceScore: React.FC<{ title: string; data: SeoAnalysis[keyof SeoAnalysis]}> = ({ title, data }) => {
      if (!data || typeof data.score !== 'number') return null;

      return (
        <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-b-0">
          <span className="text-sm text-slate-300">{title}</span>
          <span className={`font-bold text-sm ${getStatusColor(data.status)}`}>{data.score}/100</span>
        </div>
      );
  };

  return (
    <section>
      <div className="border-b border-slate-700 pb-2 mb-6 flex items-center gap-3">
        <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-slate-200">Content Structure &amp; Relevance</h2>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="H1 Headings" value={headings.h1_count} />
          <StatCard label="H2 Headings" value={headings.h2_count} />
          <StatCard label="H3 Headings" value={headings.h3_count} />
          <StatCard label="Avg. Paragraph" value={`${headings.average_paragraph_length} words`} />
          <StatCard label="Long Paragraphs" value={headings.long_paragraphs_count} />
        </div>
        <div className="border-t border-slate-700 pt-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h4 className="font-semibold text-slate-200">Headings AI Feedback</h4>
            <p className="font-bold text-lg">
              Score: <span className={getStatusColor(headings.status)}>{headings.score}/100</span>
            </p>
          </div>
          <p className="text-sm text-slate-400 mt-2">{headings.feedback}</p>
        </div>
        
        <div className="border-t border-slate-700 pt-4 mt-4">
            <h4 className="font-semibold text-slate-200 mb-2">Key Content Scores</h4>
            <div className="space-y-1">
                <RelevanceScore title="Content Keyword Alignment" data={contentKeywords} />
                <RelevanceScore title="LLM Readiness (AI Overviews)" data={llmReadiness} />
                <RelevanceScore title="User Intent Match" data={userIntentMatch} />
            </div>
        </div>
      </div>
    </section>
  );
};

export default ContentStructureAnalysis;