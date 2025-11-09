
import React from 'react';
import { LinkIcon } from '../components/icons/Icons';

const BacklinksPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <LinkIcon className="w-16 h-16 text-indigo-400 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Backlink Analysis</h1>
            <p className="text-lg text-slate-400">This feature is currently under construction.</p>
            <p className="text-slate-500 mt-1">Soon, you'll be able to analyze your backlink profile here. Check back for updates!</p>
        </div>
    );
};

export default BacklinksPage;
