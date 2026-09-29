import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notesApi } from '../services/api.js';

const NotesContext = createContext(null);
export const useNotes = () => useContext(NotesContext);

const upsert = (list, note) => [note, ...list.filter((n) => n.id !== note.id)];

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [editor, setEditor] = useState({ open: false, note: null });
  const [searchOpen, setSearchOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try { setNotes((await notesApi.list()).notes); setStatus('ready'); }
    catch { setStatus('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (id, data) => {
    const { note } = id ? await notesApi.update(id, data) : await notesApi.create(data);
    setNotes((l) => upsert(l, note));
    return note;
  }, []);

  const remove = useCallback(async (id) => {
    await notesApi.remove(id);
    setNotes((l) => l.filter((n) => n.id !== id));
  }, []);

  const togglePin = useCallback((note) => save(note.id, { is_pinned: !note.is_pinned }), [save]);

  const value = useMemo(() => ({
    notes, status, load, save, remove, togglePin,
    editor, openEditor: (note = null) => setEditor({ open: true, note }), closeEditor: () => setEditor({ open: false, note: null }),
    searchOpen, setSearchOpen,
  }), [notes, status, load, save, remove, togglePin, editor, searchOpen]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
