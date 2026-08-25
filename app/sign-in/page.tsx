'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { signIn } from '@/lib/auth-client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError('Unable to sign in. Check your email and password.')
        return
      }
      window.location.assign('/')
    } catch (error) {
      console.error('[v0] Sign-in failed:', error)
      setError('Unable to sign in. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 font-sans text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold text-primary">noted</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in to return to your notes.</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring" autoComplete="email" /></label>
          <label className="flex flex-col gap-2 text-sm font-medium">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring" autoComplete="current-password" /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="mt-2 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">New to noted? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link></p>
      </section>
    </main>
  )
}
