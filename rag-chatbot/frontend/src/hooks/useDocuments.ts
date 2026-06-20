import { useState, useEffect } from 'react'
import { documentApi, DocumentResponse } from '../services/documents'

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentApi.getDocuments();
      setDocuments(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed fetching collection indexes.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const newDoc = await documentApi.uploadDocument(file);
      setDocuments(prev => [newDoc, ...prev]);
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Upload pipeline blockages verified.');
    }
  };

  const deleteDoc = async (id: string) => {
    try {
      await documentApi.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed document tracking erasure context.');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return { documents, loading, error, refresh: fetchDocuments, uploadFile, deleteDoc };
};