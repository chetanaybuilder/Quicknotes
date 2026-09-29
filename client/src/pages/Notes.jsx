import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import NoteCard from '../components/NoteCard.jsx';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/Feedback.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { FILTERS, SORTS, searchNotes } from '../utils/filter.js';

export default function Notes() {
  const { notes, status, load, openEditor } = useNotes();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('updated');
  const shown = useMemo(
    () => searchNotes(notes, q).filter(FILTERS[filter]).sort(SORTS[sort].fn),
    [notes, q, filter, sort],
  );

  return (
    <>
      <header className="pagehead"><h1>Notes</h1><p>{notes.length} in your notebook</p></header>
      <div className="toolbar">
        <label className="field"><Icon name="search" size={18} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes" aria-label="Search notes" /></label>
        <div className="chips" role="group" aria-label="Filter notes">
          {[['all', 'All'], ['pinned', 'Pinned'], ['recent', 'Recent'], ['tagged', 'Tagged']].map(([k, l]) => (
            <button key={k} className="pill" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort notes">
          {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>
      {status === 'loading' && <SkeletonGrid />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'ready' && !notes.length && <EmptyState title="Your notebook is waiting for its first thought." text="Write anything down. It saves as you type." action={<button className="btn btn--primary" onClick={() => openEditor()}>Create your first note</button>} />}
      {status === 'ready' && notes.length > 0 && !shown.length && <EmptyState title="No notes match." text="Try a different search or filter." action={<button className="btn" onClick={() => { setQ(''); setFilter('all'); }}>Clear search and filters</button>} />}
      {status === 'ready' && shown.length > 0 && <div className="grid">{shown.map((n) => <NoteCard key={n.id} note={n} />)}</div>}
    </>
  );
}
