import React, { useState } from 'react';
import {
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  CheckCircle2,
  HardDrive,
  Zap,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { UploadTask } from '../types';

interface FloatingUploadDrawerProps {
  tasks: UploadTask[];
  onPauseTask: (id: string) => void;
  onResumeTask: (id: string) => void;
  onCancelTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const FloatingUploadDrawer: React.FC<FloatingUploadDrawerProps> = ({
  tasks,
  onPauseTask,
  onResumeTask,
  onCancelTask,
  onClearCompleted,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (tasks.length === 0) return null;

  const activeTasks = tasks.filter((t) => t.status === 'uploading' || t.status === 'queued' || t.status === 'paused');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-[#111827] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs backdrop-blur-xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 via-gray-900 to-[#111827] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute inset-0"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block relative"></span>
          </div>
          <span className="font-extrabold uppercase tracking-wider text-white">
            Upload Queue ({activeTasks.length} Active)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {completedTasks.length > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-[10px] text-gray-400 hover:text-cyan-400 underline"
            >
              Clear Finished
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto p-3 space-y-3 divide-y divide-gray-800/60">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            const isPaused = task.status === 'paused';

            return (
              <div key={task.id} className="pt-2 first:pt-0 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Upload className={`w-3.5 h-3.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-cyan-400 animate-pulse'}`} />
                    <span className="truncate font-sans font-semibold text-gray-200">
                      {task.fileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!isDone && (
                      <button
                        onClick={() =>
                          isPaused ? onResumeTask(task.id) : onPauseTask(task.id)
                        }
                        className="p-1 text-gray-400 hover:text-cyan-400 rounded hover:bg-gray-800 cursor-pointer"
                        title={isPaused ? 'Resume' : 'Pause'}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    <button
                      onClick={() => onCancelTask(task.id)}
                      className="p-1 text-gray-400 hover:text-rose-400 rounded hover:bg-gray-800 cursor-pointer"
                      title="Cancel/Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-indigo-400" />
                      Target: <strong className="text-gray-300">{task.targetDriveEmail}</strong>
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {task.progressPercentage}% ({task.uploadSpeedMbps.toFixed(1)} MB/s)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500'
                          : isPaused
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                      }`}
                      style={{ width: `${task.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
