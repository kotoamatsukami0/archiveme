"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Loader2, X, UploadCloud } from "lucide-react";
import { UploadTask } from "@/types";
import { formatBytes } from "@/lib/utils";

interface UploadProgressProps {
  tasks: UploadTask[];
  onDismiss: () => void;
  onCancelTask?: (taskId: string) => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  tasks,
  onDismiss,
}) => {
  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const isAllDone = completedCount === tasks.length;
  const hasErrors = tasks.some((t) => t.status === "error");

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-[calc(100%-2rem)] sm:w-88 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3.5 animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800">
            {isAllDone
              ? `All uploads complete (${completedCount})`
              : `Uploading ${completedCount}/${tasks.length}...`}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Task List */}
      <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
        {tasks.map((task) => (
          <div key={task.id} className="text-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-medium text-slate-700 truncate flex-1">
                {task.name}
              </span>
              <span className="text-[10px] text-slate-400 flex-shrink-0">
                {formatBytes(task.size)}
              </span>
            </div>

            {/* Progress bar container */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 rounded-full ${
                    task.status === "error"
                      ? "bg-rose-500"
                      : task.status === "completed"
                      ? "bg-emerald-500"
                      : "bg-indigo-600"
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {task.status === "uploading" && (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                )}
                {task.status === "completed" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {task.status === "error" && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
              </div>
            </div>

            {task.error && (
              <p className="text-[10px] text-rose-500 mt-0.5">{task.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
