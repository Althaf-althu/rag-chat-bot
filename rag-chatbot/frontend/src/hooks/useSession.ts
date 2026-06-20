import { useContext } from 'react'
import { SessionContext, SessionContextProps } from '../contexts/SessionContext'

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession tracking mapped failures outside explicit providers.');
  return context;
};