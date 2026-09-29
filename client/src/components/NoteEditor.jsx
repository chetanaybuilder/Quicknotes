import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { fullDate } from '../utils/format.js';

const AUTOSAVE_MS = 900;

export default function NoteEditor() {
  const { editor, closeEditor, save, remove } = useNotes();
  const { note: initial } = editor;
  const [draft, setDraft] = useState({ title: '', content: '', tags: [], category: '', is_pinned: false });
  const [tagInput, setTagInput] = useState('');
  const [state, setState] = useState('idle'); // idle | dirty | saving | saved | error
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const idRef = useRef(initial?.id ?? null);
  const meta = useRef({ created: initial?.created_at, updated: initial?.updated_at });
  const latest = useRef(draft);
  const chain = useRef(Promise.resolve());
  const timer = useRef();

  useEffect(() => {
    const d = initial
      ? { title: initial.title, content: initial.content, tags: initial.tags, category: initial.category ?? '', is_pinned: initial.is_pinned }
      : { title: '', content: '', tags: [], category: '', is_pinned: false };
    setDraft(d); latest.current = d;
  }, [initial]);

  const persist = useCallback(() => {
    // Serialized so a new note is created once, then updated.
    chain.current = chain.current.then(async () => {
      const d = latest.current;
      if (!idRef.current && !d.title.trim() && !d.content.trim()) { setState('idle'); return; }
      setState('saving');
      try {
        const saved = await save(idRef.current, { ...d, category: d.category.trim() || null });
        idRef.current = saved.id;
        meta.current = { created: saved.created_at, updated: saved.updated_at };
        setState((s) => (s === 'saving' ? 'saved' : s));
        setError('');
      } catch (e) {
        setState('error'); setError(e.status === 401 ? e.message : 'Couldn’t save your note. Please try again.');
      }
    });
    return chain.current;
  }, [save]);

  const change = (patch) => {
    const next = { ...latest.current, ...patch };
    latest.current = next; setDraft(next); setState('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, AUTOSAVE_MS);
  };

  const close = useCallback(async () => {
    clearTimeout(timer.current);
    if (state === 'dirty' || state === 'error') await persist();
    closeEditor();
  }, [state, persist, closeEditor]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase();
    setTagInput('');
    if (t && !draft.tags.includes(t) && draft.tags.length < 10) change({ tags: [...draft.tags, t] });
  };

  const del = async () => {
    clearTimeout(timer.current);
    try { await chain.current; if (idRef.current) await remove(idRef.current); closeEditor(); }
    catch { setError('Couldn’t delete your note. Please try again.'); setConfirmDelete(false); }
  };

  const label = { idle: '', dirty: 'Unsaved changes', saving: 'Saving…', saved: 'Saved', error: 'Not saved' }[state];

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Note editor">
      <div className="modal__scrim" onClick={close} />
      <section className="sheet">
        <header className="sheet__bar">
          <span className={`save save--${state}`} role="status" aria-live="polite">{label}</span>
          <div className="sheet__actions">
            <button className="icon-btn" onClick={() => change({ is_pinned: !draft.is_pinned })} aria-pressed={draft.is_pinned} aria-label={draft.is_pinned ? 'Unpin note' : 'Pin note'}><Icon name="pin" /></button>
            {idRef.current && <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDelete(true)} aria-label="Delete note"><Icon name="trash" /></button>}
            <button className="btn btn--primary" onClick={close}>Done</button>
          </div>
        </header>
        {error && <p className="form-error" role="alert">{error}</p>}
        <input className="sheet__title" value={draft.title} onChange={(e) => change({ title: e.target.value })} placeholder="Title" aria-label="Title" maxLength={200} autoFocus={!initial} />
        <textarea className="sheet__content" value={draft.content} onChange={(e) => change({ content: e.target.value })} placeholder="Start writing…" aria-label="Content" />
        <div className="sheet__fields">
          <div className="tags">
            {draft.tags.map((t) => (
              <span key={t} className="chip">#{t}<button onClick={() => change({ tags: draft.tags.filter((x) => x !== t) })} aria-label={`Remove tag ${t}`}>×</button></span>
            ))}
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="Add tag" aria-label="Add tag" maxLength={30} />
          </div>
          <input className="category" value={draft.category} onChange={(e) => change({ category: e.target.value })} placeholder="Category (optional)" aria-label="Category" maxLength={40} />
        </div>
        {meta.current.created && (
          <p className="sheet__stamp">Created {fullDate(meta.current.created)} · Updated {fullDate(meta.current.updated)}</p>
        )}
        {confirmDelete && (
          <div className="confirm" role="alertdialog" aria-label="Confirm delete">
            <p>Delete this note permanently?</p>
            <button className="btn" onClick={() => setConfirmDelete(false)}>Keep note</button>
            <button className="btn btn--danger" onClick={del}>Delete note</button>
          </div>
        )}
      </section>
    </div>
  );
}
