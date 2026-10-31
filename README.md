# Inch & Brick — Office Development Tracker

Lightweight internal tracker for the Inch & Brick Realty office fit-out. React + Vite + TypeScript + Tailwind. All data stays in **localStorage** (no backend).

## Features

- Dashboard with progress, overdue counts, deadlines, and activity
- 12 predefined project phases
- Tasks with phase, assignee, priority, status, dates, comments, attachments
- Design files, BOQ & purchases, expenses
- Team members with admin / member roles
- Activity log
- JSON export / import to share a snapshot across devices

## Local development

```bash
cd tracker
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

First visit: create an admin account. Add teammates under **Team Members**. Each person picks their name on the login screen (local session only).

## Sharing data between devices

Browsers do not sync localStorage. Use **Team Members → Export JSON**, send the file, then **Import JSON** (admin + PIN if set) on the other device.

Keep attachments small (~1.5 MB max) so the snapshot stays manageable.

## Publish on GitHub Pages (free)

1. Create a **new public GitHub repository** and push the contents of this `tracker/` folder as the repo root (not the parent CAD project).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys.
4. Site URL: `https://<user>.github.io/<repo-name>/`

The workflow sets `VITE_BASE_PATH` to `/<repo-name>/` automatically. If you use a custom domain or user site (`username.github.io`), set `VITE_BASE_PATH=/` in the workflow `Build` step env.

### Optional local production check

```bash
VITE_BASE_PATH=/ npm run build
npm run preview
```

On Windows PowerShell:

```powershell
$env:VITE_BASE_PATH="/"
npm run build
npm run preview
```

## Stack

- React 18, Vite 5, TypeScript
- Tailwind CSS
- Zustand (persist → localStorage)
- React Router
- Lucide icons

## Note

This is a simple one-project tracker, not a multi-tenant PM tool. Clearing browser data wipes the local project unless you have an exported JSON backup.
