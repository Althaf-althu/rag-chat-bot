import { apiClient } from './api'

export interface DocumentResponse {
  id: string;
  filename: string;
  file_size: number;
  upload_date: string;
  status: string;
}

export const documentApi = {
  getDocuments: async (): Promise<DocumentResponse[]> => {
    const res = await apiClient.get('/documents');
    return res.data;
  },
  
  uploadDocument: async (file: File): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  
  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
  
  reindexAll: async (): Promise<void> => {
    await apiClient.post('/documents/reindex');
  }
}