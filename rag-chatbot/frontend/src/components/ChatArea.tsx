import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import UploadModal from './UploadModal'
import { useDocuments } from '../hooks/useDocuments'

const ChatArea: React.FC = () => {
  const { messages, sendMessage, streaming } = useChat();
  const { uploadFile } = useDocuments();
  const [input, setInput] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 dark:bg-chatBgDark">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl rounded-xl p-4 shadow-sm text-sm border ${m.role === 'user' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'}`}>
              <div className="whitespace-pre-wrap font-sans leading-relaxed">{m.content}</div>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">Grounding Citations:</span>
                  {m.citations.map((c, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-medium px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600">
                      📄 {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex gap-1 items-center shadow-sm">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white dark:bg-chatBgDark border-t border-gray-200 dark:border-gray-800 flex gap-2 items-end">
        <button onClick={() => setShowUpload(true)} className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition" title="Index new reference material">
          ➕
        </button>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Query connected document knowledge indexes..."
          className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none max-h-36"
          rows={1}
        />
        <button disabled={streaming} onClick={handleSend} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition">
          Query
        </button>
      </div>

      {showUpload && <UploadModal onUpload={uploadFile} onClose={() => setShowUpload(false)} />}
    </div>
  )
}

export default ChatArea;