import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNotes } from '../hooks/useNotes.jsx';
import { fullDate } from '../utils/format.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const { notes } = useNotes();
  const nav = useNavigate();

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'quick-notes-export.json' });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <header className="pagehead"><h1>Profile</h1></header>
      <section className="paper profile">
        {user.picture ? <img src={user.picture} alt="" width="72" height="72" referrerPolicy="no-referrer" /> : <div className="avatar">{(user.name || user.email)[0]}</div>}
        <div><h2>{user.name || 'Quick Notes user'}</h2><p>{user.email}</p><p className="muted">Member since {fullDate(user.created_at)}</p></div>
      </section>
      <section className="paper settings">
        <h2>Settings</h2>
        <Link className="btn" to="/app/about">About Quick Notes</Link>
        <button className="btn" onClick={exportNotes} disabled={!notes.length}><Icon name="download" size={18} />Export notes as JSON</button>
        <button className="btn btn--danger" onClick={async () => { await logout(); nav('/', { replace: true }); }}><Icon name="logout" size={18} />Log out</button>
      </section>
    </>
  );
}
