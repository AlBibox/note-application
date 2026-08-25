import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'
import { notes } from '@/lib/schema'
import { asc, eq } from 'drizzle-orm'

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('trash') !== 'clear') return NextResponse.json({ error: 'Invalid trash action' }, { status: 400 })
  await db.delete(notes).where(eq(notes.trashed, true))
  return NextResponse.json({ success: true })
}

export async function GET() {
  const result = await db.select().from(notes).orderBy(asc(notes.createdAt))
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const title = typeof body.title === 'string' ? body.title.trim() : 'Untitled note'
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  const [note] = await db.insert(notes).values({
    id: randomUUID(),
    title,
    excerpt: typeof body.excerpt === 'string' ? body.excerpt : '',
    content: typeof body.content === 'string' ? body.content : '',
    tag: typeof body.tag === 'string' ? body.tag : '',
    favorite: typeof body.favorite === 'boolean' ? body.favorite : false,
    archived: typeof body.archived === 'boolean' ? body.archived : false,
    trashed: typeof body.trashed === 'boolean' ? body.trashed : false,
    noteDate: 'Just now',
  }).returning()
  return NextResponse.json(note, { status: 201 })
}
