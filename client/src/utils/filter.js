/** Instant client-side search across title, content and tags. */
export function searchNotes(notes, q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return notes;
  return notes.filter((n) => {
    const hay = `${n.title} ${n.content} ${n.tags.join(' ')} ${n.category ?? ''}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

const time = (n, k) => new Date(n[k]).getTime();
export const SORTS = {
  updated: { label: 'Recently edited', fn: (a, b) => time(b, 'updated_at') - time(a, 'updated_at') },
  created: { label: 'Recently created', fn: (a, b) => time(b, 'created_at') - time(a, 'created_at') },
  oldest: { label: 'Oldest first', fn: (a, b) => time(a, 'created_at') - time(b, 'created_at') },
  title: { label: 'Title A–Z', fn: (a, b) => a.title.localeCompare(b.title) },
};
export const FILTERS = {
  all: () => true,
  pinned: (n) => n.is_pinned,
  tagged: (n) => n.tags.length > 0,
  recent: (n) => Date.now() - new Date(n.updated_at).getTime() < 7 * 86400000,
};
