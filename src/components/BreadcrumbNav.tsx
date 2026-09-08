"use client";

import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbItem } from "@/types";

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId: string | null, index: number) => void;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items, onNavigate }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center overflow-x-auto no-scrollbar py-1.5 px-0.5 text-sm"
    >
      <div className="flex items-center space-x-1 whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={item.id || "root"} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0" />
              )}
              <button
                type="button"
                onClick={() => onNavigate(item.id, index)}
                className={`flex items-center min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl transition-all font-medium text-xs sm:text-sm ${
                  isLast
                    ? "bg-slate-200/70 text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                title={item.name}
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-slate-700" />
                    <span>Home</span>
                  </span>
                ) : (
                  <span className="max-w-[130px] sm:max-w-[180px] truncate">
                    {item.name}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
