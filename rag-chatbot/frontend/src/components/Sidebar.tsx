import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSession, ChatSession } from '../contexts/SessionContext'
import { useTheme } from '../hooks/useTheme'

interface SidebarProps {
  onOpenDocuments: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenDocuments }) => {
  const { sessions, currentSessionId, createNewSession, selectSession, deleteSessionContexts } = useSession();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-900 text-gray-200 flex flex-col h-screen border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex flex-col gap-2">
        <button 
          onClick={() => { navigate('/'); createNewSession(); }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">History</div>
        {sessions.map((s: ChatSession) => (
          <div 
            key={s.id}
            onClick={() => { navigate('/'); selectSession(s.id); }}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${currentSessionId === s.id && location.pathname === '/' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50'}`}
          >
            <div className="truncate text-sm font-medium pr-2 flex-1">{s.title}</div>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteSessionContexts(s.id); }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800 space-y-2 text-sm">
        <button onClick={onOpenDocuments} className="w-full text-left py-2 px-3 hover:bg-gray-800 rounded-md transition flex items-center gap-2">
          📁 Document Manager
        </button>
        <button onClick={() => navigate('/settings')} className="w-full text-left py-2 px-3 hover:bg-gray-800 rounded-md transition flex items-center gap-2">
          ⚙️ Settings Panel
        </button>
        <button onClick={toggleTheme} className="w-full text-left py-2 px-3 hover:bg-gray-800 rounded-md transition flex items-center gap-2">
          {theme === 'light' ? '🌙 Dark Interface' : '☀️ Light Interface'}
        </button>
      </div>
    </div>
  )
}

export default Sidebar;