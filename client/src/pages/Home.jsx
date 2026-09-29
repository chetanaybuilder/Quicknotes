import { useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import NoteCard from '../components/NoteCard.jsx';
import { EmptyState, ErrorState, SkeletonGrid } from '../components/Feedback.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { greeting } from '../utils/format.js';
import { SORTS } from '../utils/filter.js';

const Section = ({ title, notes }) => notes.length > 0 && (
  <section className="block"><h2>{title}</h2><div className="grid">{notes.map((n) => <NoteCard key={n.id} note={n} />)}</div></section>
);

export default function Home() {
  const { user } = useAuth();
  const { notes, status, load, openEditor, setSearchOpen } = useNotes();
  const week = useMemo(() => notes.filter((n) => Date.now() - new Date(n.created_at) < 7 * 864e5).length, [notes]);
  const recent = useMemo(() => [...notes].sort(SORTS.created.fn).slice(0, 4), [notes]);
  const edited = useMemo(() => notes.slice(0, 4), [notes]); // API returns newest-edited first
  const pinned = useMemo(() => notes.filter((n) => n.is_pinned).slice(0, 4), [notes]);

  return (
    <>
      <header className="pagehead">
        <h1>{greeting()}, {user.name?.split(' ')[0] ?? 'there'}</h1>
        {status === 'ready' && <p>{week === 1 ? '1 note captured this week' : `${week} notes captured this week`}</p>}
      </header>
      <div className="actions">
        <button className="btn btn--primary" onClick={() => openEditor()}><Icon name="plus" size={18} />Create note</button>
        <button className="btn" onClick={() => setSearchOpen(true)}><Icon name="search" size={18} />Search notes</button>
      </div>
      {status === 'loading' && <SkeletonGrid count={4} />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'ready' && !notes.length && (
        <EmptyState title="Your notebook is waiting for its first thought." text="Write anything down. It saves as you type." action={<button className="btn btn--primary" onClick={() => openEditor()}>Create your first note</button>} />
      )}
      {status === 'ready' && <>
        <Section title="Pinned notes" notes={pinned} />
        <Section title="Recent notes" notes={recent} />
        <Section title="Recently edited" notes={edited} />
      </>}
    </>
  );
}
