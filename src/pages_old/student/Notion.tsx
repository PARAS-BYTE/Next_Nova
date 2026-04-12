"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import {
  Plus,
  Search,
  Trash2,
  Star,
  StarOff,
  FileText,
  Edit2,
  Save,
  X,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Scroll,
  Sparkles,
  Shield,
  BookOpen,
  Sword,
  Bot,
  Send,
  Loader2,
  Crown,
  Zap,
  MessageCircle,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface PersonalNote {
  _id: string;
  title: string;
  content: string;
  icon: string;
  isFavorite: boolean;
  tags: string[];
  isFolder: boolean;
  parentFolder: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Writing Assistant ────────────────────────────────
const AIAssistant = ({ onInsert }: { onInsert: (text: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/chatbot', {
        message: `Generate note content about: "${prompt}". Write in clean markdown format. Be detailed and educational. Format with headers, bullet points, and code blocks where appropriate.`,
        context: 'You are a study note generator. Create well-structured educational notes in markdown.',
        history: [],
      }, { withCredentials: true });

      const generated = res.data.reply || res.data.message || '';
      if (generated) {
        onInsert(generated);
        setIsOpen(false);
        setPrompt('');
        toast.success('AI content inscribed into your scroll!');
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'AI generation failed. Try again!';
      toast.error(`AI Scribe Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 rounded-lg font-black text-[9px] uppercase tracking-widest"
        style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#fff' }}
      >
        <Sparkles className="w-3 h-3 mr-1.5" /> AI Scribe
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 w-80 rounded-2xl border-2 p-4 z-50"
            style={{
              background: '#0A0A0C',
              borderColor: 'rgba(124, 106, 250, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <p className="text-[9px] uppercase tracking-widest font-black text-white/40 mb-3">
              Summon AI Knowledge
            </p>
            <Input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe what to generate..."
              className="h-10 bg-white/5 border-white/10 rounded-xl text-xs text-white placeholder:text-white/20 focus:border-[#7C6AFA] mb-3"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex-1 h-9 rounded-lg font-black text-[9px] uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#fff' }}
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                {loading ? 'Channeling...' : 'Generate'}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="h-9 w-9 rounded-lg p-0"
              >
                <X className="w-3 h-3 text-white/40" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Note Item Component ────────────────────────────────
const NoteItem = ({
  note,
  isSelected,
  onSelect,
  onDelete,
  onToggleFavorite,
  getIcon,
}: {
  note: PersonalNote;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  getIcon: (iconName: string, isFolder: boolean) => any;
}) => {
  const IconComponent = getIcon(note.icon, note.isFolder);
  return (
    <motion.div
      className="group flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 border-2 transition-all"
      style={{
        background: isSelected ? 'rgba(124, 106, 250, 0.08)' : 'transparent',
        borderColor: isSelected ? 'rgba(124, 106, 250, 0.2)' : 'transparent',
      }}
      onClick={onSelect}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
        style={{
          background: isSelected ? 'rgba(124, 106, 250, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          borderColor: isSelected ? 'rgba(124, 106, 250, 0.3)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <IconComponent className="w-3.5 h-3.5" style={{ color: isSelected ? '#7C6AFA' : 'rgba(255,255,255,0.3)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-bold truncate block ${isSelected ? 'text-white' : 'text-white/60'}`}>
          {note.title}
        </span>
        <span className="text-[9px] text-white/20">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          {note.isFavorite ? (
            <Star className="w-3 h-3 text-[#FBBF24]" fill="#FBBF24" />
          ) : (
            <StarOff className="w-3 h-3 text-white/20" />
          )}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3 h-3 text-red-400/50" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Notion Component ────────────────────────────────
const Notion = () => {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<PersonalNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderPath, setFolderPath] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: 'Home' }]);

  const getIcon = (iconName: string, isFolder: boolean) => {
    const IconComponent = (LucideIcons as any)[iconName] || (isFolder ? Folder : FileText);
    return IconComponent;
  };

  const fetchNotes = async (folderId: string | null = null) => {
    try {
      setLoading(true);
      const url = folderId ? `/api/personal-notes?folderId=${folderId}` : '/api/personal-notes';
      const { data } = await axios.get(url, { withCredentials: true });
      if (data.success) {
        setNotes(data.notes);
        if (!selectedNote && data.notes.length > 0 && !folderId) {
          const firstNote = data.notes.find((n: PersonalNote) => !n.isFolder) || data.notes[0];
          if (firstNote) { setSelectedNote(firstNote); setTitleValue(firstNote.title); }
        }
      }
    } catch (err: any) {
      console.error('Fetch notes error:', err);
      toast.error('Failed to load scrolls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(currentFolderId); }, [currentFolderId]);

  const handleCreateNote = async () => {
    try {
      const { data } = await axios.post('/api/personal-notes', {
        title: 'Untitled Scroll', content: '', icon: 'FileText', isFolder: false, parentFolder: currentFolderId,
      }, { withCredentials: true });
      if (data.success) {
        await fetchNotes(currentFolderId);
        setSelectedNote(data.note); setTitleValue('Untitled Scroll'); setEditingTitle(true);
        toast.success('New scroll inscribed!');
      }
    } catch (err: any) {
      console.error('Create note error:', err);
      toast.error('Failed to create scroll');
    }
  };

  const handleCreateFolder = async () => {
    try {
      const { data } = await axios.post('/api/personal-notes', {
        title: 'New Vault', content: '', icon: 'Folder', isFolder: true, parentFolder: currentFolderId,
      }, { withCredentials: true });
      if (data.success) {
        await fetchNotes(currentFolderId);
        setExpandedFolders(new Set([...expandedFolders, data.note._id]));
        toast.success('New vault opened!');
      }
    } catch (err: any) {
      console.error('Create folder error:', err);
      toast.error('Failed to create vault');
    }
  };

  const handleOpenFolder = (folder: PersonalNote) => {
    setCurrentFolderId(folder._id);
    setFolderPath([...folderPath, { id: folder._id, name: folder.title }]);
    setExpandedFolders(new Set([...expandedFolders, folder._id]));
  };

  const handleNavigateBack = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    try {
      setSaving(true);
      const { data } = await axios.put(`/api/personal-notes/${selectedNote._id}`, {
        title: titleValue || selectedNote.title, content: selectedNote.content,
      }, { withCredentials: true });
      if (data.success) {
        setSelectedNote(data.note);
        setNotes(notes.map(n => n._id === selectedNote._id ? data.note : n));
        setEditingTitle(false);
        toast.success('Scroll saved to the archives!');
      }
    } catch (err: any) {
      console.error('Save note error:', err);
      toast.error('Failed to save scroll');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (value: string | undefined) => {
    if (selectedNote) setSelectedNote({ ...selectedNote, content: value || '' });
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Destroy this scroll permanently?')) return;
    try {
      const { data } = await axios.delete(`/api/personal-notes/${noteId}`, { withCredentials: true });
      if (data.success) {
        await fetchNotes(currentFolderId);
        if (selectedNote?._id === noteId) setSelectedNote(null);
        toast.success('Scroll destroyed');
      }
    } catch (err: any) {
      console.error('Delete note error:', err);
      toast.error('Failed to destroy scroll');
    }
  };

  const handleToggleFavorite = async (noteId: string, currentFavorite: boolean) => {
    try {
      const { data } = await axios.put(`/api/personal-notes/${noteId}`, { isFavorite: !currentFavorite }, { withCredentials: true });
      if (data.success) {
        setNotes(notes.map(n => n._id === noteId ? data.note : n));
        if (selectedNote?._id === noteId) setSelectedNote(data.note);
      }
    } catch (err: any) {
      console.error('Toggle favorite error:', err);
    }
  };

  const handleAIInsert = (text: string) => {
    if (selectedNote) {
      const newContent = selectedNote.content ? selectedNote.content + '\n\n' + text : text;
      setSelectedNote({ ...selectedNote, content: newContent });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredNotes.filter(n => n.isFolder);
  const favoriteNotes = filteredNotes.filter(n => !n.isFolder && n.isFavorite);
  const regularNotes = filteredNotes.filter(n => !n.isFolder && !n.isFavorite);

  return (
    <div className="flex h-screen" style={{ background: '#050507' }}>
      {/* ─── Sidebar - Scroll Archive ───────────────────────────── */}
      <div
        className="w-72 border-r flex flex-col"
        style={{ background: '#0A0A0C', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 mb-3 flex items-center gap-2">
            <Scroll className="w-3.5 h-3.5 text-[#7C6AFA]" /> Scroll Archive
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateNote}
              className="flex-1 h-9 rounded-xl font-black text-[9px] uppercase tracking-widest"
              style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#fff' }}
            >
              <Plus className="w-3 h-3 mr-1.5" /> New Scroll
            </Button>
            <Button
              onClick={handleCreateFolder}
              variant="outline"
              className="h-9 w-9 rounded-xl p-0 border-2"
              style={{ borderColor: 'rgba(124, 106, 250, 0.2)', background: 'transparent' }}
            >
              <Folder className="w-3.5 h-3.5 text-[#7C6AFA]" />
            </Button>
          </div>
        </div>

        {/* Breadcrumb Path */}
        {folderPath.length > 1 && (
          <div className="px-4 py-2 flex items-center gap-1 flex-wrap border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {folderPath.map((path, index) => (
              <span key={index} className="flex items-center">
                <button
                  onClick={() => handleNavigateBack(index)}
                  className="text-[9px] font-bold uppercase tracking-wider hover:text-[#7C6AFA] transition-colors"
                  style={{ color: index === folderPath.length - 1 ? '#7C6AFA' : 'rgba(255,255,255,0.3)' }}
                >
                  {path.name}
                </button>
                {index < folderPath.length - 1 && <ChevronRight className="w-3 h-3 text-white/10 mx-0.5" />}
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <Input
              placeholder="Search scrolls..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white/5 border-white/5 rounded-xl text-white placeholder:text-white/15 focus:border-[#7C6AFA]"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-[#7C6AFA] animate-spin" />
            </div>
          ) : (
            <>
              {/* Vaults (Folders) */}
              {folders.length > 0 && (
                <div className="mb-4">
                  <p className="text-[9px] font-black px-2 mb-2 uppercase tracking-[0.2em] text-white/20">
                    Vaults
                  </p>
                  {folders.map(folder => {
                    const IconComponent = getIcon(folder.icon, true);
                    return (
                      <motion.div
                        key={folder._id}
                        className="group flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 border-2 transition-all hover:bg-white/[0.02]"
                        style={{ borderColor: 'transparent' }}
                        onClick={() => handleOpenFolder(folder)}
                        whileHover={{ x: 3 }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-[#FBBF24]/5 border-[#FBBF24]/10">
                          {expandedFolders.has(folder._id) ? (
                            <FolderOpen className="w-3.5 h-3.5 text-[#FBBF24]" />
                          ) : (
                            <IconComponent className="w-3.5 h-3.5 text-[#FBBF24]" />
                          )}
                        </div>
                        <span className="flex-1 truncate text-xs font-bold text-white/60">{folder.title}</span>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteNote(folder._id); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-red-400/50" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Legendary Scrolls (Favorites) */}
              {favoriteNotes.length > 0 && (
                <div className="mb-4">
                  <p className="text-[9px] font-black px-2 mb-2 uppercase tracking-[0.2em] text-[#FBBF24]/50">
                    <Star className="w-3 h-3 inline mr-1" fill="#FBBF24" /> Legendary
                  </p>
                  {favoriteNotes.map(note => (
                    <NoteItem
                      key={note._id}
                      note={note}
                      isSelected={selectedNote?._id === note._id}
                      onSelect={() => { setSelectedNote(note); setTitleValue(note.title); setEditingTitle(false); }}
                      onDelete={() => handleDeleteNote(note._id)}
                      onToggleFavorite={() => handleToggleFavorite(note._id, note.isFavorite)}
                      getIcon={getIcon}
                    />
                  ))}
                </div>
              )}

              {/* Regular Scrolls */}
              <div>
                {(folders.length > 0 || favoriteNotes.length > 0) && (
                  <p className="text-[9px] font-black px-2 mb-2 uppercase tracking-[0.2em] text-white/20">
                    All Scrolls
                  </p>
                )}
                {regularNotes.map(note => (
                  <NoteItem
                    key={note._id}
                    note={note}
                    isSelected={selectedNote?._id === note._id}
                    onSelect={() => { setSelectedNote(note); setTitleValue(note.title); setEditingTitle(false); }}
                    onDelete={() => handleDeleteNote(note._id)}
                    onToggleFavorite={() => handleToggleFavorite(note._id, note.isFavorite)}
                    getIcon={getIcon}
                  />
                ))}
              </div>

              {filteredNotes.length === 0 && (
                <div className="text-center py-12">
                  <Scroll className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-xs text-white/20 font-bold uppercase tracking-widest">
                    {searchQuery ? 'No scrolls found' : 'No scrolls yet'}
                  </p>
                  <p className="text-[9px] text-white/10 mt-1">Create your first scroll to begin</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer Stats */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
            <span>{notes.filter(n => !n.isFolder).length} Scrolls</span>
            <span>{folders.length} Vaults</span>
          </div>
        </div>
      </div>

      {/* ─── Main Editor - Inscription Table ───────────────────────────── */}
      <div className="flex-1 flex flex-col" style={{ background: '#050507' }}>
        {selectedNote && !selectedNote.isFolder ? (
          <>
            {/* Toolbar */}
            <div
              className="p-4 border-b flex items-center justify-between relative"
              style={{ background: '#0A0A0C', borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3 flex-1">
                {editingTitle ? (
                  <div className="flex items-center gap-2 flex-1 max-w-lg">
                    <Input
                      value={titleValue}
                      onChange={e => setTitleValue(e.target.value)}
                      className="h-10 bg-white/5 border-white/10 rounded-xl text-sm text-white font-bold focus:border-[#7C6AFA]"
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveNote();
                        else if (e.key === 'Escape') { setTitleValue(selectedNote.title); setEditingTitle(false); }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={saving}
                      className="h-10 w-10 rounded-xl p-0"
                      style={{ background: '#7C6AFA' }}
                    >
                      <Save className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setTitleValue(selectedNote.title); setEditingTitle(false); }}
                      className="h-10 w-10 rounded-xl p-0"
                    >
                      <X className="w-4 h-4 text-white/40" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {(() => {
                      const IconComponent = getIcon(selectedNote.icon, selectedNote.isFolder);
                      return (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2" style={{ background: 'rgba(124,106,250,0.1)', borderColor: 'rgba(124,106,250,0.2)' }}>
                          <IconComponent className="w-5 h-5 text-[#7C6AFA]" />
                        </div>
                      );
                    })()}
                    <div>
                      <h1
                        className="text-lg font-black cursor-pointer hover:text-[#7C6AFA] transition-colors text-white"
                        onClick={() => setEditingTitle(true)}
                      >
                        {selectedNote.title}
                      </h1>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">
                        Last edited {new Date(selectedNote.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="p-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-white/20" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <AIAssistant onInsert={handleAIInsert} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleFavorite(selectedNote._id, selectedNote.isFavorite)}
                  className="h-8 w-8 rounded-lg p-0 border-2"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'transparent' }}
                >
                  {selectedNote.isFavorite ? (
                    <Star className="w-3.5 h-3.5 text-[#FBBF24]" fill="#FBBF24" />
                  ) : (
                    <StarOff className="w-3.5 h-3.5 text-white/20" />
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="h-8 rounded-lg font-black text-[9px] uppercase tracking-widest"
                  style={{ background: 'linear-gradient(135deg, #34D399, #059669)', color: '#000' }}
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-6" style={{ background: '#050507' }}>
              <div data-color-mode="dark">
                <MDEditor
                  value={selectedNote.content}
                  onChange={handleContentChange}
                  height={600}
                  previewOptions={{ rehypePlugins: [] }}
                  textareaProps={{
                    style: {
                      background: '#0A0A0C',
                      color: '#FFFFFF',
                      borderColor: 'rgba(255,255,255,0.05)',
                    }
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ background: '#050507' }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 border-2 border-dashed" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <Scroll className="w-10 h-10 text-white/10" />
              </div>
              <p className="text-sm font-black mb-2 text-white/30 uppercase tracking-widest">
                No Scroll Selected
              </p>
              <p className="text-[10px] text-white/15 mb-6 uppercase tracking-wider">
                Select a scroll from the archive or create a new one
              </p>
              <Button
                onClick={handleCreateNote}
                className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg, #7C6AFA, #5D4AD4)', color: '#fff', boxShadow: '0 4px 15px rgba(124,106,250,0.3)' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Scroll
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notion;
