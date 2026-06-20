import React from 'react'
import { useDocuments } from '../hooks/useDocuments'
import { documentApi } from '../services/documents'

interface DocumentManagerProps {
  onClose: () => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ onClose }) => {
  const { documents, loading, deleteDoc, refresh } = useDocuments();

  const triggerReindex = async () => {
    if (confirm('Reindex database and vector layouts across items?')) {
      await documentApi.reindexAll();
      refresh();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-chatBgDark border border-gray-200 dark:border-gray-700 w-full max-w-3xl rounded-xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Vector Ingestion Store Document Mappings</h3>
          <button onClick={triggerReindex} className="text-xs bg-amber-600 hover:bg-amber-700 text-white py-1 px-3 rounded">
            Re-index All Stores
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">Querying active registry entries...</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500">
                  <th className="py-2">File Identifier Target</th>
                  <th className="py-2">Scale (Bytes)</th>
                  <th className="py-2">State</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800/50">
                    <td className="py-3 font-medium truncate max-w-xs">{d.filename}</td>
                    <td className="py-3 text-gray-500">{d.file_size}</td>
                    <td className="py-3 text-green-500 text-xs font-semibold">{d.status}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => deleteDoc(d.id)} className="text-red-500 hover:text-red-700 transition text-xs font-medium">
                        Delete Tracking Contexts
                      </button>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">No active knowledge bases verified.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">Close Panel</button>
        </div>
      </div>
    </div>
  )
}

export default DocumentManager;