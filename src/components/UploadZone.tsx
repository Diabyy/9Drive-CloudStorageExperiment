import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CloudUpload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-4 py-12 px-6 text-center"
        style={{
          border: isDragging ? '1.5px dashed var(--accent-blue)' : '1.5px dashed rgba(255, 255, 255, 0.12)',
          background: isDragging ? 'rgba(41, 151, 255, 0.04)' : 'transparent',
          transition: 'background 0.25s, border-color 0.25s',
        }}
      >
        <motion.div
          animate={{ y: isDragging ? -6 : 0, scale: isDragging ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: isDragging ? 'rgba(41, 151, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: isDragging ? '1px solid rgba(41, 151, 255, 0.30)' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <CloudUpload
            className="w-7 h-7"
            strokeWidth={1.5}
            style={{ color: isDragging ? 'var(--accent-blue)' : 'var(--text-muted)' }}
          />
        </motion.div>

        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: isDragging ? 'var(--accent-blue)' : 'var(--text-primary)' }}
          >
            {isDragging ? (lang === 'en' ? 'Release to upload' : 'Lepaskan untuk mengunggah') : t.dropFilesHere}
          </p>
          <p className="text-xs text-[--text-secondary] mt-1">
            <span
              className="cursor-pointer transition-colors"
              style={{ color: 'var(--accent-blue)' }}
            >
              {t.clickToBrowse}
            </span>
            {' · '}{t.anyFileType}
          </p>
        </div>

        {accounts.length > 0 && (
          <div
            className="flex items-center gap-2 text-[11px] rounded-full px-3 py-1.5"
            style={{
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            {t.routingTo}: <span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{accounts[0]?.email}</span>
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
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} strokeWidth={1.5} />
                <span className="text-xs font-semibold text-[--text-primary] tracking-wide uppercase">{t.uploadQueue}</span>
              </div>
              <div className="flex gap-2 text-[11px]">
                {activeTasks.length > 0  && <span style={{ color: 'var(--accent-blue)' }}>{activeTasks.length} active</span>}
                {doneTasks.length > 0    && <span style={{ color: 'var(--accent-green)' }}>{doneTasks.length} done</span>}
                {failedTasks.length > 0  && <span style={{ color: 'var(--accent-red)' }}>{failedTasks.length} failed</span>}
              </div>
            </div>

            {/* Task List */}
            <div className="max-h-72 overflow-y-auto">
              <AnimatePresence>
                {uploadTasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-[--text-primary] truncate max-w-[200px]">{task.fileName}</p>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {task.status === 'uploading' && (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--accent-blue)' }} />
                            <span className="text-[11px]" style={{ color: 'var(--accent-blue)' }}>{task.uploadSpeedMbps} Mb/s</span>
                          </>
                        )}
                        {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />}
                        {task.status === 'error'     && <AlertCircle  className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />}
                        {task.status === 'queued'    && <span className="text-[11px] text-[--text-muted]">Queued</span>}
                      </div>
                    </div>
                    {(task.status === 'uploading' || task.status === 'queued') && (
                      <div className="progress-track h-1">
                        <motion.div
                          className="progress-fill h-full"
                          animate={{ width: `${task.progressPercentage}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-[--text-muted] mt-1">
                      <span>{task.formattedSize}</span>
                      {task.status === 'uploading' && <span>{task.progressPercentage}%</span>}
                      {task.status === 'completed' && <span style={{ color: 'var(--accent-green)' }}>Saved to Drive</span>}
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
