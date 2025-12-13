import React, { useEffect, useRef, useState } from 'react'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm your assistant. How can I help?" }
  ])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    const userMsg = { from: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: `You said: "${text}"` }])
    }, 600)
  }

  return (
    <div className="fixed -right-50 -bottom-72 z-50">
      <button
        type="button"
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen(v => !v)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        💬
      </button>

      <div
        role="dialog"
        aria-hidden={!open}
        className={`mt-3 transform transition-all duration-200 origin-bottom-right ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="w-80 max-w-xs bg-white dark:bg-neutral-900 rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden flex flex-col">
          <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h3 className="text-sm font-semibold">Assistant</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([{ from: 'bot', text: "Hi! I'm your assistant. How can I help?" }])}
                className="text-sm px-2 py-1 bg-white/20 rounded hover:bg-white/25"
              >Reset</button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ml-1 p-1 rounded hover:bg-white/20"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-white dark:bg-neutral-900" style={{ minHeight: 180 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100'} px-3 py-2 rounded-lg max-w-[80%]`}>{m.text}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-md border border-gray-200 text-white dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
