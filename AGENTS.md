# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: Vite + React app (pages in `frontend/src/pages`, shared UI in `frontend/src/components`, styles in `frontend/src/App.css`).
- `backend/`: Symfony API (controllers in `backend/src/Controller`, entities in `backend/src/Entity`, migrations in `backend/migrations`).
- `documentation/`: project docs and notes.
- Root scripts and orchestration live in `package.json`.

## Build, Test, and Development Commands
From repo root:
- `npm run setup`: install backend + frontend deps.
- `npm run dev`: run Symfony API and Vite dev server concurrently.
- `npm run dev:host`: same as dev, exposes Vite host.
- `npm run init-db`: run backend migrations + seed data.
- `npm run clear-cache`: Symfony cache clear.
- `npm run reset-db`: wipe SQLite DB + migrations, then re-init.

Frontend (`frontend/`):
- `npm run dev`: Vite dev server.
- `npm run build`: typecheck + build.
- `npm run lint`: ESLint.

Backend (`backend/`):
- `composer migrate`: create + run migrations.
- `composer do-mig`: run migrations only.
- `composer fresh-db`: rebuild + seed DB.

## Coding Style & Naming Conventions
- Frontend uses TypeScript + React. Prefer `PascalCase` for components, `camelCase` for variables.
- Backend uses PHP 8.4+, Symfony conventions, and Doctrine annotations/attributes.
- Use existing formatting in files (2 spaces in TSX, 4 spaces in PHP).
- Shared helpers go in `frontend/src/lib`.

## Testing Guidelines
- No dedicated test setup found yet. If you add tests, place them under:
  - Frontend: `frontend/src/**/__tests__` or `*.test.tsx`
  - Backend: `backend/tests`
- Ensure new tests are runnable via `npm run lint` and Symfony test tooling if added later.

## Commit & Pull Request Guidelines
- Recent commits use short prefixes like `feat(frontend): ...`. Follow that pattern when possible.
- Keep PRs small, describe changes, and include screenshots for UI changes.
- Link related issues or tasks if available.

## Security & Configuration
- API base URL is configured via `frontend/.env` (`VITE_API_URL`).
- Symfony auth uses JWT; protect API requests with the `Authorization: Bearer <token>` header.
