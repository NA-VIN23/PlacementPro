import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface Column<T> {
    header: string;
    accessor: (row: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

interface PaginatedTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    emptyMessage?: string;
    rowClassName?: (row: T) => string;
}

export const PaginatedTable = <T extends { id?: string | number }>({
    columns,
    data,
    loading = false,
    pageSizeOptions = [10, 50, 100],
    defaultPageSize = 10,
    emptyMessage = "No records found.",
    rowClassName
}: PaginatedTableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Reset to page 1 if data length changes significantly or filter changes
    // implying a new dataset. However, strictly depending on data length might be buggy
    // if length stays same but content changes. For now, we trust the user to manage
    // their search/filter state outside, effectively passing specific data here.
    // We can reset page if data reference changes?
    React.useEffect(() => {
        setCurrentPage(1);
    }, [data.length]); // Simple heuristic: if data count changes, reset to page 1.

    const totalPages = Math.ceil(data.length / pageSize);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse">
                <div className="text-slate-400 font-medium">Loading data...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {/* Scrollable Table Container */}
            <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left relative border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        "px-6 py-4 text-xs font-bold uppercase tracking-wider bg-slate-50",
                                        col.headerClassName
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className={cn(
                                        "hover:bg-slate-50/80 transition-colors group",
                                        rowClassName?.(row)
                                    )}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={cn("px-6 py-4 text-sm text-slate-600", col.className)}>
                                            {col.accessor(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">

                {/* Left: Info & Page Size */}
                <div className="flex items-center gap-4">
                    <span className="font-medium text-slate-600">
                        Showing {data.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} – {Math.min(currentPage * pageSize, data.length)} of {data.length}
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Rows:</span>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Right: Navigation */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="First Page"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Previous Page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                        {currentPage} / {totalPages || 1}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Next Page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Last Page"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
