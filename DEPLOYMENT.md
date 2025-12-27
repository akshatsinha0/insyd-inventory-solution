# Deployment Guide

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `database/schema.sql`
3. Run the seed data from `database/seed.sql`
4. Copy your project URL and keys from Settings > API

## Server Deployment (Railway/Render)

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd server
railway init
railway up
```

### Environment Variables

Set these in your deployment platform:

```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

## Client Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel
```

### Environment Variables

Set in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=your_deployed_server_url/api
```

## Local Development

### Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### Client

```bash
cd client
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

## Architecture

```
User → NextJS (Vercel) → ExpressJS (Railway) → Supabase (PostgreSQL)
```

## Monitoring

- Supabase Dashboard: Database metrics, API logs
- Vercel Analytics: Frontend performance
- Railway Logs: Server-side errors
