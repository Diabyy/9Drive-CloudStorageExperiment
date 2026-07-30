import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, FileText, Image as ImageIcon, Video, Archive, Code,
  Eye, Trash2, MoveRight, Share2,
  Star, LayoutGrid, List, HardDrive, Edit2, Check, X,
  Folder, FolderPlus, ChevronRight, Home,
} from 'lucide-react';
import type { VaultFile, FileCategory, DriveAccount, VirtualFolder } from '../types';

interface FileBrowserProps {
  files: VaultFile[];
  accounts: DriveAccount[];
  folders?: VirtualFolder[];
  currentFolderId?: string | null;
  folderPath?: { id: string | null; name: string }[];
  onNavigateFolder?: (folderId: string | null) => void;
  onCreateFolder?: (name: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onPreviewFile: (file: VaultFile) => void;
  onDeleteFile: (fileId: string) => void;
  onToggleStar: (fileId: string) => void;
  onOpenTransferModal: (file: VaultFile) => void;
  onShareFile: (file: VaultFile) => void;
  onRenameFile: (file: VaultFile, newName: string) => void;
}

const CATEGORIES: { id: FileCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all',       label: 'All Files',  icon: Filter    },
  { id: 'documents', label: 'Documents',  icon: FileText  },
  { id: 'images',    label: 'Images',     icon: ImageIcon },
  { id: 'videos',    label: 'Videos',     icon: Video     },
  { id: 'archives',  label: 'Archives',   icon: Archive   },
  { id: 'code',      label: 'Code',       icon: Code      },
];

const ACCENT_COLORS: Record<string, { text: string; bg: string }> = {
  documents: { text: '#2997FF', bg: 'rgba(41,151,255,0.10)' },
  images:    { text: '#BF5AF2', bg: 'rgba(191,90,242,0.10)' },
  videos:    { text: '#FF453A', bg: 'rgba(255,69,58,0.10)' },
  archives:  { text: '#FF9F0A', bg: 'rgba(255,159,10,0.10)' },
  code:      { text: '#30D158', bg: 'rgba(48,209,88,0.10)' },
};

const DRIVE_COLORS = ['#2997FF', '#BF5AF2', '#30D158', '#FF453A', '#FF9F0A'];

function CategoryIcon({ category, className = 'w-4 h-4' }: { category: string; className?: string }) {
  const icons: Record<string, React.ElementType> = {
    documents: FileText, images: ImageIcon, videos: Video, archives: Archive, code: Code,
  };
  const Icon = icons[category] || FileText;
  return <Icon className={className} strokeWidth={1.5} />;
}

export function FileBrowser({
  files, accounts, folders = [], currentFolderId = null, folderPath = [{ id: null, name: 'Root Vault' }],
  onNavigateFolder, onCreateFolder, onDeleteFolder,
  onPreviewFile, onDeleteFile, onToggleStar, onOpenTransferModal, onShareFile, onRenameFile,
}: FileBrowserProps) {
  const [category, setCategory] = useState<FileCategory>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Keyboard shortcut handler for selected file (Space preview, Delete/Backspace delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!selectedFileId) return;

      const targetFile = files.find(f => f.id === selectedFileId);
      if (!targetFile) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onPreviewFile(targetFile);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        onDeleteFile(targetFile.id);
        setSelectedFileId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFileId, files, onPreviewFile, onDeleteFile]);

  const filtered = files.filter(f => category === 'all' || f.category === category);

  const getDriveIndex = (driveId: string) => {
    const idx = accounts.findIndex(a => a.id === driveId);
    return idx >= 0 ? idx : 0;
  };

  const startEdit = (file: VaultFile) => {
    setEditingId(file.id);
    setEditName(file.name);
  };

  const commitEdit = (file: VaultFile) => {
    if (editName.trim() && editName !== file.name) onRenameFile(file, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Bar — Apple Segmented Control */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
              style={{
                background: category === id ? 'rgba(41, 151, 255, 0.10)' : 'transparent',
                color: category === id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                border: category === id ? '1px solid rgba(41, 151, 255, 0.20)' : '1px solid transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[--text-muted] mr-2">
            {filtered.length} file{filtered.length !== 1 ? 's' : ''}
          </span>
          {[
            { mode: 'list' as const, Icon: List },
            { mode: 'grid' as const, Icon: LayoutGrid },
          ].map(({ mode, Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="p-1.5 rounded-lg transition-all cursor-pointer"
              style={{
                background: viewMode === mode ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb & New Folder */}
      <div
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div className="flex items-center gap-1.5 text-xs text-[--text-secondary] overflow-x-auto">
          <Home className="w-3.5 h-3.5 text-[--accent-blue] shrink-0" strokeWidth={1.5} />
          {folderPath.map((item, idx) => (
            <React.Fragment key={item.id || 'root'}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-[--text-muted] shrink-0" />}
              <button
                onClick={() => onNavigateFolder?.(item.id)}
                className="font-medium transition-colors cursor-pointer hover:text-[--accent-blue]"
                style={{
                  color: idx === folderPath.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: idx === folderPath.length - 1 ? 600 : 500,
                }}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => setIsNewFolderModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0"
          style={{
            background: 'rgba(41, 151, 255, 0.10)',
            border: '1px solid rgba(41, 151, 255, 0.20)',
            color: 'var(--accent-blue)',
          }}
        >
          <FolderPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>+ Folder</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Virtual Folders Grid */}
        {folders.length > 0 && (
          <div>
            <div className="text-[11px] font-medium text-[--text-muted] uppercase tracking-wider mb-2 px-1">
              FOLDERS ({folders.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map(f => (
                <div
                  key={f.id}
                  onClick={() => onNavigateFolder?.(f.id)}
                  className="group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(41, 151, 255, 0.10)' }}
                  >
                    <Folder className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-medium text-[--text-primary] truncate flex-1">{f.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus folder "${f.name}"?`)) onDeleteFolder?.(f.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[--text-muted] hover:text-[--accent-red] transition-opacity cursor-pointer"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Content */}
        {filtered.length === 0 && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <HardDrive className="w-7 h-7 text-[--text-muted]" strokeWidth={1.5} />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-sm text-[--text-primary] font-semibold">Folder Ini Kosong</p>
              <p className="text-xs text-[--text-secondary] leading-relaxed">
                Unggah berkas baru atau buat folder di dalam direktori ini.
              </p>
            </div>
          </div>
        ) : filtered.length > 0 && viewMode === 'list' ? (
          <table className="w-full text-sm">
            <thead
              className="sticky top-0 z-10"
              style={{
                background: 'rgba(9, 9, 11, 0.95)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <tr
                className="text-[11px] text-[--text-muted] uppercase tracking-wider"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <th className="text-left px-5 py-3 w-10 font-medium">★</th>
                <th className="text-left px-3 py-3 font-medium">File Name</th>
                <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Size</th>
                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Drive</th>
                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Uploaded</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((file, idx) => {
                  const driveIdx = getDriveIndex(file.driveId);
                  const accent = ACCENT_COLORS[file.category] || ACCENT_COLORS.documents;
                  const isEditing = editingId === file.id;
                  const driveColor = DRIVE_COLORS[driveIdx % DRIVE_COLORS.length];

                  return (
                    <motion.tr
                      key={file.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ delay: idx * 0.02, duration: 0.15 }}
                      onClick={() => setSelectedFileId(file.id)}
                      className="group transition-colors duration-100 cursor-pointer"
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        background: selectedFileId === file.id ? 'rgba(41, 151, 255, 0.10)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (selectedFileId !== file.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                      onMouseLeave={e => {
                        if (selectedFileId !== file.id) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Star */}
                      <td className="px-5 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); onToggleStar(file.id); }}
                          className="w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer"
                          style={{ color: file.isStarred ? 'var(--accent-orange)' : 'var(--text-muted)' }}
                        >
                          <Star className="w-3.5 h-3.5" fill={file.isStarred ? 'currentColor' : 'none'} strokeWidth={1.5} />
                        </button>
                      </td>

                      {/* File Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: accent.bg, color: accent.text }}
                          >
                            <CategoryIcon category={file.category} className="w-3.5 h-3.5" />
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                autoFocus
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(file); if (e.key === 'Escape') setEditingId(null); }}
                                onClick={e => e.stopPropagation()}
                                className="flex-1 rounded-lg px-2 py-1 text-xs text-[--text-primary] outline-none"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(41, 151, 255, 0.4)',
                                }}
                              />
                              <button onClick={() => commitEdit(file)} className="cursor-pointer" style={{ color: 'var(--accent-green)' }}><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingId(null)} className="cursor-pointer" style={{ color: 'var(--text-muted)' }}><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <span
                              className="text-xs font-medium truncate max-w-[200px] cursor-pointer transition-colors"
                              style={{ color: 'var(--text-primary)' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                              onClick={() => onPreviewFile(file)}
                            >{file.name}</span>
                          )}
                        </div>
                      </td>

                      {/* Size */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-xs text-[--text-secondary]">{file.formattedSize}</span>
                      </td>

                      {/* Drive */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span
                          className="text-[11px] font-medium px-2 py-1 rounded-lg"
                          style={{
                            color: driveColor,
                            background: `${driveColor}15`,
                          }}
                        >
                          {file.driveName}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-xs text-[--text-muted]">{file.uploadDate}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <ActionBtn onClick={() => onPreviewFile(file)} title="Preview"><Eye className="w-3.5 h-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => onShareFile(file)} title="Share"><Share2 className="w-3.5 h-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => onOpenTransferModal(file)} title="Move"><MoveRight className="w-3.5 h-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => startEdit(file)} title="Rename"><Edit2 className="w-3.5 h-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => onDeleteFile(file.id)} title="Delete" danger><Trash2 className="w-3.5 h-3.5" /></ActionBtn>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        ) : (
          /* Grid View */
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence>
              {filtered.map((file, idx) => {
                const accent = ACCENT_COLORS[file.category] || ACCENT_COLORS.documents;
                const driveIdx = getDriveIndex(file.driveId);
                const driveColor = DRIVE_COLORS[driveIdx % DRIVE_COLORS.length];
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl p-4 cursor-pointer group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                    onClick={() => onPreviewFile(file)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: accent.bg, color: accent.text }}
                    >
                      <CategoryIcon category={file.category} className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-[--text-primary] truncate">{file.name}</p>
                    <p className="text-[11px] text-[--text-muted] mt-0.5">{file.formattedSize}</p>
                    <p className="text-[11px] mt-1 font-medium" style={{ color: driveColor }}>{file.driveName}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {isNewFolderModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md space-y-4 p-6 rounded-2xl"
              style={{
                background: 'rgba(28, 28, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>
                  <FolderPlus className="w-5 h-5" strokeWidth={1.5} />
                  <span>Buat Folder Baru</span>
                </div>
                <button
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="p-1 text-[--text-muted] hover:text-[--text-primary] rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs text-[--text-secondary] block mb-1.5 font-medium">Nama Folder</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newFolderName.trim()) {
                      onCreateFolder?.(newFolderName.trim());
                      setNewFolderName('');
                      setIsNewFolderModalOpen(false);
                    }
                  }}
                  placeholder="Misal: Dokumen Proyek 2026"
                  autoFocus
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[--text-primary] placeholder-[--text-muted] focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[--text-secondary] hover:text-[--text-primary] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (newFolderName.trim()) {
                      onCreateFolder?.(newFolderName.trim());
                      setNewFolderName('');
                      setIsNewFolderModalOpen(false);
                    }
                  }}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40 transition-all cursor-pointer"
                  style={{ background: 'var(--accent-blue)' }}
                >
                  Buat Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({
  children, onClick, title, danger = false,
}: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-100 cursor-pointer"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => {
        e.currentTarget.style.color = danger ? 'var(--accent-red)' : 'var(--accent-blue)';
        e.currentTarget.style.background = danger ? 'rgba(255,69,58,0.08)' : 'rgba(41,151,255,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}
