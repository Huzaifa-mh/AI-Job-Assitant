import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { athenaAPI } from '../../services/api';

const AthenaContext = createContext(null);
export const useAthena = () => useContext(AthenaContext);

const HISTORY_LIMIT = 10;

const storageKeyFor = (user) => (user ? `athena_chat_${user.user_id}` : null);

const loadMessages = (key) => {
  if (!key) return [];
  try { return JSON.parse(sessionStorage.getItem(key) || '[]'); }
  catch { return []; }
};

const friendlyError = (error) => {
  if (!error.response) return "I couldn't reach the server. Check your connection and try again.";
  const status = error.response.status;
  if (status === 429) return "I'm getting a lot of requests right now — please try again in a moment.";
  if (status === 504) return 'That took too long to answer. Please try again.';
  if (status >= 500) return "I'm temporarily unavailable. Please try again shortly.";
  return error.response.data?.message || 'Something went wrong. Please try again.';
};

export function AthenaProvider({ children }) {
  const { user } = useAuth();
  const storageKey = storageKeyFor(user);

  const [messages, setMessages]     = useState(() => loadMessages(storageKey));
  const [isOpen, setIsOpen]         = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending]   = useState(false);
  const [hasUnread, setHasUnread]   = useState(false);

  // Reload/clear conversation whenever the logged-in user changes (e.g. logout/login).
  useEffect(() => {
    setMessages(loadMessages(storageKey));
    setIsOpen(false);
    setIsMinimized(false);
    setHasUnread(false);
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const markRevealDone = (id) => {
    setMessages(m => m.map(msg => (msg.id === id ? { ...msg, animate: false } : msg)));
  };

  const requestReply = async (historyBase, userText) => {
    const placeholderId = crypto.randomUUID();
    setMessages(m => [...m, { id: placeholderId, role: 'assistant', content: '', pending: true, animate: false }]);
    setIsSending(true);

    const history = historyBase
      .filter(m => !m.pending && !m.isError)
      .map(({ role, content }) => ({ role, content }))
      .slice(-HISTORY_LIMIT);

    try {
      const { data } = await athenaAPI.chat({ message: userText, history });
      setMessages(m => m.map(msg => (
        msg.id === placeholderId ? { ...msg, content: data.content, pending: false, animate: true } : msg
      )));
      if (!isOpen || isMinimized) setHasUnread(true);
    } catch (error) {
      setMessages(m => m.map(msg => (
        msg.id === placeholderId ? { ...msg, content: friendlyError(error), pending: false, isError: true } : msg
      )));
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: trimmed, animate: false };
    setMessages(m => [...m, userMsg]);
    requestReply([...messages, userMsg], trimmed);
  };

  const regenerate = () => {
    if (isSending) return;
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    const idx = messages.length - 1 - lastUserIdx;
    const truncated = messages.slice(0, idx + 1);
    const userText = messages[idx].content;
    setMessages(truncated);
    requestReply(truncated, userText);
  };

  const clearChat = () => {
    setMessages([]);
    setHasUnread(false);
    if (storageKey) sessionStorage.removeItem(storageKey);
  };

  const toggleOpen = () => {
    setIsOpen(o => !o);
    setIsMinimized(false);
    setHasUnread(false);
  };

  const closePanel = () => setIsOpen(false);

  const toggleMinimize = () => {
    setIsMinimized(m => !m);
    setHasUnread(false);
  };

  return (
    <AthenaContext.Provider value={{
      messages, isOpen, isMinimized, isSending, hasUnread,
      sendMessage, regenerate, clearChat, toggleOpen, closePanel, toggleMinimize, markRevealDone,
    }}>
      {children}
    </AthenaContext.Provider>
  );
}
