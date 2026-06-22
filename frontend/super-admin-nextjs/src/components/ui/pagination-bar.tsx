"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationBarProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function PaginationBar({ page, totalPages, total, pageSize, onPageChange }: PaginationBarProps) {
  const from = total > 0 ? Math.min((page - 1) * pageSize + 1, total) : 0
  const to = Math.min(page * pageSize, total)

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | "...")[] = [1]
    if (page > 3) pages.push("...")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  if (total === 0) return null

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
      <span className="text-xs text-slate-400 font-medium">
        Hiển thị{" "}
        <span className="font-bold text-slate-600">{from}–{to}</span>
        {" "}/ <span className="font-bold text-slate-600">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="text-xs text-slate-400 px-1 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "h-7 min-w-[28px] px-2 rounded-lg text-xs font-bold transition-colors",
                page === p
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-red-600 hover:bg-red-50"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
