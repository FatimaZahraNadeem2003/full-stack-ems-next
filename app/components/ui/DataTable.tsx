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
                  className="px-3 py-3 text-left text-xs font-bold text-white/90 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-3 py-3 text-right text-xs font-bold text-white/90 uppercase tracking-wider">
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
                  className="px-3 py-6 text-center text-white/80 text-sm font-bold"
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
                    <td key={colIndex} className="px-3 py-3 text-sm text-white/90 break-words max-w-[150px] font-semibold">
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {onView && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onView(item);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-bold text-xs mr-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          VIEW
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 font-bold text-xs mr-2"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          EDIT
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-bold text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          DELETE
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white/90 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors font-bold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            PREVIOUS
          </button>
          <span className="text-white/80 text-xs font-bold">
            PAGE {currentPage} OF {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white/90 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors font-bold"
          >
            NEXT
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}