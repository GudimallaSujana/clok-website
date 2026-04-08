# Clok - Calendar & Notes App

Clok is a modern web application for calendar management, notes, and daily planning. Features Supabase authentication, responsive design with shadcn/ui, and Zustand state management.

## Features
- Interactive calendar grid with day tiles
- Sidebar for quick navigation
- Notes panel for daily tasks/entries
- Auth integration with Supabase
- Responsive design (desktop/mobile)
- Holidays awareness
- Sound effects for interactions

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- React Router, TanStack Query, Zustand
- Supabase (auth, realtime)
- Framer Motion for animations

## Quick Start
```bash
cd clok-website
bun install  # or npm install
bun dev      # http://localhost:8080
```

## Project Structure
```
src/
├── components/clok/     # Core UI: Navbar, Sidebar, CalendarGrid, etc.
├── components/ui/       # shadcn/ui primitives
├── hooks/               # Custom hooks (calendar, holidays)
├── pages/               # Routes: Index, Auth
├── store/               # Zustand calendar store
└── contexts/            # Auth context
```

## Environment
Set Supabase URL/anon key in your env or Supabase client config.

## Scripts
- `bun dev` - Start dev server
- `bun build` - Build for production
- `bun lint` - Lint code
- `bun test` - Run tests
