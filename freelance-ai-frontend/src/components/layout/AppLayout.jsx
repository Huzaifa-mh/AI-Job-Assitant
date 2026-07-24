import Sidebar      from './Sidebar';
import Topbar       from './Topbar';
import ToastContainer from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import { createContext, useContext } from 'react';

// Make toast available to all pages via context
const ToastContext = createContext(null);
export const useAppToast = () => useContext(ToastContext);

export default function AppLayout({ children }) {
  const { toasts, toast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>

        {/* Sidebar — fixed left */}
        <Sidebar />

        {/* Main content area */}
        <div style={{
          marginLeft: 'var(--sidebar-width)',
          flex:       1,
          display:    'flex',
          flexDirection:'column',
          minHeight:  '100vh',
          minWidth:   0,
        }}>

          {/* Sticky top bar */}
          <Topbar />

          {/* Page content */}
          <main style={{
            flex:       1,
            padding:    '28px 32px',
            maxWidth:   '100%',
            overflowX:  'hidden',
          }}>
            {children}
          </main>
        </div>

        {/* Global toast notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}