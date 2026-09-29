import { memo } from 'react';
import Icon from './Icon.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { timeAgo, preview } from '../utils/format.js';

function NoteCard({ note }) {
  const { openEditor, remove } = useNotes();

  const onKey = (e) => {
    if (e.key === 'Enter') openEditor(note);
    if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); remove(note.id); }
  };

  const tint = (note.id.charCodeAt(0) + note.id.charCodeAt(note.id.length - 1)) % 4;

  return (
    <div className={`card tint-${tint}`}>
      {note.is_pinned && <div className="card__bookmark" aria-hidden="true" />}
      <button className="card__body" onClick={() => openEditor(note)} onKeyDown={onKey} aria-label={`Edit ${note.title || 'Untitled note'}`}>
        <h3>{note.title || 'Untitled note'}</h3>
        <p>{preview(note.content)}</p>
      </button>
      <div className="card__meta">
        {note.category && <span className="chip chip--cat">{note.category}</span>}
        {note.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
      </div>
      <div className="card__foot">
        <time dateTime={note.updated_at}>{timeAgo(note.updated_at)}</time>
        <button className="icon-btn" onClick={() => remove(note.id)} aria-label="Delete note"><Icon name="trash" size={16} /></button>
      </div>
    </div>
  );
}

export default memo(NoteCard);
