import React, { useEffect, useRef, useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm your assistant. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // bot reply (placeholder)
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: `You said: "${text}"` }]);
    }, 600);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Toggle button */}
      <button
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl shadow-lg hover:scale-110 transition-transform"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        💬
      </button>

      {/* Chat window */}
      {open && (
        <div className="mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-white text-xl font-bold">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`px-4 py-2 rounded-lg max-w-[75%] break-words
                  ${m.from === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex border-t border-gray-200 p-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
