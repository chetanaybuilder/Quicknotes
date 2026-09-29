const STACK = [['React 18 + Vite', 'Single-page UI with lazy-loaded routes'], ['Plain CSS', 'Design tokens and CSS 3D transforms, no UI framework'], ['Express', 'Small API with server-side authorization'], ['Neon PostgreSQL', 'Users, sessions and notes with per-user indexes']];

export default function About() {
  return (
    <>
      <header className="pagehead"><h1>About Quick Notes</h1><p>A personal notebook that stays out of your way</p></header>
      <div className="prose">
        <section className="paper"><h2>What it is</h2><p>Quick Notes is a private digital notebook. Write, tag, pin, search and revisit your notes from your phone or your desk.</p></section>
        <section className="paper"><h2>Why it exists</h2><p>Most notes apps do too much. This one aims to make capturing a thought take seconds and finding it again take even less.</p></section>
        <section className="paper"><h2>Privacy and security</h2>
          <ul>
            <li>Sign in with Google. No passwords are stored.</li>
            <li>Sessions use HTTP-only cookies; only a hash of the token is kept in the database.</li>
            <li>Every query is scoped to your account, so no one can open your notes by guessing an ID.</li>
            <li>Notes are not end-to-end encrypted. They are stored in plain text in the database.</li>
          </ul>
        </section>
        <section className="paper"><h2>Built with</h2><dl>{STACK.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section>
      </div>
    </>
  );
}
