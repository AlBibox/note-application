'use client'

import { useMemo, useState } from 'react'
import {
  Archive,
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
  title: string
  excerpt: string
  date: string
  tag: string
  favorite: boolean
  archived?: boolean
  trashed?: boolean
}

const initialNotes: Note[] = [
  { title: 'Welcome to your notes', excerpt: 'A quiet place for everything on your mind.', date: 'Today', tag: 'Getting started', favorite: true },
  { title: 'Project ideas', excerpt: 'Small experiments worth exploring this month.', date: 'Yesterday', tag: 'Ideas', favorite: false },
  { title: 'Reading list', excerpt: 'Books, essays, and links to return to.', date: 'Jun 12', tag: 'Personal', favorite: true },
  { title: 'Weekly reflections', excerpt: 'What worked, what surprised me, what is next.', date: 'Jun 09', tag: 'Journal', favorite: false },
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
  const [notice, setNotice] = useState('')

  const filteredNotes = useMemo(() => notes.filter((note) => {
    const matchesQuery = `${note.title} ${note.excerpt} ${note.tag}`.toLowerCase().includes(query.toLowerCase())
    const matchesView = view === 'All notes' ? !note.archived && !note.trashed : (view === 'Favorites' && note.favorite && !note.archived && !note.trashed) || (view === 'Archive' && note.archived) || (view === 'Trash' && note.trashed)
    return matchesQuery && matchesView
  }), [notes, query, view])
  const note = filteredNotes[activeNote] ?? filteredNotes[0]

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const createNote = () => {
    const newNote = { title: 'Untitled note', excerpt: 'Start writing something new.', date: 'Just now', tag: 'Draft', favorite: false }
    setNotes((current) => [newNote, ...current])
    setView('All notes')
    setQuery('')
    setActiveNote(0)
    showNotice('New note created')
  }

  const toggleFavorite = () => {
    if (!note) return
    setNotes((current) => current.map((item) => item.title === note.title ? { ...item, favorite: !item.favorite } : item))
    showNotice(note.favorite ? 'Removed from favorites' : 'Added to favorites')
  }

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {notice && <div role="status" className="fixed right-5 top-5 z-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">{notice}</div>}
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5 md:flex`}>
          <div className="flex items-center justify-between px-2"><div className="flex items-center gap-2.5"><div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileText className="size-4" /></div><span className="font-semibold tracking-tight">noted</span></div><button aria-label="Collapse sidebar" onClick={() => setSidebarOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"><PanelLeft className="size-4" /></button></div>
          <button onClick={createNote} className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"><Plus className="size-4" /> New note</button>
          <nav className="mt-7 flex flex-col gap-1" aria-label="Main navigation">{navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setView(label); setActiveNote(0) }} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${view === label ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><span className="flex items-center gap-3"><Icon className="size-4" />{label}</span></button>)}</nav>
          <div className="mt-8 border-t border-border pt-6"><div className="flex items-center justify-between px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span>Folders</span><button aria-label="Add folder" onClick={() => showNotice('Folder creation is ready for the next step')}><Plus className="size-3.5" /></button></div>{['Work', 'Personal', 'Journal'].map((folder) => <button key={folder} onClick={() => { setQuery(folder); setView('All notes') }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Folder className="size-4" />{folder}</button>)}</div>
          <div className="mt-auto flex flex-col gap-1"><button onClick={() => showNotice('Settings will be available soon')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Settings className="size-4" />Settings</button><div className="mt-3 flex items-center gap-3 border-t border-border px-2 pt-4"><div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">AM</div><div className="min-w-0"><p className="truncate text-sm font-medium">Alex Morgan</p><p className="truncate text-xs text-muted-foreground">Personal workspace</p></div><ChevronDown className="ml-auto size-4 text-muted-foreground" /></div></div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[72px] items-center justify-between border-b border-border px-5 md:px-8"><div className="flex items-center gap-3"><button aria-label="Open sidebar" onClick={() => setSidebarOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"><PanelLeft className="size-4" /></button><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace</p><h1 className="text-lg font-semibold tracking-tight">{view}</h1></div></div><div className="flex items-center gap-2"><label className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input aria-label="Search notes" value={query} onChange={(e) => { setQuery(e.target.value); setActiveNote(0) }} placeholder="Search notes" className="h-9 w-52 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" /></label><button aria-label="Notifications" onClick={() => showNotice('You are all caught up')} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Bell className="size-4" /></button><button aria-label="More options" onClick={() => showNotice('More options coming soon')} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><MoreHorizontal className="size-4" /></button></div></header>
          <div className="flex min-h-0 flex-1 flex-col md:flex-row"><div className="w-full shrink-0 border-b border-border md:w-[310px] md:border-b-0 md:border-r"><div className="flex items-center justify-between px-5 py-5 md:px-6"><div><h2 className="font-semibold">Notes</h2><p className="mt-0.5 text-xs text-muted-foreground">{filteredNotes.length} notes in this view</p></div><button aria-label="Create note" onClick={createNote} className="rounded-lg border border-input p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="size-4" /></button></div><div className="flex max-h-[calc(100vh-150px)] flex-col gap-1 overflow-y-auto px-3 pb-5">{filteredNotes.map((item, index) => <button key={`${item.title}-${index}`} onClick={() => setActiveNote(index)} className={`group rounded-xl p-3.5 text-left transition ${index === activeNote ? 'bg-accent' : 'hover:bg-accent/60'}`}><div className="flex items-start justify-between gap-3"><h3 className="truncate text-sm font-medium">{item.title}</h3>{item.favorite && <Star className="size-3.5 shrink-0 fill-primary text-primary" />}</div><p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">{item.excerpt}</p><div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Tag className="size-3" />{item.tag}</span><span className="text-[11px] text-muted-foreground">{item.date}</span></div></button>)}</div></div>
          <article className="min-w-0 flex-1 bg-card"><div className="mx-auto flex h-full max-w-3xl flex-col px-6 py-8 md:px-12 md:py-12">{note ? <><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-primary" /> Edited just now</div><div className="flex items-center gap-1"><button aria-label="Favorite note" onClick={toggleFavorite} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Star className={`size-4 ${note.favorite ? 'fill-primary text-primary' : ''}`} /></button><button aria-label="More note options" onClick={() => showNotice('Note options coming soon')} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><MoreHorizontal className="size-4" /></button></div></div><div className="mt-12"><div className="mb-6 flex items-center gap-2 text-xs font-medium text-primary"><BookOpen className="size-3.5" /> {note.tag.toUpperCase()}</div><h2 className="text-balance text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{note.title}</h2><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{note.excerpt}</p><div className="my-9 h-px bg-border" /><div className="space-y-6 text-[15px] leading-7 text-muted-foreground"><p>Welcome to your new thinking space. Use notes to capture ideas, make plans, and keep the details that matter close by.</p><div className="rounded-xl border border-border bg-background p-5"><div className="flex items-start gap-3"><WandSparkles className="mt-1 size-4 shrink-0 text-primary" /><div><p className="font-medium text-foreground">A simple place to start</p><p className="mt-1 text-sm leading-6">Create a note for an idea, a meeting, or anything you want to remember. Your notes stay organized here.</p></div></div></div><p>Everything is ready when you are. Start writing below, or create a new note from the sidebar.</p></div></div></> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No notes found.</div>}<div className="mt-auto flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground"><span>Last edited today at 9:41 AM</span><span>Autosaved</span></div></div></article></div>
        </section>
      </div>
    </main>
  )
}
