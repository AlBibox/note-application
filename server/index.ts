import 'dotenv/config'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { db } from '../lib/db'
import { notes } from '../lib/schema'
import { asc, eq } from 'drizzle-orm'

const app = express()
const port = Number(process.env.API_PORT ?? 4000)

app.use(express.json())
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/api/notes', async (_req, res) => {
  const result = await db.select().from(notes).orderBy(asc(notes.createdAt))
  res.json(result)
})

app.post('/api/notes', async (req, res) => {
  const { title = 'Untitled note', excerpt = '', content = '', tag = 'Draft' } = req.body ?? {}
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'Title is required' })
  const [note] = await db.insert(notes).values({ id: randomUUID(), title: title.trim(), excerpt, content, tag, noteDate: 'Just now' }).returning()
  res.status(201).json(note)
})

app.patch('/api/notes/:id', async (req, res) => {
  const allowed = ['title', 'excerpt', 'content', 'tag', 'favorite', 'archived', 'trashed'] as const
  const updates = Object.fromEntries(Object.entries(req.body ?? {}).filter(([key]) => allowed.includes(key as (typeof allowed)[number])))
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid updates provided' })
  const [note] = await db.update(notes).set({ ...updates, updatedAt: new Date() }).where(eq(notes.id, req.params.id)).returning()
  if (!note) return res.status(404).json({ error: 'Note not found' })
  res.json(note)
})

app.delete('/api/notes/:id', async (req, res) => {
  const [note] = await db.update(notes).set({ trashed: true, archived: false, updatedAt: new Date() }).where(eq(notes.id, req.params.id)).returning()
  if (!note) return res.status(404).json({ error: 'Note not found' })
  res.json(note)
})

app.listen(port, () => console.log(`[notes-api] listening on http://localhost:${port}`))
