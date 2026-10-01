/**
 * @file notes.js
 * @description API routes for creating, reading, updating, and deleting notes.
 */
import { Router } from 'express';
import { query } from './db.js';
import { requireAuth } from './auth.js';

const router = Router();
router.use(requireAuth);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLS = 'id, title, content, tags, category, is_pinned, created_at, updated_at';

/**
 * Validates a partial note payload. Returns { value } or { error }.
 * @param {Object} body - Request body payload.
 * @param {Object} options - Validation options.
 * @param {boolean} options.partial - Whether partial payloads are allowed (e.g., for PATCH).
 * @returns {Object} Validated values or error message.
 */
function validate(body, { partial }) {
  const v = {};
  const b = body ?? {};
  if ('title' in b || !partial) {
    if (typeof (b.title ?? '') !== 'string' || (b.title ?? '').length > 200) return { error: 'Title must be 200 characters or fewer.' };
    v.title = (b.title ?? '').trim();
  }
  if ('content' in b || !partial) {
    if (typeof (b.content ?? '') !== 'string' || (b.content ?? '').length > 50_000) return { error: 'Note is too long (50,000 characters max).' };
    v.content = b.content ?? '';
  }
  if ('tags' in b || !partial) {
    const tags = b.tags ?? [];
    if (!Array.isArray(tags) || tags.length > 10 || tags.some((t) => typeof t !== 'string' || !t.trim() || t.length > 30))
      return { error: 'Use up to 10 tags of 30 characters or fewer.' };
    v.tags = [...new Set(tags.map((t) => t.trim().toLowerCase()))];
  }
  if ('category' in b) {
    if (b.category !== null && (typeof b.category !== 'string' || b.category.length > 40)) return { error: 'Category must be 40 characters or fewer.' };
    v.category = b.category?.trim() || null;
  }
  if ('is_pinned' in b) {
    if (typeof b.is_pinned !== 'boolean') return { error: 'Invalid pinned value.' };
    v.is_pinned = b.is_pinned;
  }
  return { value: v };
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ${COLS} FROM notes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 2000`,
      [req.user.id],
    );
    res.json({ notes: rows });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { value, error } = validate(req.body, { partial: false });
    if (error) return res.status(400).json({ error });
    const { rows } = await query(
      `INSERT INTO notes (user_id, title, content, tags, category, is_pinned)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${COLS}`,
      [req.user.id, value.title, value.content, value.tags, value.category ?? null, value.is_pinned ?? false],
    );
    res.status(201).json({ note: rows[0] });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!UUID.test(req.params.id)) return res.status(404).json({ error: 'Note not found.' });
    const { value, error } = validate(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    const keys = Object.keys(value); // whitelisted column names only, never raw input
    if (!keys.length) return res.status(400).json({ error: 'Nothing to update.' });
    const sets = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
    const { rows } = await query(
      `UPDATE notes SET ${sets}, updated_at = now() WHERE id = $1 AND user_id = $2 RETURNING ${COLS}`,
      [req.params.id, req.user.id, ...keys.map((k) => value[k])],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Note not found.' });
    res.json({ note: rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!UUID.test(req.params.id)) return res.status(404).json({ error: 'Note not found.' });
    const { rowCount } = await query(`DELETE FROM notes WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    if (!rowCount) return res.status(404).json({ error: 'Note not found.' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
