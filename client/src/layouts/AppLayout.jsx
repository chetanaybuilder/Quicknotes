import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import NoteEditor from '../components/NoteEditor.jsx';
import SearchPalette from '../components/SearchPalette.jsx';
import { NotesProvider, useNotes } from '../hooks/useNotes.jsx';

const NAV = [
  { to: '/app', label: 'Home', icon: 'home', end: true },
  { to: '/app/notes', label: 'Notes', icon: 'notes' },
  { to: '/app/history', label: 'History', icon: 'clock' },
  { to: '/app/about', label: 'About', icon: 'info' },
  { to: '/app/profile', label: 'Profile', icon: 'user' },
];

function Shell() {
  const { editor, searchOpen, setSearchOpen, openEditor } = useNotes();
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  const links = NAV.map((n) => (
    <NavLink key={n.to} to={n.to} end={n.end} className="nav__link">
      <Icon name={n.icon} /><span>{n.label}</span>
    </NavLink>
  ));

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <aside className="side">
        <div className="brand"><img src="/favicon.svg" alt="" width="28" height="28" />Quick Notes</div>
        <button className="btn btn--primary btn--block" onClick={() => openEditor()}><Icon name="plus" size={18} />New note</button>
        <button className="side__search" onClick={() => setSearchOpen(true)}>
          <Icon name="search" size={18} />Search<kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>
        <nav className="nav" aria-label="Main">{links}</nav>
      </aside>
      <header className="topbar">
        <div className="brand"><img src="/favicon.svg" alt="" width="26" height="26" />Quick Notes</div>
        <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search notes"><Icon name="search" /></button>
      </header>
      <main id="main" className="main"><Outlet /></main>
      <nav className="bottomnav" aria-label="Main">
        {links.slice(0, 2)}
        <button className="fab" onClick={() => openEditor()} aria-label="New note"><Icon name="plus" size={26} /></button>
        {links.slice(2).filter((_, i) => i !== 1)}
      </nav>
      {editor.open && <NoteEditor key={editor.note?.id ?? 'new'} />}
      {searchOpen && <SearchPalette />}
    </div>
  );
}

export default function AppLayout() {
  return <NotesProvider><Shell /></NotesProvider>;
}
