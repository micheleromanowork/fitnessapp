'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Dumbbell, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', { email, callbackUrl: '/home' })
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                        bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <Dumbbell size={36} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold gradient-text">FitOS</h1>
          <p className="text-t2 mt-2 text-base">Il tuo allenatore personale</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="La tua email"
          required
          className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-base focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full btn-primary flex items-center justify-center min-h-[52px] rounded-xl text-base font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Accedi'}
        </button>
      </form>
    </div>
  )
}
