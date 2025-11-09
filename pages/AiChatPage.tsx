
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, HistoricalAnalysis, ProjectFile } from '../types';
import { ai } from '../services/geminiService';
import { SparklesIcon, TrashIcon, FolderPlusIcon, XCircleIcon, DocumentDuplicateIcon, CheckCircleIcon } from '../components/icons/Icons';

interface AiChatPageProps {
  projectName: string;
  projectUrl: string | null;
  projectHistory: HistoricalAnalysis[];
  persistedHistory: ChatMessage[];
  onAddChatMessage: (projectUrl: string, userMessage: ChatMessage, modelResponse: ChatMessage) => void;
  onClearHistory: () => void;
}

const MAX_CONTEXT_SIZE_MB = 2;
const MAX_CONTEXT_SIZE_BYTES = MAX_CONTEXT_SIZE_MB * 1024 * 1024;
const SUPPORTED_FILE_TYPES = [
    '.tsx', '.ts', '.js', '.jsx', '.json', '.html', '.css', '.scss', '.md', '.txt', 'Dockerfile', '.py', '.rb', '.java', '.php', '.go', '.rs'
];

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleClick = () => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    return (
        <button onClick={handleClick} className={`copy-button ${isCopied ? 'copy-button-copied' : ''}`}>
            {isCopied ? 'Copied!' : 'Copy'}
        </button>
    );
};


const AiChatPage: React.FC<AiChatPageProps> = ({ projectName, projectUrl, projectHistory, persistedHistory, onAddChatMessage, onClearHistory }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(persistedHistory);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
    const [contextSize, setContextSize] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMessages(persistedHistory);
    }, [persistedHistory, projectUrl]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const loadedFiles: ProjectFile[] = [];
        let totalSize = 0;

        for (const file of Array.from(files)) {
            const isSupported = SUPPORTED_FILE_TYPES.some(ext => file.name.endsWith(ext));
            if (!isSupported) continue;

            if (totalSize + file.size > MAX_CONTEXT_SIZE_BYTES) {
                alert(`Cannot load more files. Total context size cannot exceed ${MAX_CONTEXT_SIZE_MB}MB.`);
                break;
            }

            try {
                const content = await file.text();
                loadedFiles.push({
                    // @ts-ignore - webkitRelativePath is a non-standard property but works in Chrome/Edge/Safari for folder uploads
                    path: file.webkitRelativePath || file.name,
                    content,
                });
                totalSize += file.size;
            } catch (error) {
                console.warn(`Could not read file ${file.name}:`, error);
            }
        }
        setProjectFiles(loadedFiles);
        setContextSize(totalSize);
    };

    const clearProjectContext = () => {
        setProjectFiles([]);
        setContextSize(0);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !projectUrl) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const latestAnalysis = projectHistory.length > 0 ? projectHistory[projectHistory.length - 1].analysis : null;
            const lowestScoreFactor = latestAnalysis ? (Object.keys(latestAnalysis) as (keyof typeof latestAnalysis)[])
                .filter(k => latestAnalysis[k] && typeof latestAnalysis[k].score === 'number')
                .sort((a, b) => latestAnalysis[a].score - latestAnalysis[b].score)[0] : null;

            let systemInstruction = `You are an expert AI software developer and SEO analyst integrated into a tool called RankLens. Your name is LensAI.
            - You are FORBIDDEN from saying you "cannot see" or "don't have access to" the user's project. You have been provided with the file context. Use it.
            - You MUST answer questions based on the provided project file context and SEO analysis data.
            - Keep your answers concise, actionable, and formatted in clear Markdown. Use markdown for lists, bolding, and especially for code blocks (e.g., \`\`\`tsx ... \`\`\`).`;

            let analysisContext = "No SEO analysis has been run for this project yet. Guide the user to run a 'Site Audit' first to get data-driven advice.";
            if (latestAnalysis && lowestScoreFactor) {
                analysisContext = `An SEO analysis has been run for ${projectName}.
                - Overall Score: ${latestAnalysis.overall.score}/100.
                - Summary: ${latestAnalysis.overall.summary}.
                - The area needing most improvement is '${lowestScoreFactor}' with a score of ${latestAnalysis[lowestScoreFactor].score}.
                Use this SEO data to inform your answers about project improvements.`;
            }
            
            let fileContext = "";
            if (projectFiles.length > 0) {
                fileContext = "The user has provided the following project files for context:\n\n";
                fileContext += projectFiles.map(f => `--- START OF FILE: ${f.path} ---\n${f.content}\n--- END OF FILE: ${f.path} ---\n`).join('\n');
            } else {
                fileContext = "The user has not uploaded any project files. Base your answers on the SEO analysis data and general knowledge. If the question is about code, ask them to upload their project folder using the 'Upload Folder' button."
            }

            const fullPrompt = `${analysisContext}\n\n${fileContext}\n\nUser question: ${input}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            const modelResponse: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
            setMessages(prev => [...prev, modelResponse]);
            onAddChatMessage(projectUrl, userMessage, modelResponse);

        } catch (error: any) {
            console.error(error);
            const errorResponse: ChatMessage = { role: 'model', parts: [{ text: `Sorry, there was an error: ${error.message}` }] };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Simple markdown to HTML for code blocks
    const processMessageContent = (text: string) => {
        // Escape HTML to prevent injection, except for what we're about to add
        const escapeHtml = (unsafe: string) => 
            unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        // Process code blocks
        const processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const escapedCode = escapeHtml(code);
            const copyButtonId = `copy-btn-${Math.random().toString(36).substr(2, 9)}`;
            return `<pre class="language-${lang || ''}"><code class="language-${lang || ''}">${escapedCode}</code><button id="${copyButtonId}" class="copy-button">Copy</button></pre>`;
        });
        
        // Process bold and lists after code blocks
        return processedText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/^\s*[-*]\s(.*)/gm, '<li>$1</li>') // List items
            .replace(/(\<li\>.*\<\/li\>)+/gs, '<ul>$&</ul>') // Wrap lists in <ul>
            .replace(/\n/g, '<br />') // Newlines
            .replace(/<br \/><ul>/g, '<ul>') // Fix space before lists
            .replace(/<\/ul><br \/>/g, '</ul>');
    };
    
    // Effect to add event listeners to copy buttons after render
    useEffect(() => {
        messages.forEach(msg => {
            const matches = msg.parts[0].text.matchAll(/```(\w*)\n([\s\S]*?)```/g);
            for (const match of matches) {
                const code = match[2];
                document.querySelectorAll('.copy-button').forEach(button => {
                    if (!button.hasAttribute('data-listener-added')) {
                         button.addEventListener('click', () => {
                            navigator.clipboard.writeText(code);
                            button.textContent = 'Copied!';
                            button.classList.add('copy-button-copied');
                            setTimeout(() => {
                                button.textContent = 'Copy';
                                button.classList.remove('copy-button-copied');
                            }, 2000);
                        });
                        button.setAttribute('data-listener-added', 'true');
                    }
                });
            }
        });
    }, [messages]);


    const renderMessage = (message: ChatMessage, index: number) => (
        <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-4 rounded-2xl ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: processMessageContent(message.parts[0].text) }}></div>
            </div>
        </div>
    );
    
    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in flex gap-6 h-[calc(100vh-100px)]">
            {/* Project Context Sidebar */}
            <div className="w-1/4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                <h2 className="text-lg font-semibold text-slate-100 mb-2">Project Context</h2>
                <p className="text-xs text-slate-400 mb-4">Upload your project folder to give the AI full context of your codebase for more accurate answers.</p>
                <input 
                    type="file" 
                    // @ts-ignore
                    webkitdirectory="true" 
                    directory="true"
                    ref={fileInputRef}
                    onChange={handleFolderUpload} 
                    className="hidden" 
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 transition-colors"
                >
                    <FolderPlusIcon className="w-5 h-5" />
                    Upload Folder
                </button>
                {projectFiles.length > 0 && (
                    <>
                        <div className="mt-4 border-t border-slate-700 pt-4 flex-1 overflow-y-auto">
                            <h3 className="text-sm font-semibold text-slate-300 mb-2">Loaded Files ({projectFiles.length})</h3>
                            <ul className="space-y-1 text-xs text-slate-400">
                                {projectFiles.map(file => (
                                    <li key={file.path} title={file.path} className="truncate">
                                        📄 {file.path.split('/').pop()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4 border-t border-slate-700 pt-4">
                            <p className="text-xs text-slate-500 mb-2">Context Size: {(contextSize / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                                onClick={clearProjectContext}
                                className="w-full flex items-center justify-center gap-2 px-3 py-1 text-xs font-medium text-red-300 bg-red-900/40 border border-red-800 rounded-md hover:bg-red-900/60 transition-colors"
                            >
                                <XCircleIcon className="w-4 h-4" />
                                Clear Context
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="w-3/4 flex flex-col bg-slate-900 border border-slate-800 rounded-xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">AI Chat</h1>
                        <p className="text-slate-400 text-sm">Project: {projectName}</p>
                    </div>
                    {messages.length > 0 && (
                        <button
                            onClick={onClearHistory}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-900/50 border border-red-800 rounded-md hover:bg-red-900 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Clear Chat
                        </button>
                    )}
                </div>

                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {messages.map(renderMessage)}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="p-4 rounded-2xl bg-slate-700">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                                    <span>LensAI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef}></div>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your project..."
                            className="w-full bg-slate-800 p-3 text-base text-slate-200 placeholder-slate-500 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                           <SparklesIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AiChatPage;
