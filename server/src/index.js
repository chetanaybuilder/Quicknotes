import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRouter from './auth.js';
import notesRouter from './notes.js';

for (const k of ['DATABASE_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'APP_URL']) {
  if (!process.env[k]) { console.error(`Missing environment variable: ${k} (see .env.example)`); process.exit(1); }
}

const isProd = process.env.NODE_ENV === 'production';
const appOrigin = new URL(process.env.APP_URL).origin;
const app = express();
if (isProd) app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*.googleusercontent.com'],
      formAction: ["'self'", 'https://accounts.google.com'],
    },
  },
  referrerPolicy: { policy: 'no-referrer' }, // lets Google avatars load
  crossOriginEmbedderPolicy: false,
}));
app.use(cookieParser());
app.use(express.json({ limit: '256kb' }));

// CSRF defence in depth on top of SameSite=Lax: state-changing requests must come from our own origin.
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && origin !== appOrigin) return res.status(403).json({ error: 'Request blocked.' });
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

if (isProd) {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.type === 'entity.parse.failed' ? 400 : 500).json({ error: 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => console.log(`Quick Notes API on :${port}`));
