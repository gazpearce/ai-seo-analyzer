import React, { useState } from 'react';
import type { Settings } from '../types';
import ProjectSettings from '../components/settings/ProjectSettings';
import ErrorLog from '../components/settings/ErrorLog';
import KnowledgeSettings from '../components/settings/KnowledgeSettings';

interface SettingsPageProps {
    settings: Settings;
    onAddProject: (name: string, url: string) => void;
    onUpdateProject: (originalUrl: string, newName: string) => void;
    onDeleteProject: (url: string) => void;
    onClearErrorLog: () => void;
    onSetUseSearchGrounding: (value: boolean) => void;
}

type Tab = 'projects' | 'knowledge' | 'error_log';

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('projects');

    const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabId
                    ? 'bg-slate-700/80 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
                <p className="text-slate-400">Manage your projects, knowledge base, and application diagnostics.</p>
            </div>

            <div className="flex items-center border-b border-slate-700 space-x-2">
                <TabButton tabId="projects">Projects</TabButton>
                <TabButton tabId="knowledge">Knowledge Base</TabButton>
                <TabButton tabId="error_log">Error Log</TabButton>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[400px]">
                {activeTab === 'projects' && (
                    <ProjectSettings
                        projects={props.settings.projects}
                        onAddProject={props.onAddProject}
                        onUpdateProject={props.onUpdateProject}
                        onDeleteProject={props.onDeleteProject}
                    />
                )}
                 {activeTab === 'knowledge' && (
                    <KnowledgeSettings
                        useSearchGrounding={props.settings.useSearchGrounding}
                        onSetUseSearchGrounding={props.onSetUseSearchGrounding}
                    />
                )}
                {activeTab === 'error_log' && (
                    <ErrorLog
                        errorLog={props.settings.errorLog}
                        onClearErrorLog={props.onClearErrorLog}
                    />
                )}
            </div>
        </div>
    );
};

export default SettingsPage;