import React, { useState } from 'react'

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const executeUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Processing and ingestion engine failures encountered.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-chatBgDark border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold mb-4">Ingest Document</h3>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition relative">
          <input type="file" accept=".pdf,.docx,.txt,.md" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          <p className="text-sm text-gray-500">{file ? `Selected: ${file.name}` : 'Click or drop PDF, DOCX, TXT, or MD files here'}</p>
        </div>

        {error && <div className="text-red-500 text-xs mt-2 bg-red-500/10 p-2 rounded">{error}</div>}
        
        {uploading && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full animate-pulse rounded-full" style={{ width: '70%' }}></div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button disabled={uploading} onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">Cancel</button>
          <button disabled={!file || uploading} onClick={executeUpload} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-400">
            {uploading ? 'Processing...' : 'Upload & Index'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadModal;