export const Splash = () => (
  <div className="splash" role="status" aria-live="polite">
    <div className="splash__sheet" />
    <span className="sr-only">Loading Quick Notes</span>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid" aria-busy="true" aria-label="Loading notes">
    {Array.from({ length: count }, (_, i) => <div key={i} className="skeleton" />)}
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="empty">
    <div className="empty__pages" aria-hidden="true"><i /><i /><i /></div>
    <h3>{title}</h3>
    <p>{text}</p>
    {action}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong while loading your notes.', onRetry }) => (
  <div className="empty" role="alert">
    <h3>{message}</h3>
    <p>Your notes are safe. Check your connection and try again.</p>
    <button className="btn btn--primary" onClick={onRetry}>Try again</button>
  </div>
);
