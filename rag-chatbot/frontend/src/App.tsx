import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SessionProvider } from './contexts/SessionContext'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SessionProvider>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </SessionProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App