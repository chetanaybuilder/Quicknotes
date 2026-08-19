# QuickNotes

QuickNotes is a minimal personal notes web application built with Flask.

Key features

- User registration and login (passwords hashed)
- Create, list, and delete personal notes
- Uses SQLite for local development

Prerequisites

- Python 3.10+ recommended
- Git

Local setup (Windows PowerShell)

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set SECRET_KEY to a secure random value
python app.py
```

Deployment notes

- For production, do NOT use the built-in Flask server. Use Gunicorn/Uvicorn behind a reverse proxy (Nginx).
- Set `DATABASE` to a managed DB for multi-user production deployments.

Security & repo hygiene

- Never commit `.env` or `Quicknotes.db` to the repository. These files are included in `.gitignore`.
- Rotate `SECRET_KEY` and any credentials before deploying.
- Review and secure any third-party integrations before sharing or deploying.

Contributing

Feel free to open issues or PRs. Keep changes small and include tests for new behavior.

License

MIT
