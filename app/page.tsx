'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
import {
  Archive,
  ArchiveRestore,
  Bell,
  BookOpen,
  ChevronDown,
  FileText,
  Folder,
  Inbox,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Star,
  Tag,
  Trash2,
  WandSparkles,
} from 'lucide-react'

type Note = {
  id?: string
  title: string
  excerpt: string
  content: string
  date: string
  tag: string
  favorite: boolean
  archived?: boolean
  trashed?: boolean
}

const folderOptions = ['Work', 'Personal', 'Journal']

const initialNotes: Note[] = [
  { title: 'Welcome to your notes', excerpt: 'A quiet place for everything on your mind.', content: 'Use notes to capture ideas, make plans, and keep the details that matter close by.', date: 'Today', tag: 'Getting started', favorite: true },
  { title: 'Project ideas', excerpt: 'Small experiments worth exploring this month.', content: 'Explore small experiments worth building this month, including a reading tracker and a weekly planning tool.', date: 'Yesterday', tag: 'Work', favorite: false },
  { title: 'Reading list', excerpt: 'Books, essays, and links to return to.', content: 'Books, essays, and links to return to when there is time for a thoughtful break.', date: 'Jun 12', tag: 'Personal', favorite: true },
  { title: 'Weekly reflections', excerpt: 'What worked, what surprised me, what is next.', content: 'Think about what worked, what surprised me, and what is next for the coming week.', date: 'Jun 09', tag: 'Journal', favorite: false },
]

const navItems = [
  { label: 'All notes', icon: Inbox },
  { label: 'Favorites', icon: Star },
  { label: 'Archive', icon: Archive },
  { label: 'Trash', icon: Trash2 },
]

export default function Home() {
  const [notes, setNotes] = useState(initialNotes)
  const [activeNote, setActiveNote] = useState(0)
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView] = useState('All notes')
  const [folderFilter, setFolderFilter] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/api/notes`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load notes')))
      .then((data: Array<Note & { noteDate?: string }>) => {
        if (!cancelled && data.length) setNotes(data.map((item) => ({ ...item, date: item.date ?? item.noteDate ?? 'Just now' })))
      })
      .catch(() => { if (!cancelled) showNotice('Could not connect to notes API') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filteredNotes = useMemo(() => {
    const normalizeSearchText = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()

    const queryWords = normalizeSearchText(query)
      .split(/\s+/)
      .filter((word) => word.length > 1)

    return notes.filter((note) => {
      const searchableText = normalizeSearchText([note.title, note.excerpt, note.content, note.tag].join(' '))
      const matchesQuery = queryWords.length === 0 || queryWords.every((word) => searchableText.includes(word))
      const matchesFolder = !folderFilter || note.tag === folderFilter
      const matchesView = view === 'All notes'
        ? !note.archived && !note.trashed
        : (view === 'Favorites' && note.favorite && !note.archived && !note.trashed)
          || (view === 'Archive' && note.archived)
          || (view === 'Trash' && note.trashed)

      return matchesQuery && matchesFolder && matchesView
    })
  }, [notes, query, view, folderFilter])
  const note = filteredNotes[activeNote] ?? filteredNotes[0]

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const createNote = async () => {
    const destination = {
      favorite: view === 'Favorites',
      archived: view === 'Archive',
      trashed: view === 'Trash',
    }
    const tag = folderFilter ?? ''

    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled note',
          excerpt: 'Start writing something new.',
          content: 'Start writing something new and capture your next idea here.',
          tag,
          ...destination,
        }),
      })
      if (!response.ok) throw new Error('Create failed')
      const newNote = await response.json() as Note
      setNotes((current) => [newNote, ...current])
      setQuery('')
      setActiveNote(0)
      showNotice('New note created')
    } catch { showNotice('Could not create note') }
  }

  const toggleFavorite = async () => {
    if (!note?.id) return
    const favorite = !note.favorite
    try {
      const response = await fetch(`${API_URL}/api/notes/${note.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ favorite }) })
      if (!response.ok) throw new Error('Update failed')
      const updated = await response.json() as Note
      setNotes((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, date: updated.date ?? item.date } : item))
      showNotice(favorite ? 'Added to favorites' : 'Removed from favorites')
    } catch { showNotice('Could not update note') }
  }

  const toggleArchive = async () => {
    if (!note?.id) return
    const archived = !note.archived
    try {
      const response = await fetch(`${API_URL}/api/notes/${note.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived }) })
      if (!response.ok) throw new Error('Archive update failed')
      const updated = await response.json() as Note
      setNotes((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, date: updated.date ?? item.date } : item))
      showNotice(archived ? 'Note archived' : 'Note restored')
    } catch { showNotice('Could not update archive status') }
  }

  const clearTrash = async () => {
    if (!window.confirm('Permanently delete all notes in Trash? This cannot be undone.')) return
    try {
      const response = await fetch(`${API_URL}/api/notes?trash=clear`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Clear trash failed')
      setNotes((current) => current.filter((item) => !item.trashed))
      setActiveNote(0)
      showNotice('Trash cleared')
    } catch { showNotice('Could not clear trash') }
  }

  const restoreFromTrash = async () => {
    if (!note?.id) return
    try {
      const response = await fetch(`${API_URL}/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trashed: false, archived: false }),
      })
      if (!response.ok) throw new Error('Restore failed')
      const updated = await response.json() as Note
      setNotes((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, date: updated.date ?? item.date } : item))
      setActiveNote((current) => Math.max(0, Math.min(current, filteredNotes.length - 2)))
      showNotice('Note restored')
    } catch { showNotice('Could not restore note') }
  }

  const moveToTrash = async () => {
    if (!note?.id) return
    const noteId = note.id
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Trash failed')
      const updated = await response.json() as Note
      setNotes((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, date: updated.date ?? item.date } : item))
      setActiveNote((current) => Math.max(0, Math.min(current, filteredNotes.length - 2)))
      showNotice('Note moved to trash')
    } catch { showNotice('Could not move note to trash') }
  }

  const scheduleNoteUpdate = (updates: Partial<Pick<Note, 'title' | 'excerpt' | 'content'>>) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => { void updateNote(updates) }, 800)
  }

  const updateNote = async (updates: Partial<Pick<Note, 'title' | 'excerpt' | 'content' | 'tag'>>) => {
    if (!note?.id || Object.keys(updates).length === 0) return

    const noteId = note.id
    const optimistic = { ...note, ...updates }
    setNotes((current) => current.map((item) => item.id === noteId ? optimistic : item))

    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error('Update failed')
      const updated = await response.json() as Note
      setNotes((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, date: updated.date ?? item.date } : item))
      showNotice('Note saved')
    } catch {
      showNotice('Could not save note')
    }
  }

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {notice && <div role="status" className="fixed right-5 top-5 z-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">{notice}</div>}
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5 md:flex`}>
          <div className="flex items-center justify-between px-2"><div className="flex items-center gap-2.5"><div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileText className="size-4" /></div><span className="font-semibold tracking-tight">noted</span></div><button aria-label="Collapse sidebar" onClick={() => setSidebarOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"><PanelLeft className="size-4" /></button></div>
          {view !== 'Archive' && view !== 'Trash' && <button onClick={createNote} className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"><Plus className="size-4" /> New note</button>}
          <nav className="mt-7 flex flex-col gap-1" aria-label="Main navigation">{navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setView(label); setFolderFilter(null); setQuery(''); setActiveNote(0) }} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${view === label && !folderFilter ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><span className="flex items-center gap-3"><Icon className="size-4" />{label}</span></button>)}</nav>
          <div className="mt-8 border-t border-border pt-6"><div className="flex items-center justify-between px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span>Folders</span><button aria-label="Add folder" onClick={() => showNotice('Folder creation is ready for the next step')}><Plus className="size-3.5" /></button></div>{['Work', 'Personal', 'Journal'].map((folder) => <button key={folder} onClick={() => { setFolderFilter(folder); setView('All notes'); setQuery(''); setActiveNote(0) }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${folderFilter === folder ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Folder className="size-4" />{folder}</button>)}</div>
          <div className="mt-auto flex flex-col gap-1"><button onClick={() => showNotice('Settings will be available soon')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Settings className="size-4" />Settings</button><div className="mt-3 flex items-center gap-3 border-t border-border px-2 pt-4"><div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">AM</div><div className="min-w-0"><p className="truncate text-sm font-medium">Alex Morgan</p><p className="truncate text-xs text-muted-foreground">Personal workspace</p></div><ChevronDown className="ml-auto size-4 text-muted-foreground" /></div></div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[72px] items-center justify-between border-b border-border px-5 md:px-8"><div className="flex items-center gap-3"><button aria-label="Open sidebar" onClick={() => setSidebarOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"><PanelLeft className="size-4" /></button><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace</p><h1 className="text-lg font-semibold tracking-tight">{view}</h1></div></div><div className="flex items-center gap-2"><label className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input aria-label="Search notes" value={query} onChange={(e) => { setQuery(e.target.value); setActiveNote(0) }} placeholder="Search notes" className="h-9 w-52 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" /></label><button aria-label="Notifications" onClick={() => showNotice('You are all caught up')} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Bell className="size-4" /></button><button aria-label="More options" onClick={() => showNotice('More options coming soon')} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><MoreHorizontal className="size-4" /></button></div></header>
          <div className="flex min-h-0 flex-1 flex-col md:flex-row"><div className="w-full shrink-0 border-b border-border md:w-[310px] md:border-b-0 md:border-r"><div className="flex items-center justify-between px-5 py-5 md:px-6"><div><h2 className="font-semibold">Notes</h2><p className="mt-0.5 text-xs text-muted-foreground">{filteredNotes.length} notes in this view</p></div><div className="flex items-center gap-2">{view === 'Trash' && filteredNotes.length > 0 && <button aria-label="Clear trash" onClick={clearTrash} className="rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">Clear trash</button>}{view !== 'Archive' && view !== 'Trash' && <button aria-label="Create note" onClick={createNote} className="rounded-lg border border-input p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="size-4" /></button>}</div></div><div className="flex max-h-[calc(100vh-150px)] flex-col gap-1 overflow-y-auto px-3 pb-5">{filteredNotes.map((item, index) => <button key={`${item.title}-${index}`} onClick={() => setActiveNote(index)} className={`group rounded-xl p-3.5 text-left transition ${index === activeNote ? 'bg-accent' : 'hover:bg-accent/60'}`}><div className="flex items-start justify-between gap-3"><h3 className="truncate text-sm font-medium">{item.title}</h3>{item.favorite && <Star className="size-3.5 shrink-0 fill-primary text-primary" />}</div><p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">{item.excerpt}</p><div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Tag className="size-3" />{item.tag}</span><span className="text-[11px] text-muted-foreground">{item.date}</span></div></button>)}</div></div>
          <article className="min-w-0 flex-1 bg-card"><div className="mx-auto flex h-full max-w-3xl flex-col px-6 py-8 md:px-12 md:py-12">{note ? <><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-primary" /> Edited just now</div><div className="flex items-center gap-1"><button aria-label="Favorite note" onClick={toggleFavorite} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Star className={`size-4 ${note.favorite ? 'fill-primary text-primary' : ''}`} /></button>{view === 'Trash' ? <button aria-label="Restore note from trash" onClick={restoreFromTrash} className="rounded-lg bg-accent p-2 text-primary hover:bg-accent/80"><ArchiveRestore className="size-4" /></button> : <><button aria-label={note.archived ? 'Restore note from archive' : 'Archive note'} onClick={toggleArchive} className={`rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground ${note.archived ? 'bg-accent text-primary' : ''}`}>{note.archived ? <ArchiveRestore className="size-4 text-primary" /> : <Archive className="size-4" />}</button><button aria-label="Move note to trash" onClick={moveToTrash} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive"><Trash2 className="size-4" /></button></>}</div></div><div className="mt-12"><div className="mb-6 flex flex-wrap items-center gap-3"><div className="flex items-center gap-2 text-xs font-medium text-primary"><BookOpen className="size-3.5" /> Folder</div><label className="sr-only" htmlFor="note-folder">Choose a folder</label><select id="note-folder" aria-label="Choose a folder" value={note.tag} onChange={(event) => { void updateNote({ tag: event.target.value }) }} className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"><option value="">No folder</option>{folderOptions.map((folder) => <option key={folder} value={folder}>{folder}</option>)}</select></div><input aria-label="Note title" value={note.title} onChange={(event) => { const value = event.target.value; setNotes((current) => current.map((item) => item.id === note.id ? { ...item, title: value } : item)); scheduleNoteUpdate({ title: value }) }} className="w-full cursor-text rounded-md bg-transparent px-2 py-1 text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground outline-none transition focus:bg-accent/40 focus:ring-2 focus:ring-ring placeholder:text-muted-foreground md:text-5xl" placeholder="Untitled note" /><textarea aria-label="Note excerpt" value={note.excerpt} onChange={(event) => { const value = event.target.value; setNotes((current) => current.map((item) => item.id === note.id ? { ...item, excerpt: value } : item)); scheduleNoteUpdate({ excerpt: value }) }} className="mt-5 w-full max-w-xl cursor-text resize-none rounded-md bg-transparent px-2 py-1 text-base leading-7 text-muted-foreground outline-none transition focus:bg-accent/40 focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" placeholder="Add a short description" rows={2} /><div className="my-9 h-px bg-border" /><div className="space-y-6 text-[15px] leading-7 text-muted-foreground"><textarea aria-label="Note content" value={note.content} onChange={(event) => { const value = event.target.value; setNotes((current) => current.map((item) => item.id === note.id ? { ...item, content: value } : item)); scheduleNoteUpdate({ content: value }) }} className="min-h-48 w-full resize-y bg-transparent text-[15px] leading-7 text-muted-foreground outline-none placeholder:text-muted-foreground" placeholder="Start writing your note..." /><div className="rounded-xl border border-border bg-background p-5"><div className="flex items-start gap-3"><WandSparkles className="mt-1 size-4 shrink-0 text-primary" /><div><p className="font-medium text-foreground">A simple place to start</p><p className="mt-1 text-sm leading-6">Create a note for an idea, a meeting, or anything you want to remember. Your notes stay organized here.</p></div></div></div><p>Everything is ready when you are. Start writing below, or create a new note from the sidebar.</p></div></div></> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No notes found.</div>}<div className="mt-auto flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground"><span>Last edited today at 9:41 AM</span><span>Autosaved</span></div></div></article></div>
        </section>
      </div>
    </main>
  )
}
