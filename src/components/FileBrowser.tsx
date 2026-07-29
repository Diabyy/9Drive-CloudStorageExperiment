import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, FileText, Image as ImageIcon, Video, Archive, Code,
  MoreVertical, Eye, Download, Trash2, MoveRight, Share2,
  Star, LayoutGrid, List, HardDrive, Edit2, Check, X,
  Folder, FolderPlus, ChevronRight, Home, Plus,
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

const ACCENT_COLORS: Record<string, string> = {
  documents: 'text-blue-400 bg-blue-500/10',
  images:    'text-purple-400 bg-purple-500/10',
  videos:    'text-rose-400 bg-rose-500/10',
  archives:  'text-amber-400 bg-amber-500/10',
  code:      'text-emerald-400 bg-emerald-500/10',
};

const DRIVE_COLORS = ['text-cyan-400', 'text-indigo-400', 'text-emerald-400', 'text-rose-400', 'text-amber-400'];
const DRIVE_BG = ['bg-cyan-500/10', 'bg-indigo-500/10', 'bg-emerald-500/10', 'bg-rose-500/10', 'bg-amber-500/10'];

function CategoryIcon({ category, className = 'w-4 h-4' }: { category: string; className?: string }) {
  const icons: Record<string, React.ElementType> = {
    documents: FileText, images: ImageIcon, videos: Video, archives: Archive, code: Code,
  };
  const Icon = icons[category] || FileText;
  return <Icon className={className} />;
}

export function FileBrowser({
  files, accounts, folders = [], currentFolderId = null, folderPath = [{ id: null, name: 'Root Vault' }],
  onNavigateFolder, onCreateFolder, onDeleteFolder,
  onPreviewFile, onDeleteFile, onToggleStar, onOpenTransferModal, onShareFile, onRenameFile,
}: FileBrowserProps) {
  const [category, setCategory] = useState<FileCategory>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Folder modal
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filtered = files.filter(f =>
    category === 'all' || f.category === category
  );

  const getDriveIndex = (driveId: string) => {
    const idx = accounts.findIndex(a => a.id === driveId);
    return idx >= 0 ? idx : 0;
  };

  const startEdit = (file: VaultFile) => {
    setEditingId(file.id);
    setEditName(file.name);
    setActiveMenu(null);
  };

  const commitEdit = (file: VaultFile) => {
    if (editName.trim() && editName !== file.name) onRenameFile(file, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                category === id
                  ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-600 mr-2">
            {filtered.length} file{filtered.length !== 1 ? 's' : ''}
          </span>
          {[
            { mode: 'list' as const, Icon: List },
            { mode: 'grid' as const, Icon: LayoutGrid },
          ].map(({ mode, Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === mode ? 'bg-slate-700/60 text-slate-200' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb Path & New Folder Action Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/40 shrink-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono overflow-x-auto">
          <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {folderPath.map((item, idx) => (
            <React.Fragment key={item.id || 'root'}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
              <button
                onClick={() => onNavigateFolder?.(item.id)}
                className={`hover:text-cyan-300 font-medium transition-colors cursor-pointer ${
                  idx === folderPath.length - 1 ? 'text-slate-100 font-bold' : 'text-slate-400'
                }`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* New Folder Button */}
        <button
          onClick={() => setIsNewFolderModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 text-xs font-semibold tracking-wider transition-all cursor-pointer shrink-0"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>+ Folder Baru</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" onClick={() => setActiveMenu(null)}>
        {/* Virtual Folders Grid */}
        {folders.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              FOLDERS ({folders.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map(f => (
                <div
                  key={f.id}
                  onClick={() => onNavigateFolder?.(f.id)}
                  className="group relative flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                    <Folder className="w-4 h-4 fill-cyan-500/20" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                      {f.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus folder "${f.name}"?`)) onDeleteFolder?.(f.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Content */}
        {filtered.length === 0 && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
              <HardDrive className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-sm text-slate-200 font-bold">Folder Ini Kosong</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unggah berkas baru atau buat folder di dalam direktori ini.
              </p>
            </div>
          </div>
        ) : filtered.length > 0 && viewMode === 'list' ? (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#0C1220]/95 backdrop-blur-sm">
              <tr className="text-[11px] text-slate-600 uppercase tracking-widest border-b border-slate-800/60">
                <th className="text-left px-5 py-3 w-10 font-medium">★</th>
                <th className="text-left px-3 py-3 font-medium">File Name</th>
                <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Size</th>
                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Drive</th>
                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Uploaded</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              <AnimatePresence>
                {filtered.map((file, idx) => {
                  const driveIdx = getDriveIndex(file.driveId);
                  const accent = ACCENT_COLORS[file.category] || ACCENT_COLORS.documents;
                  const isEditing = editingId === file.id;
                  const showMenu = activeMenu === file.id;

                  return (
                    <motion.tr
                      key={file.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: idx * 0.02, duration: 0.18 }}
                      className="group hover:bg-slate-800/30 transition-colors duration-100"
                    >
                      {/* Star */}
                      <td className="px-5 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); onToggleStar(file.id); }}
                          className={`w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer ${
                            file.isStarred ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" fill={file.isStarred ? 'currentColor' : 'none'} />
                        </button>
                      </td>

                      {/* File Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
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
                                className="flex-1 bg-slate-800/80 border border-cyan-500/40 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none"
                              />
                              <button onClick={() => commitEdit(file)} className="text-emerald-400 hover:text-emerald-300 cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-400 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <span
                              className="text-slate-200 text-xs font-medium truncate max-w-[200px] cursor-pointer hover:text-cyan-300 transition-colors"
                              onClick={() => onPreviewFile(file)}
                            >{file.name}</span>
                          )}
                        </div>
                      </td>

                      {/* Size */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-xs text-slate-500">{file.formattedSize}</span>
                      </td>

                      {/* Drive */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className={`text-[11px] font-medium px-2 py-1 rounded-lg ${DRIVE_BG[driveIdx % DRIVE_BG.length]} ${DRIVE_COLORS[driveIdx % DRIVE_COLORS.length]}`}>
                          {file.driveName}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-600">{file.uploadDate}</span>
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
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ y: -3, borderColor: 'rgba(6,182,212,0.4)' }}
                    className="glass-surface rounded-xl p-4 border border-slate-700/40 cursor-pointer group"
                    onClick={() => onPreviewFile(file)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
                      <CategoryIcon category={file.category} className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-slate-200 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{file.formattedSize}</p>
                    <p className={`text-[11px] mt-1 font-medium ${DRIVE_COLORS[driveIdx % DRIVE_COLORS.length]}`}>{file.driveName}</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111827] border border-slate-700/60 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <FolderPlus className="w-5 h-5" />
                  <span>Buat Folder Baru</span>
                </div>
                <button
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1.5 uppercase">Nama Folder</label>
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
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
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-100 cursor-pointer ${
        danger
          ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10'
          : 'text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10'
      }`}
    >
      {children}
    </button>
  );
}
