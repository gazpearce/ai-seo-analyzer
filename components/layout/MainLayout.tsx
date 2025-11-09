import React from 'react';
import type { Page } from '../../App';
import LeftNav from './LeftNav';
import PageHeader from './PageHeader';
import type { Project } from '../../types';

interface MainLayoutProps {
    children: React.ReactNode;
    page: Page;
    setPage: (page: Page) => void;
    projects: Project[];
    selectedProjectUrl: string | null;
    setSelectedProjectUrl: (url: string) => void;
    onOpenCommandBar: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, page, setPage, projects, selectedProjectUrl, setSelectedProjectUrl, onOpenCommandBar }) => {
    return (
        <div className="min-h-screen w-full flex bg-slate-950">
            <LeftNav page={page} setPage={setPage} />
            <div className="flex-1 flex flex-col">
                <PageHeader 
                    projects={projects} 
                    selectedProjectUrl={selectedProjectUrl} 
                    setSelectedProjectUrl={setSelectedProjectUrl} 
                    onOpenCommandBar={onOpenCommandBar}
                />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;