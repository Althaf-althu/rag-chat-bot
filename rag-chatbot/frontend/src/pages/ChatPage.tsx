import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import DocumentManager from '../components/DocumentManager'

const ChatPage: React.FC = () => {
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-white dark:bg-chatBgDark text-gray-900 dark:text-gray-100">
      <Sidebar onOpenDocuments={() => setShowDocs(true)} />
      <ChatArea />
      {showDocs && <DocumentManager onClose={() => setShowDocs(false)} />}
    </div>
  )
}

export default ChatPage;