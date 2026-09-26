'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { useProfile } from '@/stores/profile'
import { t } from '@/i18n'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function CoachPage() {
  const lang = useProfile(s => s.language)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const suggestions = t(lang, 'coach.suggestions')
  const suggList: string[] = Array.isArray(suggestions) ? suggestions : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text?: string) {
    const msg = text ?? input.trim()
    if (!msg || streaming) return
    setInput('')

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setStreaming(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const ct = res.headers.get('content-type') ?? ''

      if (ct.includes('text/event-stream') && res.body) {
        // SSE streaming
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
            try {
              const json = JSON.parse(line.slice(6))
              const delta = json.choices?.[0]?.delta?.content ?? ''
              if (delta) {
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + delta } : m
                ))
              }
            } catch { /* skip malformed */ }
          }
        }
      } else {
        // JSON fallback
        const data = await res.json()
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: data.content ?? '' } : m
        ))
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: '⚠️ ' + (lang === 'it' ? 'Errore di connessione.' : 'Connection error.') } : m
      ))
    }
    setStreaming(false)
  }

  return (
    <div className="flex flex-col h-[100dvh] pb-[calc(64px+env(safe-area-inset-bottom,0px))]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-6 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-t1 font-bold">{t(lang, 'nav.coach')}</h1>
            <p className="text-t3 text-xs">{lang === 'it' ? 'Powered by Groq · LLaMA 3' : 'Powered by Groq · LLaMA 3'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="card-2 px-4 py-3 text-sm text-t2 max-w-[85%]">
                {lang === 'it'
                  ? 'Ciao! Sono il tuo Coach AI. Analizzando i tuoi dati di allenamento posso darti consigli personalizzati. Come posso aiutarti?'
                  : 'Hi! I\'m your AI Coach. By analyzing your training data I can give you personalized advice. How can I help you?'}
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex flex-col gap-2 ml-11">
              {suggList.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="card-2 px-4 py-2.5 text-sm text-t2 text-left hover:text-t1 transition-colors active:scale-[0.98]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              m.role === 'user' ? 'bg-primary/20' : 'bg-white/[0.06]'
            }`}>
              {m.role === 'user'
                ? <User size={15} className="text-primary" />
                : <Bot size={15} className="text-t3" />
              }
            </div>
            <div className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] leading-relaxed ${
              m.role === 'user'
                ? 'bg-primary text-white rounded-tr-sm'
                : 'card-2 text-t2 rounded-tl-sm'
            }`}>
              {m.content || (streaming ? (
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-t3 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              ) : '…')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.06] bg-[rgba(10,10,15,0.92)] backdrop-blur-xl">
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1 h-11 text-sm"
            placeholder={t(lang, 'coach.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={streaming}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || streaming}
            className="btn-primary w-11 h-11 p-0 flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
