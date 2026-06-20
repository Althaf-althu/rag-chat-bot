import React, { createContext, useState, useEffect } from 'react'

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

export interface SessionContextProps {
  sessions: ChatSession[];
  currentSessionId: string;
  createNewSession: () => string;
  selectSession: (id: string) => void;
  deleteSessionContexts: (id: string) => void;
}

export const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const useSession = () => {
  const context = React.useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('current_session_id');
    return saved || '';
  });

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('current_session_id', currentSessionId);
  }, [currentSessionId]);

  const createNewSession = () => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: `Conversation Session ${sessions.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    return newId;
  };

  const selectSession = (id: string) => setCurrentSessionId(id);

  const deleteSessionContexts = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId('');
    }
  };

  return (
    <SessionContext.Provider value={{ sessions, currentSessionId, createNewSession, selectSession, deleteSessionContexts }}>
      {children}
    </SessionContext.Provider>
  )
}