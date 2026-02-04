import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { adminService } from '../../services/api';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const downloadTemplate = () => {
        // Simple CSV template
        const headers = ['RegNo', 'RollNo', 'Name', 'Email', 'Password'];
        const example = ['8115U23IT001', 'ITA2301', 'John Doe', 'john.doe@example.com', 'InitialPass123!'];
        const lateralExample = ['8115U23IT063', 'LITA2363', 'Lateral Student', 'lateral@example.com', 'SecurePass456!'];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + example.join(",") + "\n"
            + lateralExample.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const response = await adminService.bulkImportUsers(file);
            setResult(response);
            if (response.successCount > 0) {
                // Determine if we should close or keep open to show errors
                // For now, we keep open to show the summary
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
            setResult({
                successCount: 0,
                failureCount: 1,
                errors: [{ row: '-', reason: error.response?.data?.message || 'Upload failed' }]
            });
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-brand-600" />
                        Bulk Import Students
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {!result ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 space-y-2">
                                <p className="font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Import Rules:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-1 opacity-90">
                                    <li>Only <b>Student</b> accounts will be created.</li>
                                    <li>RegNo is used as the <b>Login ID</b>.</li>
                                    <li>Duplicate RegNos will be skipped.</li>
                                    <li>Ensure valid RegNo format (e.g., 8115U23IT001).</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="block text-sm font-medium text-slate-700">1. Download Template</label>
                                <button
                                    onClick={downloadTemplate}
                                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all font-medium"
                                >
                                    <Download className="w-5 h-5" />
                                    Download CSV Template
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="block text-sm font-medium text-slate-700">2. Upload File (CSV / Excel)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".csv, .xlsx, .xls"
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'}`}
                                    >
                                        {file ? (
                                            <div className="text-center">
                                                <FileText className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                                                <p className="font-bold text-slate-800">{file.name}</p>
                                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <Upload className="w-8 h-8 mx-auto mb-2" />
                                                <p className="font-medium">Click to select file</p>
                                                <p className="text-xs">.csv, .xlsx supported</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Total Processed</p>
                                    <p className="text-2xl font-black text-slate-800">{result.totalRows}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-xl text-center">
                                    <p className="text-xs text-emerald-600 uppercase font-bold">Successfully Saved</p>
                                    <p className="text-2xl font-black text-emerald-600">{result.successCount}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl text-center">
                                    <p className="text-xs text-red-600 uppercase font-bold">Failed</p>
                                    <p className="text-2xl font-black text-red-600">{result.failureCount}</p>
                                </div>
                            </div>

                            {result.successCount > 0 && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-800 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                    All {result.successCount} successful users have been permanently saved to the database.
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">Failure Details</h4>
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 text-slate-500 font-bold sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2">Row</th>
                                                    <th className="px-4 py-2">Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {result.errors.map((err: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-red-50/50">
                                                        <td className="px-4 py-2 font-mono text-slate-600">{err.row}</td>
                                                        <td className="px-4 py-2 text-red-600">{err.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    {result ? (
                        <button
                            onClick={reset}
                            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Import More
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {uploading ? 'Processing...' : 'Start Import'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
