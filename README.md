# Social Campaigns Frontend

A React + Vite + Tailwind UI dashboard for campaign management.

**Repository:** https://github.com/ashustha/social-campaigns-frontend

## ✅ Quick Start

### 1) Install dependencies

From the project root:

```bash
npm install
```

If you use pnpm:

```bash
pnpm install
```

### 2) Configure environment

The API base URL is set via environment variables. Two files are included:

- **`.env.development`** — used by `npm run dev` (local):
  ```
  VITE_API_BASE_URL=http://localhost:3000/api
  ```
- **`.env.production`** — used by `npm run build` (deploy):
  ```
  VITE_API_BASE_URL=https://social-awareness-campaigns-team5-project.up.railway.app/api
  ```

### 3) Start dev server

```bash
npm run dev
```

or:

```bash
pnpm dev
```

Open http://localhost:5173 in your browser.

### 4) Build for production

```bash
npm run build
```

or:

```bash
pnpm build
```

### 5) Preview production build

```bash
npm run start
```

or:

```bash
pnpm start
```

## 🚀 Deployment (Netlify)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variable:** Set `VITE_API_BASE_URL` in Netlify Site settings → Environment variables.
- **SPA routing:** Handled via `public/_redirects` (`/* /index.html 200`).

## 🧭 Project Structure

- `src/main.tsx` - app entry
- `src/app/App.tsx` - top-level app layout
- `src/app/routes.tsx` - router configuration
- `src/app/components/*` - UI pages and reusable components
- `src/app/context/AuthContext.tsx` - auth state (login, register, role management)
- `src/app/services/*` - API integration layer
- `src/styles/*` - CSS and theme styles
- `public/_redirects` - Netlify SPA routing config
- `.env.development` - local API base URL
- `.env.production` - production API base URL

## 🔑 User Roles

| Role       | Registration Option | Campaign Type Created |
| ---------- | ------------------- | --------------------- |
| `user`     | Individual          | Social Cause          |
| `business` | Small Business      | Small Business        |
| `admin`    | (DB only)           | N/A (admin panel)     |

Campaign type is **auto-assigned** based on user role and cannot be changed during campaign creation.

## 🔧 Notes

- This project uses Vite with React and Tailwind.
- If you run into stale caches after dependency changes, delete `node_modules` and reinstall.
- Backend API is deployed on Railway: `https://social-awareness-campaigns-team5-project.up.railway.app`

---
