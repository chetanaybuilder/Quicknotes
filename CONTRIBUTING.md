# Contributing to QuickNotes

First off, thank you for considering contributing to QuickNotes! We welcome contributions to make the platform faster, more secure, and feature-rich.

## Getting Started

1. Fork the repository and create your branch from `main`.
2. Install dependencies: `npm run install:all`
3. Make sure to configure the `.env` file referencing `.env.example`.
4. Start the application locally: `npm run dev`

## Code Style

- We use **ESLint** for code linting and **Prettier** for formatting.
- Before submitting your pull request, please run:
  ```bash
  npm run lint
  npm run format
  ```
- All new files should contain a brief file header documenting their purpose.

## Testing

- Tests are located in `server/tests/` and client tests will reside in `client/src/tests/`.
- Ensure everything passes before submitting:
  ```bash
  npm run test
  ```

## Pull Request Process

1. Ensure your PR title follows conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).
2. Fill out the Pull Request template provided in `.github/PULL_REQUEST_TEMPLATE.md`.
3. Your code must pass the GitHub Actions CI pipeline before it can be merged.

Thank you!
