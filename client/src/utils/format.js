const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(iso) {
  const s = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, secs] of steps) if (Math.abs(s) >= secs) return rtf.format(Math.round(s / secs), unit);
  return 'just now';
}

export const fullDate = (iso) =>
  new Date(iso).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' });

export const dayLabel = (iso) =>
  new Date(iso).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });

export function greeting(date = new Date()) {
  const h = date.getHours();
  return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export const preview = (text, n = 140) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n).trimEnd()}…` : t;
};

/** Stable tint (0-3) for a note so cards vary without looking random. */
export function tintFor(note) {
  const key = note.category || note.id;
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 4;
}
