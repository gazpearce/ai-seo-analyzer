import React from 'react';
import type { SeoAnalysis } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableCell } from './ui/Table';
import { IdentificationIcon } from './icons/Icons';

interface ImageSeoDetailsProps {
  data: SeoAnalysis['imageSeo'];
}

const ImageSeoDetails: React.FC<ImageSeoDetailsProps> = ({ data }) => {
  if (!data) return null;

  return (
    <section>
      <div className="border-b border-slate-700 pb-2 mb-6 flex items-center gap-3">
        <IdentificationIcon className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-slate-200">Image SEO & Alt Text</h2>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
        <div>
            <p className="font-semibold text-slate-200">Overall Feedback</p>
            <p className="text-sm text-slate-400 mt-1">{data.feedback}</p>
        </div>

        {data.images_missing_alt_details && data.images_missing_alt_details.length > 0 ? (
            <div>
                <h3 className="font-semibold text-slate-200 mb-2">AI-Generated Alt Text Suggestions ({data.images_missing_alt})</h3>
                <div className="overflow-x-auto border border-slate-700 rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell as="th" className="w-1/3">Image Preview</TableCell>
                                <TableCell as="th" className="w-2/3">AI Suggested Alt Text</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.images_missing_alt_details.map((image, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <img 
                                            src={image.src} 
                                            alt="Missing alt text preview" 
                                            className="w-32 h-20 object-cover rounded-md bg-slate-700" 
                                            loading="lazy"
                                        />
                                        <p className="text-xs text-slate-500 font-mono truncate mt-1" title={image.src}>{image.src}</p>
                                    </TableCell>
                                    <TableCell className="text-slate-300 italic">
                                        "{image.suggested_alt}"
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        ) : (
            <div className="text-center py-8">
                <p className="text-slate-400">Great job! No images were found to be missing alt text.</p>
            </div>
        )}
      </div>
    </section>
  );
};

export default ImageSeoDetails;