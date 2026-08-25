import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notes } from '@/lib/schema'
import { eq } from 'drizzle-orm'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const allowed = ['title', 'excerpt', 'content', 'tag', 'favorite', 'archived', 'trashed'] as const
  const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key as (typeof allowed)[number])))
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
  const [note] = await db.update(notes).set({ ...updates, updatedAt: new Date() }).where(eq(notes.id, id)).returning()
  return note ? NextResponse.json(note) : NextResponse.json({ error: 'Note not found' }, { status: 404 })
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params
  const [note] = await db.update(notes).set({ trashed: true, tag: '', updatedAt: new Date() }).where(eq(notes.id, id)).returning()
  return note ? NextResponse.json(note) : NextResponse.json({ error: 'Note not found' }, { status: 404 })
}
