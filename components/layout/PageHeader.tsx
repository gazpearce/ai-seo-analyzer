import React from 'react';
import type { Project } from '../../types';
import { ChevronUpDownIcon, SparklesIcon } from '../icons/Icons';

interface PageHeaderProps {
    projects: Project[];
    selectedProjectUrl: string | null;
    setSelectedProjectUrl: (url: string) => void;
    onOpenCommandBar: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ projects, selectedProjectUrl, setSelectedProjectUrl, onOpenCommandBar }) => {
    return (
        <header className="flex-shrink-0 bg-slate-900/70 backdrop-blur-sm border-b border-slate-800 px-6 py-3">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <button 
                        onClick={onOpenCommandBar}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700/80 transition-colors"
                        title="Open AI Command Bar"
                    >
                        <SparklesIcon className="w-5 h-5 text-indigo-400" />
                        <span className="hidden md:inline">AI Command...</span>
                    </button>
                </div>
                <div>
                    <label htmlFor="project-switcher" className="sr-only">Select a project</label>
                    <div className="relative">
                        <select
                            id="project-switcher"
                            value={selectedProjectUrl || ''}
                            onChange={(e) => setSelectedProjectUrl(e.target.value)}
                            className="appearance-none w-full md:w-72 bg-slate-800 border border-slate-700 text-white text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {projects.length > 0 ? (
                                projects.map(p => (
                                    <option key={p.url} value={p.url}>{p.name}</option>
                                ))
                            ) : (
                                <option disabled>No projects found</option>
                            )}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <ChevronUpDownIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PageHeader;