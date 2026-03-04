"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T extends { _id?: string }>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-white/20">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-3 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-3 py-3 text-right text-xs font-semibold text-white/90 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 py-6 text-center text-white/80 text-sm font-medium"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item._id || rowIndex}
                  className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-3 py-3 text-sm text-white/90 break-words max-w-[150px] font-medium">
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500 hover:text-white transition-all duration-200 font-medium text-xs mr-1"
                          title="View"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500 hover:text-white transition-all duration-200 font-medium text-xs mr-1"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500 hover:text-white transition-all duration-200 font-medium text-xs"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/20">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-white/90 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors font-medium"
          >
            <ChevronLeft className="w-3 h-3" />
            Previous
          </button>
          <span className="text-white/80 text-xs font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-white/90 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors font-medium"
          >
            Next
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}