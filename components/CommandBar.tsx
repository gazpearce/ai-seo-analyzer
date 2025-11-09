import React, { useState, useEffect, useRef } from 'react';
import type { Command } from '../types';
import { SparklesIcon, XCircleIcon } from './icons/Icons';

interface CommandBarProps {
    isOpen: boolean;
    onClose: () => void;
    onCommand: (command: Command) => void;
    parseCommand: (commandText: string) => Promise<Command>;
}

const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, onCommand, parseCommand }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            setInputValue('');
            setError(null);
            // Focus input with a small delay to ensure it's rendered
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);
    
    // Keyboard listener for closing
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        try {
            const command = await parseCommand(inputValue);
            if (command.action === 'unknown') {
                setError("Sorry, I didn't understand that command. Please try phrasing it differently (e.g., 'audit example.com for best phones').");
            } else {
                onCommand(command);
            }
        } catch (err) {
            console.error(err);
            setError('There was an error processing your command. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-fade-in-down"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center p-2 border-b border-slate-800">
                        <SparklesIcon className="w-6 h-6 text-indigo-400 mx-3 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Tell me what to do... e.g., 'audit example.com for best laptops'"
                            className="w-full bg-transparent p-2 text-lg text-slate-200 placeholder-slate-500 focus:outline-none"
                            disabled={isLoading}
                        />
                         {isLoading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400 mx-3"></div>
                        )}
                    </div>
                </form>
                <div className="p-4 text-sm text-slate-500">
                    {error ? (
                        <div className="flex items-start gap-2 text-red-400">
                            <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                            <span>{error}</span>
                        </div>
                    ) : (
                         <p>
                            Try things like: <strong className="text-slate-400">audit</strong>, <strong className="text-slate-400">keywords</strong>, or <strong className="text-slate-400">backlinks</strong>.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandBar;
