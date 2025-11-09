import React from 'react';
import type { Page } from '../../App';
import { 
    SparklesIcon, 
    HomeIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
    KeyIcon,
    PencilSquareIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    Cog6ToothIcon,
    ClipboardDocumentListIcon,
    ClipboardDocumentCheckIcon,
    LinkIcon
} from '../icons/Icons';

interface LeftNavProps {
    page: Page;
    setPage: (page: Page) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'site_audit', label: 'Site Audit', icon: MagnifyingGlassIcon },
    { id: 'reports', label: 'Reports', icon: TableCellsIcon },
    { id: 'backlinks', label: 'Backlinks', icon: LinkIcon },
    { id: 'methodology', label: 'Ranking Factors', icon: ClipboardDocumentListIcon },
    { id: 'keyword_explorer', label: 'Keyword Explorer', icon: KeyIcon },
    { id: 'content_brief_generator', label: 'Content Briefs', icon: ClipboardDocumentCheckIcon },
    { id: 'content_editor', label: 'Content Editor', icon: PencilSquareIcon },
    { id: 'ai_chat', label: 'AI Chat', icon: ChatBubbleOvalLeftEllipsisIcon },
];

const NavLink: React.FC<{
    item: typeof navItems[0];
    isActive: boolean;
    onClick: () => void;
}> = ({ item, isActive, onClick }) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150";
    const activeClasses = "bg-slate-700/50 text-white";
    const inactiveClasses = "text-slate-400 hover:text-white hover:bg-slate-800/60";
    const Icon = item.icon;

    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onClick();
                }}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                aria-current={isActive ? 'page' : undefined}
            >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
            </a>
        </li>
    );
};

const LeftNav: React.FC<LeftNavProps> = ({ page, setPage }) => {
    return (
        <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
            <div className="flex items-center gap-2 px-2 mb-6">
                <SparklesIcon className="w-7 h-7 text-indigo-400" />
                <span className="font-bold text-xl text-white">RankLens</span>
            </div>
            <ul className="space-y-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.id}
                        item={item}
                        isActive={page === item.id}
                        onClick={() => setPage(item.id as Page)}
                    />
                ))}
            </ul>
             <div className="mt-auto">
                <ul>
                     <NavLink
                        item={{ id: 'settings', label: 'Settings', icon: Cog6ToothIcon }}
                        isActive={page === 'settings'}
                        onClick={() => setPage('settings')}
                    />
                </ul>
            </div>
        </nav>
    );
};

export default LeftNav;