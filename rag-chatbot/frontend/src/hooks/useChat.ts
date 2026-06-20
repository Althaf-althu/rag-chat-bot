import { useState, useEffect, useRef } from 'react'
import { chatApi, ChatMessage } from '../services/chat'
import { useSession } from './useSession'

export const useChat = () => {
  const { currentSessionId, createNewSession } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState<boolean>(false);
  const streamingTextRef = useRef<string>('');

  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }
    chatApi.getHistory(currentSessionId)
      .then(res => setMessages(res))
      .catch(() => setMessages([]));
  }, [currentSessionId]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = createNewSession();
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    streamingTextRef.current = '';

    const assistantMsgId = crypto.randomUUID();
    const placeholderAssistant: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, placeholderAssistant]);

    // Construct request payloads parsing user configuration preferences from storage locations
    const config_chunk_size = Number(localStorage.getItem('setting_chunk_size') || '512');
    const config_chunk_overlap = Number(localStorage.getItem('setting_chunk_overlap') || '50');
    const config_top_k = Number(localStorage.getItem('setting_top_k') || '5');
    const config_model = localStorage.getItem('setting_model_id') || 'mistralai/Mistral-7B-Instruct-v0.3';

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: activeSessionId,
          model_id: config_model,
          chunk_size: config_chunk_size,
          chunk_overlap: config_chunk_overlap,
          top_k: config_top_k
        })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              setStreaming(false);
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                streamingTextRef.current += `\n[System Error]: ${parsed.error}`;
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: streamingTextRef.current } : m));
              } else if (parsed.token) {
                streamingTextRef.current += parsed.token;
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: streamingTextRef.current } : m));
              }
              if (parsed.metadata) {
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, id: parsed.metadata.id, citations: parsed.metadata.citations } : m));
              }
            } catch (e) {
              // Gracefully pass parsing metrics over internal spaces
            }
          }
        }
      }
    } catch (err) {
      setStreaming(false);
    } finally {
      setStreaming(false);
    }
  };

  return { messages, sendMessage, streaming };
};