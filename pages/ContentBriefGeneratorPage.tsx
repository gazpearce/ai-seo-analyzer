import React, { useState } from 'react';
import type { ContentBrief } from '../types';
import { ClipboardDocumentCheckIcon, CheckCircleIcon, SparklesIcon } from '../components/icons/Icons';

interface ContentBriefGeneratorPageProps {
    onGenerate: (topic: string) => void;
    isLoading: boolean;
    error: string | null;
    brief: ContentBrief | null;
}

const BriefResult: React.FC<{ brief: ContentBrief }> = ({ brief }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const handleCopy = () => {
        const textToCopy = `
# Content Brief: ${brief.suggestedTitle}

## Meta Information
- **Suggested Title:** ${brief.suggestedTitle}
- **Suggested Meta Description:** ${brief.suggestedMetaDescription}
- **Target Word Count:** ~${brief.targetWordCount} words
- **Target Readability:** Grade ${brief.targetReadabilityGrade}

## Strategic Insights
- **Competitor Tone of Voice:** ${brief.toneOfVoice}
- **Suggested Unique Angle:** ${brief.uniqueAngleSuggestion}

## Key Questions to Answer
${brief.questionsToAnswer.map(q => `- ${q}`).join('\n')}

## Semantic Keywords to Include
${brief.semanticKeywords.join(', ')}

## Content Outline
${brief.outline.map(o => `### ${o.title}\n${o.subheadings.map(s => `- ${s}`).join('\n')}`).join('\n\n')}
        `;
        navigator.clipboard.writeText(textToCopy.trim());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl shadow-lg animate-fade-in">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-100">Your Content Brief</h2>
                <button
                    onClick={handleCopy}
                    disabled={isCopied}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 disabled:opacity-60 transition-colors"
                >
                    {isCopied ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardDocumentCheckIcon className="w-5 h-5" />}
                    {isCopied ? 'Copied!' : 'Copy Brief'}
                </button>
            </div>
            <div className="p-6 space-y-8">
                {/* Meta Info */}
                <section>
                    <h3 className="text-xl font-semibold text-indigo-400 mb-4">Meta Information</h3>
                    <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                        <p><strong>Suggested Title:</strong> <span className="block text-slate-300">{brief.suggestedTitle}</span></p>
                        <p><strong>Suggested Meta Description:</strong> <span className="block text-slate-300">{brief.suggestedMetaDescription}</span></p>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                             <div className="text-center bg-slate-900/50 p-3 rounded-lg"><p className="text-xs text-slate-400">Target Word Count</p><p className="text-xl font-bold text-slate-100">~{brief.targetWordCount}</p></div>
                             <div className="text-center bg-slate-900/50 p-3 rounded-lg"><p className="text-xs text-slate-400">Readability</p><p className="text-xl font-bold text-slate-100">Grade {brief.targetReadabilityGrade}</p></div>
                        </div>
                    </div>
                </section>

                 <section>
                    <h3 className="text-xl font-semibold text-indigo-400 mb-4">Strategic Insights</h3>
                    <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
                        <div>
                            <p className="font-semibold text-slate-200">Competitor Tone of Voice</p>
                            <p className="text-slate-300">{brief.toneOfVoice}</p>
                        </div>
                         <div className="border-t border-slate-700/50 pt-4">
                            <p className="font-semibold text-slate-200 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-400" /> Suggested Unique Angle</p>
                            <p className="text-slate-300">{brief.uniqueAngleSuggestion}</p>
                        </div>
                    </div>
                </section>
                
                {/* Outline */}
                <section>
                    <h3 className="text-xl font-semibold text-indigo-400 mb-4">Content Outline</h3>
                    <div className="space-y-4">
                        {brief.outline.map((item, index) => (
                            <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                                <h4 className="font-bold text-slate-200 text-lg">H2: {item.title}</h4>
                                {item.subheadings.length > 0 && (
                                    <ul className="list-disc list-inside pl-2 mt-2 space-y-1 text-slate-400">
                                        {item.subheadings.map((sub, sIndex) => <li key={sIndex}><span className="font-semibold text-slate-300">H3:</span> {sub}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Questions & Keywords */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                        <h3 className="text-xl font-semibold text-indigo-400 mb-4">Questions to Answer</h3>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                            <ul className="list-disc list-inside space-y-2 text-slate-300">
                                {brief.questionsToAnswer.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </div>
                    </section>
                    <section>
                        <h3 className="text-xl font-semibold text-indigo-400 mb-4">Semantic Keywords</h3>
                        <div className="bg-slate-800/50 p-4 rounded-lg flex flex-wrap gap-2">
                             {brief.semanticKeywords.map((kw, i) => (
                                <span key={i} className="px-2 py-1 text-sm bg-slate-700 text-slate-300 rounded-md font-mono">{kw}</span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const ContentBriefGeneratorPage: React.FC<ContentBriefGeneratorPageProps> = ({ onGenerate, isLoading, error, brief }) => {
    const [topic, setTopic] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onGenerate(topic.trim());
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-100">AI Content Brief Generator</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Generate a comprehensive, SEO-focused content brief for any topic to guide your writing process.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mb-8 max-w-2xl mx-auto">
                <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic, e.g., 'The Future of Renewable Energy'"
                        className="w-full flex-1 bg-transparent p-3 text-lg text-slate-200 placeholder-slate-500 focus:outline-none"
                        disabled={isLoading}
                        aria-label="Content Topic"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !topic.trim()}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Generating...' : 'Create Brief'}
                    </button>
                </div>
            </form>

            {isLoading && (
                 <div className="text-center mt-8 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mb-4"></div>
                    <p className="text-lg text-slate-300">Building your brief...</p>
                </div>
            )}
            
            {error && (
                <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-2xl mx-auto text-center">
                    {error}
                </div>
            )}
            
            {!isLoading && !error && !brief && (
                <div className="text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-xl">
                    <ClipboardDocumentCheckIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-200">Ready to build?</h2>
                    <p className="text-slate-400 mt-2">Enter a topic above to generate a detailed content brief.</p>
                </div>
            )}

            {!isLoading && brief && <BriefResult brief={brief} />}

        </div>
    );
};

export default ContentBriefGeneratorPage;