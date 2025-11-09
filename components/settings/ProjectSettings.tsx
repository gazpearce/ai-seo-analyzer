import React, { useState } from 'react';
import type { Project } from '../../types';
import { DocumentDuplicateIcon, PencilSquareIcon, TrashIcon } from '../icons/Icons';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/Table';

interface ProjectSettingsProps {
    projects: Project[];
    onAddProject: (name: string, url: string) => void;
    onUpdateProject: (originalUrl: string, newName: string) => void;
    onDeleteProject: (url: string) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projects, onAddProject, onUpdateProject, onDeleteProject }) => {
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectUrl, setNewProjectUrl] = useState('');
    const [editingUrl, setEditingUrl] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim() || !newProjectUrl.trim()) {
            setError("Both project name and URL are required.");
            return;
        }
         try {
            new URL(newProjectUrl);
        } catch (_) {
            setError("Please enter a valid URL.");
            return;
        }
        setError(null);
        onAddProject(newProjectName, newProjectUrl);
        setNewProjectName('');
        setNewProjectUrl('');
    };

    const handleStartEdit = (project: Project) => {
        setEditingUrl(project.url);
        setEditingName(project.name);
    };

    const handleCancelEdit = () => {
        setEditingUrl(null);
        setEditingName('');
    };
    
    const handleSaveEdit = () => {
        if (editingUrl && editingName.trim()) {
            onUpdateProject(editingUrl, editingName.trim());
            handleCancelEdit();
        }
    };
    
    const handleDeleteProject = (url: string) => {
        if (window.confirm("Are you sure you want to delete this project and all its associated history? This action cannot be undone.")) {
            onDeleteProject(url);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-100">Manage Projects</h2>
                <p className="text-slate-400 text-sm mt-1">Projects help you organize your SEO analyses by website.</p>
            </div>
            
            <form onSubmit={handleAddProject} className="space-y-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="font-medium text-slate-200">Add New Project</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Project Name (e.g., My Company Blog)"
                        className="w-full bg-slate-800 p-2 text-md text-slate-200 placeholder-slate-500 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                        type="url"
                        value={newProjectUrl}
                        onChange={(e) => setNewProjectUrl(e.target.value)}
                        placeholder="Primary URL (e.g., https://example.com)"
                        className="w-full md:col-span-2 bg-slate-800 p-2 text-md text-slate-200 placeholder-slate-500 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                 {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="text-right">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 text-sm">
                        Add Project
                    </button>
                </div>
            </form>

            <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell as="th">Project Name</TableCell>
                            <TableCell as="th">Primary URL</TableCell>
                            <TableCell as="th" className="text-right">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((p) => (
                            <TableRow key={p.url}>
                                <TableCell>
                                    {editingUrl === p.url ? (
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="bg-slate-700 p-1 rounded-md text-slate-100"
                                            autoFocus
                                        />
                                    ) : (
                                        p.name
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-sm">{p.url}</TableCell>
                                <TableCell className="text-right">
                                    {editingUrl === p.url ? (
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300">Save</button>
                                            <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-300">Cancel</button>
                                        </div>
                                    ) : (
                                         <div className="flex justify-end items-center gap-4">
                                            <button onClick={() => handleStartEdit(p)} className="text-slate-400 hover:text-indigo-400" title="Edit">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteProject(p.url)} className="text-slate-400 hover:text-red-400" title="Delete">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {projects.length === 0 && <p className="text-center py-8 text-slate-500">No projects created yet.</p>}
            </div>
        </div>
    );
};

export default ProjectSettings;
