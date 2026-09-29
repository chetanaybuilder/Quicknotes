import { useMemo, useState } from 'react';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/Feedback.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { searchNotes } from '../utils/filter.js';
import { dayLabel, preview } from '../utils/format.js';

/** Derive timeline events from stored timestamps: one "created" and, if changed later, one "edited". */
function toEvents(notes) {
  return notes.flatMap((n) => {
    const ev = [{ id: `${n.id}-c`, kind: 'created', at: n.created_at, note: n }];
    if (new Date(n.updated_at) - new Date(n.created_at) > 60_000) ev.push({ id: `${n.id}-e`, kind: 'edited', at: n.updated_at, note: n });
    return ev;
  });
}

export default function History() {
  const { notes, status, load, openEditor } = useNotes();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const [order, setOrder] = useState('new');

  const groups = useMemo(() => {
    const ev = toEvents(searchNotes(notes, q)).filter((e) => kind === 'all' || e.kind === kind)
      .sort((a, b) => (order === 'new' ? 1 : -1) * (new Date(b.at) - new Date(a.at)));
    const map = new Map();
    ev.forEach((e) => { const k = dayLabel(e.at); map.set(k, [...(map.get(k) ?? []), e]); });
    return [...map];
  }, [notes, q, kind, order]);

  return (
    <>
      <header className="pagehead"><h1>History</h1><p>When you created and edited your notes</p></header>
      <div className="toolbar">
        <label className="field"><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history" aria-label="Search history" /></label>
        <div className="chips" role="group" aria-label="Filter activity">
          {[['all', 'All'], ['created', 'Created'], ['edited', 'Edited']].map(([k, l]) => <button key={k} className="pill" aria-pressed={kind === k} onClick={() => setKind(k)}>{l}</button>)}
        </div>
        <select value={order} onChange={(e) => setOrder(e.target.value)} aria-label="Sort history"><option value="new">Newest first</option><option value="old">Oldest first</option></select>
      </div>
      {status === 'loading' && <SkeletonGrid count={3} />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'ready' && !groups.length && <EmptyState title={notes.length ? 'No activity matches.' : 'No history yet.'} text={notes.length ? 'Try a different search or filter.' : 'Notes you create and edit will appear here.'} />}
      {status === 'ready' && groups.map(([day, evs]) => (
        <section key={day} className="timeline">
          <h2>{day}</h2>
          <ol>{evs.map((e) => (
            <li key={e.id} className={`ev ev--${e.kind}`}>
              <button onClick={() => openEditor(e.note)}>
                <span className="ev__time">{new Date(e.at).toLocaleTimeString('en', { timeStyle: 'short' })}</span>
                <strong>{e.kind === 'created' ? 'Created' : 'Edited'} “{e.note.title || 'Untitled note'}”</strong>
                <span>{preview(e.note.content, 90)}</span>
              </button>
            </li>))}
          </ol>
        </section>
      ))}
    </>
  );
}
