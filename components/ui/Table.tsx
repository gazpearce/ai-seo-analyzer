import React from 'react';

// A set of simple, reusable table components with Tailwind CSS styling

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <table className="w-full text-sm text-left text-slate-300">
        {children}
    </table>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <thead className="text-xs text-slate-400 uppercase bg-slate-900">
        {children}
    </thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tbody>
        {children}
    </tbody>
);

const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <tr className={`border-b border-slate-800 hover:bg-slate-800/50 ${className}`}>
        {children}
    </tr>
);

const TableCell: React.FC<{ children: React.ReactNode; as?: 'td' | 'th'; className?: string }> = ({ children, as = 'td', className = '' }) => {
    const Component = as;
    const baseClasses = "px-6 py-4";
    const finalClassName = `${baseClasses} ${className}`;
    
    if (as === 'th') {
        return (
            <th scope="col" className={finalClassName}>
                {children}
            </th>
        );
    }
    
    return (
        <td className={finalClassName}>
            {children}
        </td>
    );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
