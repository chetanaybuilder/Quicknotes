# Security Policy

## Supported Versions

Currently, only the `main` branch (latest release) is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within QuickNotes, please do not disclose it publicly. Instead, please contact the repository owner directly.

We will review all reports and do our best to address the issue in a timely manner.

### Enforced Security Standards
- **Secrets Management:** Do not commit `.env` files.
- **Authentication:** Only robust Google OAuth2 implementations are accepted.
- **Database Access:** All SQL queries must be parameterized to prevent SQL Injection.
- **Cookies:** Session tokens must be `HttpOnly` and hashed before hitting PostgreSQL.
