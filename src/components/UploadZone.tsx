import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CloudUpload, X, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import type { UploadTask } from '../types';

import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface UploadZoneProps {
  uploadTasks: UploadTask[];
  onFilesSelected: (files: FileList) => void;
  accounts: { email: string }[];
  lang?: Language;
}

export function UploadZone({ uploadTasks, onFilesSelected, accounts, lang = 'id' }: UploadZoneProps) {
  const t = translations[lang];
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) onFilesSelected(e.dataTransfer.files);
  };

  const activeTasks  = uploadTasks.filter(t => t.status === 'uploading' || t.status === 'queued');
  const doneTasks    = uploadTasks.filter(t => t.status === 'completed');
  const failedTasks  = uploadTasks.filter(t => t.status === 'error');

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto">
      {/* Dropzone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          scale: isDragging ? 1.01 : 1,
          borderColor: isDragging ? 'rgba(6,182,212,0.8)' : 'rgba(99,102,241,0.35)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`relative rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-4 py-12 px-6 text-center ${
          isDragging ? 'dropzone-active' : 'dropzone-idle'
        }`}
      >
        {/* Pulsing outer ring */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none ${isDragging ? 'pulse-ring' : ''}`} />

        <motion.div
          animate={{ y: isDragging ? -8 : 0, scale: isDragging ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isDragging
              ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/25'
              : 'bg-slate-800/60 border border-slate-700/50'
          }`}
        >
          <CloudUpload className={`w-7 h-7 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
        </motion.div>

        <div>
          <p className={`text-sm font-semibold ${isDragging ? 'text-cyan-300' : 'text-slate-300'}`}>
            {isDragging ? (lang === 'en' ? 'Release to upload' : 'Lepaskan untuk mengunggah') : t.dropFilesHere}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            <span className="text-cyan-500 hover:text-cyan-400">{t.clickToBrowse}</span> · {t.anyFileType}
          </p>
        </div>

        {accounts.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-800/40 rounded-full px-3 py-1.5">
            <Zap className="w-3 h-3 text-cyan-600" />
            {t.routingTo}: <span className="text-cyan-500 font-medium">{accounts[0]?.email}</span>
          </div>
        )}

        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => e.target.files && onFilesSelected(e.target.files)} />
      </motion.div>

      {/* Upload Queue */}
      <AnimatePresence>
        {uploadTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-surface rounded-2xl border border-slate-700/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">{t.uploadQueue}</span>
              </div>
              <div className="flex gap-2 text-[11px]">
                {activeTasks.length > 0  && <span className="text-cyan-400">{activeTasks.length} active</span>}
                {doneTasks.length > 0    && <span className="text-emerald-400">{doneTasks.length} done</span>}
                {failedTasks.length > 0  && <span className="text-rose-400">{failedTasks.length} failed</span>}
              </div>
            </div>

            {/* Task List */}
            <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
              <AnimatePresence>
                {uploadTasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-slate-300 truncate max-w-[200px]">{task.fileName}</p>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {task.status === 'uploading' && (
                          <>
                            <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                            <span className="text-[11px] text-cyan-400">{task.uploadSpeedMbps} Mb/s</span>
                          </>
                        )}
                        {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {task.status === 'error'     && <AlertCircle  className="w-3.5 h-3.5 text-rose-400" />}
                        {task.status === 'queued'    && <span className="text-[11px] text-slate-500">Queued</span>}
                      </div>
                    </div>
                    {(task.status === 'uploading' || task.status === 'queued') && (
                      <div className="progress-track h-1">
                        <motion.div
                          className="progress-fill h-full shimmer-bg"
                          animate={{ width: `${task.progressPercentage}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                      <span>{task.formattedSize}</span>
                      {task.status === 'uploading' && <span>{task.progressPercentage}%</span>}
                      {task.status === 'completed' && <span className="text-emerald-500">Saved to Drive</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
