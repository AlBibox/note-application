'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const result = await signUp.email({ name, email, password })
    setLoading(false)
    if (result.error) {
      setError('Unable to create your account. Check your details and try again.')
      return
    }
    setSubmitted(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 font-sans text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">noted</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Keep your ideas organized in one quiet workspace.</p>
        </div>
        {submitted ? (
          <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="text-lg font-semibold">Check your inbox</h2>
            <p className="text-sm leading-6 text-muted-foreground">We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Verify your email before signing in.</p>
            <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">Go to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring" autoComplete="name" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring" autoComplete="email" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring" autoComplete="new-password" /></label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button disabled={loading} className="mt-2 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/sign-in" className="font-medium text-primary hover:underline">Sign in</Link></p>
      </section>
    </main>
  )
}
