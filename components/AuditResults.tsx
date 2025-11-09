import React, { useState } from 'react';
import type { SeoAnalysis, CompetitorAnalysis } from '../types';
import ActionableChecklist from './ActionableChecklist';
import CompetitorComparison from './CompetitorComparison';
import FullReport from './FullReport';
import { generateLlmPrompt } from '../services/reportGenerator';
import { 
    DocumentDuplicateIcon, 
    CheckCircleIcon, 
    IdentificationIcon, 
    DocumentTextIcon,
    LinkIcon,
    ArrowTrendingUpIcon
} from './icons/Icons';
import ResultCard from './ResultCard';
import ContentStructureAnalysis from './ContentStructureAnalysis';
import PageSpeedInsights from './PageSpeedInsights';
import InternalLinkAnalysis from './InternalLinkAnalysis';
import ImageSeoDetails from './ImageSeoDetails';
import SchemaGenerator from './SchemaGenerator';

interface AuditResultsProps {
    primaryUrl: string;
    keyword: string;
    data: SeoAnalysis;
    competitorAnalyses: CompetitorAnalysis[];
}

const factorTitles: { [K in keyof SeoAnalysis]?: string } = {
    title: 'Title Tag', metaDescription: 'Meta Description', headings: 'Headings & Structure', contentKeywords: 'Content Keywords',
    imageSeo: 'Image SEO', e_e_a_t: 'E-E-A-T', llmReadiness: 'LLM Readiness', userIntentMatch: 'User Intent Match',
    contentFreshness: 'Content Freshness', pageSpeed: 'Page Speed', security: 'Security & Trust',
    structuredData: 'Structured Data', urlStructure: 'URL Structure', linkHealth: 'On-Page Link Health',
    indexability: 'Indexability', xmlSitemap: 'XML Sitemap', internalLinking: 'Internal Linking', mobileFriendly: 'Mobile Friendly',
    accessibility: 'Accessibility', readability: 'Readability', ctaEffectiveness: 'CTA Effectiveness',
    backlinkProfile: 'Backlink Profile', brandSignals: 'Brand Signals', googleBusinessProfile: 'Google Business Profile',
    napConsistency: 'NAP Consistency', localReviews: 'Local Reviews', metaTagOptimization: 'Meta Tag Optimization'
};


const AuditResults: React.FC<AuditResultsProps> = ({ primaryUrl, keyword, data, competitorAnalyses }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyPrompt = () => {
        const prompt = generateLlmPrompt(data, primaryUrl, keyword);
        navigator.clipboard.writeText(prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    return (
        <div className="space-y-12 mt-8">
            <section>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-slate-100 break-all">{primaryUrl}</h2>
                    <p className="text-slate-400">Overall Score: <span className="font-bold text-lg text-indigo-400">{data.overall.score}</span></p>
                    <p className="mt-2 text-slate-300">{data.overall.summary}</p>
                </div>
            </section>

            <section>
                <div className="border-b border-slate-700 pb-2 mb-6">
                    <h2 className="text-xl font-semibold text-slate-200">Key On-Page Factors</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultCard
                        id="title"
                        icon={<IdentificationIcon className="w-6 h-6" />}
                        title="Title Tag"
                        score={data.title.score}
                        status={data.title.status}
                        feedback={data.title.feedback}
                    />
                    <ResultCard
                        id="metaDescription"
                        icon={<DocumentTextIcon className="w-6 h-6" />}
                        title="Meta Description"
                        score={data.metaDescription.score}
                        status={data.metaDescription.status}
                        feedback={data.metaDescription.feedback}
                    />
                </div>
            </section>
            
            <PageSpeedInsights data={data.pageSpeed} url={primaryUrl} />

            <ContentStructureAnalysis analysis={data} />

            <ImageSeoDetails data={data.imageSeo} />
            
            <InternalLinkAnalysis data={data.internalLinking} />

            <section>
                <div className="border-b border-slate-700 pb-2 mb-6">
                    <h2 className="text-xl font-semibold text-slate-200">Hypothetical Off-Page Factors</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultCard
                        id="backlinkProfile"
                        icon={<LinkIcon className="w-6 h-6" />}
                        title="Backlink Profile"
                        score={data.backlinkProfile.score}
                        status={data.backlinkProfile.status}
                        feedback={data.backlinkProfile.feedback}
                    />
                    <ResultCard
                        id="brandSignals"
                        icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
                        title="Brand Signals"
                        score={data.brandSignals.score}
                        status={data.brandSignals.status}
                        feedback={data.brandSignals.feedback}
                    />
                </div>
            </section>

            <SchemaGenerator primaryUrl={primaryUrl} keyword={keyword} structuredDataScore={data.structuredData} />

            <ActionableChecklist analysis={data} factorTitles={factorTitles} primaryUrl={primaryUrl} />

            <FullReport analysis={data} primaryUrl={primaryUrl} />
            
            {competitorAnalyses.length > 0 && (
                <CompetitorComparison 
                    primaryAnalysis={{...data, url: primaryUrl}} 
                    competitorAnalyses={competitorAnalyses} 
                />
            )}
            
            <section>
                <div className="border-b border-slate-700 pb-2 mb-6">
                    <h2 className="text-xl font-semibold text-slate-200">Generate Full Report Prompt</h2>
                    <p className="text-sm text-slate-400">Copy this prompt and paste it into an LLM (like Gemini) for a detailed, human-readable improvement plan.</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <pre className="bg-slate-900/70 text-sm text-slate-300 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono">
                        {generateLlmPrompt(data, primaryUrl, keyword).substring(0, 400)}...
                    </pre>
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleCopyPrompt}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                            disabled={isCopied}
                        >
                            {isCopied ? (
                                <>
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <DocumentDuplicateIcon className="w-5 h-5" />
                                    Copy Full Prompt
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AuditResults;