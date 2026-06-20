import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../services/chat'
import { useSession } from '../contexts/SessionContext'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId } = useSession();
  
  const [model, setModel] = useState(() => localStorage.getItem('setting_model_id') || 'mistralai/Mistral-7B-Instruct-v0.3');
  const [chunkSize, setChunkSize] = useState(() => Number(localStorage.getItem('setting_chunk_size') || '512'));
  const [overlap, setOverlap] = useState(() => Number(localStorage.getItem('setting_chunk_overlap') || '50'));
  const [topK, setTopK] = useState(() => Number(localStorage.getItem('setting_top_k') || '5'));

  const saveConfigurationSettings = () => {
    localStorage.setItem('setting_model_id', model);
    localStorage.setItem('setting_chunk_size', chunkSize.toString());
    localStorage.setItem('setting_chunk_overlap', overlap.toString());
    localStorage.setItem('setting_top_k', topK.toString());
    navigate('/');
  };

  const handleWipeHistory = async () => {
    if (confirm('Erase conversion index records?')) {
      if (currentSessionId) {
        await chatApi.clearHistory(currentSessionId);
        alert('Active sessions historical tracks cleared.');
      }
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6 text-sm">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold">RAG Hyperparameters Workspace</h2>
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">✕ Close</button>
      </div>

      <div className="space-y-2">
        <label className="font-semibold block">Hugging Face Model Selection</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-gray-50 border p-2 rounded dark:bg-gray-800">
          <option value="mistralai/Mistral-7B-Instruct-v0.3">mistralai/Mistral-7B-Instruct-v0.3</option>
          <option value="meta-llama/Llama-3.1-8B-Instruct">meta-llama/Llama-3.1-8B-Instruct</option>
          <option value="Qwen/Qwen2.5-7B-Instruct">Qwen/Qwen2.5-7B-Instruct</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="font-semibold block">Chunk Target Size Tokens: {chunkSize}</label>
        <input type="range" min={128} max={2048} step={64} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))} className="w-full" />
      </div>

      <div className="space-y-1">
        <label className="font-semibold block">Chunk Mapped Overlap Tokens: {overlap}</label>
        <input type="range" min={0} max={500} step={10} value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} className="w-full" />
      </div>

      <div className="space-y-1">
        <label className="font-semibold block">Vector Retrieval Limit Top-K Chunks: {topK}</label>
        <input type="range" min={1} max={15} value={topK} onChange={(e) => setTopK(Number(e.target.value))} className="w-full" />
      </div>

      <div className="pt-4 border-t flex justify-between">
        <button onClick={handleWipeHistory} className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition">
          Clear Conversation History
        </button>
        <button onClick={saveConfigurationSettings} className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition">
          Save Adjustments
        </button>
      </div>
    </div>
  )
}

export default SettingsPage;