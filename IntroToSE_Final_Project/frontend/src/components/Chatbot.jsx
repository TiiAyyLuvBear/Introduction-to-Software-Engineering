import React, { useEffect, useRef, useState } from 'react'

export default function Chatbot(){
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

    // naive bot reply (placeholder). Replace with API call if available.
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: `You said: "${text}"` }])
    }, 600)
  }

  return (
    <div className={`chatbot ${open ? 'open' : ''}`}>
      <button
        className="chatbot-toggle"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        💬
      </button>

      <div className="chatbot-window" role="dialog" aria-hidden={!open}>
        <div className="chatbot-header">
          <div className="chatbot-title">Assistant</div>
          <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>

        <div className="chatbot-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.from}`}>
              <div className="message-text">{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
            placeholder="Type a message..."
          />
          <button className="btn btn-primary" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}
