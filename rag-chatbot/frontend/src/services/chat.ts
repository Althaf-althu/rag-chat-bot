import { apiClient } from './api'

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}

export interface ChatParameters {
  message: string;
  session_id: string;
  model_id?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  top_k?: number;
}

export const chatApi = {
  getHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get(`/chat/history?session_id=${sessionId}`);
    return res.data;
  },
  
  clearHistory: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/chat/history?session_id=${sessionId}`);
  }
}