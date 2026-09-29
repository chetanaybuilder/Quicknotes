import { Link } from 'react-router-dom';
import GoogleButton from '../components/GoogleButton.jsx';
import Notebook3D from '../components/Notebook3D.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const FEATURES = [
  ['Write fast', 'Open a page and start typing. Everything autosaves and tells you when it has.'],
  ['Find anything', 'Search titles, content and tags as you type, from anywhere with Ctrl/Cmd K.'],
  ['Keep it yours', 'Sign in with Google. Your notes live in your own private space.'],
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="brand"><img src="/favicon.svg" alt="" width="28" height="28" />Quick Notes</div>
        <Link className="btn btn--ghost" to={user ? '/app' : '/login'}>{user ? 'Open notebook' : 'Log in'}</Link>
      </header>
      <section className="hero">
        <div className="hero__copy">
          <h1>Your thoughts.<br />Organized beautifully.</h1>
          <p>Capture ideas, organize your knowledge, and return to your thoughts whenever you need them.</p>
          <div className="hero__cta">
            {user ? <Link className="btn btn--primary" to="/app">Open your notebook</Link> : <GoogleButton />}
            <a className="btn btn--ghost" href="#explore">Explore Quick Notes</a>
          </div>
        </div>
        <Notebook3D />
      </section>
      <section id="explore" className="explore">
        <h2>A notebook that keeps up with you</h2>
        <div className="explore__grid">
          {FEATURES.map(([t, d]) => <article key={t} className="paper"><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </section>
      <footer className="landing__foot">Quick Notes · React, Express and Neon PostgreSQL</footer>
    </div>
  );
}
