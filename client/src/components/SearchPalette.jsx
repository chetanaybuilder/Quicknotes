import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotes } from '../hooks/useNotes.jsx';
import { searchNotes } from '../utils/filter.js';
import { preview, timeAgo } from '../utils/format.js';

export default function SearchPalette() {
  const { notes, setSearchOpen, openEditor } = useNotes();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef();
  const results = useMemo(() => searchNotes(notes, q).slice(0, 8), [notes, q]);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => setActive(0), [q]);

  const open = (n) => { setSearchOpen(false); openEditor(n); };
  const onKey = (e) => {
    if (e.key === 'Escape') setSearchOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) open(results[active]);
  };

  return (
    <div className="modal modal--top" role="dialog" aria-modal="true" aria-label="Search notes" onKeyDown={onKey}>
      <div className="modal__scrim" onClick={() => setSearchOpen(false)} />
      <div className="palette">
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, content and tags" aria-label="Search notes" role="combobox" aria-expanded="true" aria-controls="search-results" />
        <ul id="search-results" role="listbox">
          {results.map((n, i) => (
            <li key={n.id} role="option" aria-selected={i === active}>
              <button className={i === active ? 'is-active' : ''} onClick={() => open(n)} onMouseMove={() => setActive(i)}>
                <strong>{n.title || 'Untitled note'}</strong>
                <span>{preview(n.content, 80) || 'No content'}</span>
                <time>{timeAgo(n.updated_at)}</time>
              </button>
            </li>
          ))}
        </ul>
        {!results.length && <p className="palette__empty">{q ? `No notes match “${q}”.` : notes.length ? 'Start typing to search.' : 'You have no notes to search yet.'}</p>}
      </div>
    </div>
  );
}
