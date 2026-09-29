# Leapx Blog CMS

Internship Project by the Leapx Team.

## Important GitHub Rule

**NEVER PUSH OR MAKE CHANGES DIRECTLY TO THE `main` BRANCH.**

The `main` branch is the stable branch of the project. All work goes through this flow:

```text
feature branch → develop → main
```

Only the project lead/authorized mentor merges `develop` into `main`.

---

## Project Structure

This project is a **Turborepo monorepo**. After cloning, the folder looks like this:

```text
cms-2025/
├── apps/
│   ├── web/                    → Frontend (React + Vite + TypeScript)
│   │   ├── src/
│   │   ├── index.html
│   │   └── package.json
│   └── backend/                → Backend (Express + TypeScript)
│       ├── src/
│       │   └── index.ts
│       └── package.json
├── packages/                   → Shared code and config (used by the apps)
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
├── package.json                → Root package.json (workspaces + Turborepo scripts)
├── package-lock.json
├── turbo.json                  → Turborepo task settings
└── README.md
```

---

## New to Monorepos? Read This First

### What is a monorepo?

A **monorepo** is one Git repository that holds more than one project.

Here, the frontend and the backend are in the **same repository**, each in its own folder. You clone once, install once, and run everything with one command.

### What is Turborepo?

**Turborepo** is a tool that runs commands across all the apps in the monorepo.

For example, when you run `npm run dev` from the root, Turborepo finds every app that has a `dev` script and starts them all together. You do not need two terminals.

### The `apps/` folder

This folder holds the actual applications we are building.

| Folder         | What it is                          | Who works here      |
| -------------- | ----------------------------------- | ------------------- |
| `apps/web`     | Frontend application (React + Vite) | Frontend developers |
| `apps/backend` | Backend API (Express + TypeScript)  | Backend developers  |

- **Frontend developers must work inside `apps/web`.**
- **Backend developers must work inside `apps/backend`.**

Each app has its own `package.json` with its own dependencies and scripts.

### The `packages/` folder

This folder holds **shared code** that the apps can use, such as shared TypeScript settings (`typescript-config`), ESLint rules (`eslint-config`), and shared UI pieces (`ui`).

**Do not create new shared packages unless they are really needed** and your mentor has approved them. If the code is used by only one app, keep it inside that app.

### The root `package.json`

The `package.json` in the root folder is **not** for app code. It only:

- tells npm where the apps and packages are (`"workspaces": ["apps/*", "packages/*"]`)
- holds workspace-level tools such as `turbo`, `prettier`, and `eslint`
- has scripts that run through Turborepo:

| Command          | What it does                                  |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Starts all apps in development mode           |
| `npm run build`  | Builds all apps                               |
| `npm run lint`   | Runs lint in all apps                         |
| `npm run format` | Formats `.ts`, `.tsx`, and `.md` files        |

### `turbo.json`

This file tells Turborepo how to run each task (`dev`, `build`, `lint`). For example, it marks `dev` as a long-running task that should not be cached.

**You normally do not need to edit this file.** Ask your mentor before changing it.

---

## Which Folder Should I Work In?

| Type of work | Folder         |
| ------------ | -------------- |
| Frontend     | `apps/web`     |
| Backend      | `apps/backend` |
| Shared code  | `packages`     |
| Root config  | root folder    |

---

## Getting Started (After Cloning)

```bash
git clone <repository-url>
cd cms-2025
npm install
npm run dev
```

- **Run `npm install` from the root first.** This installs the dependencies for every app and package in one go.
- **`npm run dev` from the root** uses Turborepo to start both the frontend and the backend together, because both apps have a `dev` script.

Once it is running:

- Frontend: http://localhost:5173
- Backend: http://localhost:5001 (test route: http://localhost:5001/api/test)

> **Mac users:** the backend uses port `5001` because macOS AirPlay Receiver already uses port `5000`.

### Running one app separately

To run only one app:

```bash
cd apps/web
npm run dev
```

or:

```bash
cd apps/backend
npm run dev
```

---

## Installing Dependencies (Very Important)

**Install a dependency inside the app that uses it.**

| The package is used by... | Install it in...                                          |
| ------------------------- | --------------------------------------------------------- |
| Only the frontend         | `apps/web`                                                |
| Only the backend          | `apps/backend`                                            |
| Turborepo / whole repo    | root (only tools like `turbo`, `prettier`; ask a mentor first) |

### Frontend example

```bash
cd apps/web
npm install axios
```

### Backend example

```bash
cd apps/backend
npm install mongoose
```

### Wrong way

```bash
# ❌ WRONG — run from the root folder
npm install axios
npm install react-hook-form
```

This is wrong because `axios` and `react-hook-form` are only used by the frontend, so they belong in `apps/web/package.json`, not the root `package.json`.

### "Why is there no `node_modules` inside my app folder?"

That is normal. npm workspaces put most installed packages in **one shared `node_modules` folder at the root** to save space.

What matters is **which `package.json` the package is listed in**. When you run `npm install` inside `apps/web`, the package is added to `apps/web/package.json`, which is correct.

> Same result without `cd` (run from the root):
> `npm install axios -w web` or `npm install mongoose -w backend`

---

## Environment Variables (`.env` files)

Each app keeps its own `.env` file inside its own folder:

```text
apps/web/.env
apps/backend/.env
```

Example `apps/backend/.env`:

```text
MONGODB_URI=your-connection-string
JWT_SECRET=your-secret
```

- **Never commit `.env` files or secrets to GitHub.** `.env` is already in `.gitignore`; do not remove it from there.
- Frontend variables in `apps/web/.env` must start with `VITE_` (for example `VITE_API_URL`) or Vite will not read them.
- Anything in the frontend `.env` is visible in the browser, so **never put secrets in `apps/web/.env`**.
- If a new variable is needed, tell the team the variable **name** (not the value) so others can add it to their own `.env`.

---

## Before You Start Working

1. Checkout `develop`
2. Pull the latest changes
3. Create your own feature branch
4. Work only in your assigned module
5. Do not directly modify unrelated modules
6. Push your feature branch
7. Create a Pull Request into `develop`

```bash
git checkout develop
git pull origin develop

git checkout -b feature/blog-crud

# Make your changes inside your app folder (apps/web or apps/backend)

git add .
git commit -m "Add blog CRUD API"
git push origin feature/blog-crud
```

After pushing, create a Pull Request on GitHub:

```text
feature/your-feature → develop
```

Wait for mentor review before merging. **Do not merge anything into `main` yourself.**

Only the project lead/authorized mentor should move approved work from:

```text
develop → main
```

---

## Branch Naming

Always start from `develop` and use `feature/<short-name>`, in lowercase with hyphens:

```text
feature/admin-login
feature/blog-crud
feature/editor
feature/public-blog
feature/categories
feature/image-upload
```

- ✅ `feature/blog-crud`
- ❌ `BlogCRUD`, `my-branch`, `fahad-work`, `test123`

One branch per feature. Create a new branch for a new feature.

---

## Common Mistakes to Avoid

- ❌ Do not work directly on `main`
- ❌ Do not install frontend libraries in the root
- ❌ Do not install backend libraries in the root
- ❌ Do not create random folders at the root
- ❌ Do not modify another developer's module unnecessarily
- ❌ Do not commit `.env`
- ✅ Always pull the latest `develop` before creating a branch
- ✅ Always raise a PR into `develop`, not `main`

---

## Team

### Project Lead

**Adfar Rasheed**  
Lead for the entire Leapx project across **Noida, Lucknow, and Pune**.

### Mentors

- **Mr Taqi ur Rehman Sir** — Lucknow Mentor
- **Mr Dharmaraj Sir** — Pune Campus Mentor

### Students

- **Bhumika Sharma** — Backend
- **Mohammad Fahad** — Backend
- **MD Salaih Hasan** — Frontend
- **Khushi Shah** — UI initially, later Frontend
- **Ankit Bhalke** — Frontend
- **Arpita Awasthi** — UI initially, later Backend

---

## Final Rule

**Do not touch `main`.**

Work on your feature branch, raise a Pull Request to `develop`, and wait for review.
