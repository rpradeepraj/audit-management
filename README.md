# Audit Management System (AMS)

A modern fullstack enterprise Audit Management Platform separated into two decoupled applications:
1. **`backend/`**: Standalone Express.js REST API Server
2. **`frontend/`**: Standalone Next.js 15 App Router Frontend

---

## 📋 System Requirements & Prerequisites

* **Node.js**: **`>= 18.0.0`** *(Recommended: Node.js 20.x or 22.x LTS)*
* **Package Manager**: `npm` (`>= 9.0.0`), `yarn`, or `pnpm`
* **OS**: macOS, Linux, or Windows (WSL recommended)

Check your installed Node.js version:
```bash
node -v   # Should output v18.x.x, v20.x.x, or v22.x.x
```

---

## 🚀 Quick Start (Local Development)

### 1. Run Both Concurrently (Root)
```bash
# Install dependencies for both
npm run install:all

# Run Backend (Port 5001) and Frontend (Port 3000) concurrently
npm run dev
```

### 2. Run Backend Separately
```bash
cd backend
npm install
npm run dev      # Runs with tsx watch on http://localhost:5001
```

### 3. Run Frontend Separately
```bash
cd frontend
npm install
npm run dev      # Runs Next.js on http://localhost:3000
```

---

## 🚢 Independent Deployment Guide

### A. Deploying Backend (`backend/`)
The backend is a standard Node.js Express server. You can deploy it to **Render**, **Railway**, **AWS ECS / App Runner**, **Heroku**, or a VPS.

1. **Root Directory for Deployment**: `backend`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start` (executes `node dist/server.js`)
4. **Environment Variables**:
   - `PORT`: `5001` (or provider dynamic port `process.env.PORT`)
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: Your Gemini API key
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key
   - `JWT_SECRET`: Secret key for JWT session signing

### B. Deploying Frontend (`frontend/`)
The frontend is a Next.js application ready to deploy to **Vercel**, **Netlify**, or **Cloudflare Pages**.

1. **Root Directory for Deployment**: `frontend` (or set Root Directory in Vercel project settings)
2. **Framework Preset**: Next.js
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://ams-api.onrender.com`)
   - `BACKEND_URL`: Your deployed backend URL (e.g. `https://ams-api.onrender.com`)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key

---

## 📁 Repository Structure

```
├── backend/                  # Standalone Express.js REST API
│   ├── package.json          # Backend dependencies & scripts
│   ├── tsconfig.json         # Backend TypeScript config
│   ├── .env                  # Backend database & API keys
│   ├── dist/                 # Production compiled JavaScript
│   ├── src/
│   │   ├── config/           # Supabase client & admin
│   │   ├── controllers/      # Express controllers (auth, firm, user, template, upload, ai)
│   │   ├── middleware/       # JWT auth & error handling middlewares
│   │   ├── routes/           # Express modular route definitions
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Business logic & database operations
│   │   ├── types/            # TypeScript domain types
│   │   ├── utils/            # ApiError & role mappers
│   │   ├── app.ts            # Express application factory
│   │   └── server.ts         # Express HTTP listener
│   └── supabase/             # Database migrations & SQL seed scripts
│       ├── schema.sql        # Database schema
│       └── seed.sql          # Seed data
│
├── frontend/                 # Standalone Next.js 15 Application
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tsconfig.json         # Frontend TypeScript config
│   ├── next.config.mjs       # Next.js config with dynamic backend proxy
│   ├── postcss.config.mjs    # Tailwind CSS config
│   ├── .env                  # Frontend public configuration
│   ├── public/               # Static assets & icons
│   └── src/
│       ├── app/              # Next.js App Router (pages & layouts)
│       ├── features/         # Domain feature views & dialogs
│       ├── shared/           # Contexts (FirmContext, TemplateContext, AuthSession), services & UI
│       └── theme/            # Material UI theme & design tokens
│
└── package.json              # Root runner for development & multi-project builds
```