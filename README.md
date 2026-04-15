# Speedo

A Progressive Web App (PWA) that turns your smartphone into a digital bike computer. Built with Next.js and designed for Android Chrome.

## Features

- Real-time speed display with odometer-style animation
- Session control: auto-start, auto-pause (10s), manual pause/end
- 10 configurable secondary metrics (max speed, avg speed, distance, altitude, calories, etc.)
- Historical records stored locally — no account required
- Focus mode (fullscreen) during active sessions
- Speed alert via vibration + visual pulse
- Interrupted session recovery
- Dark/light theme following system preference
- Installable as PWA with offline support
- i18n: English by default, with Portuguese (PT-BR) support

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | framer-motion |
| Carousel | Embla Carousel |
| i18n | next-intl |
| Storage | localStorage + IndexedDB (idb) |
| PWA | next-pwa |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome on Android (or DevTools mobile emulation) and grant GPS permission when prompted.

## Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add button
```

Components are placed in `src/components/ui/`.

## Project Structure

```
src/
├── app/               # Next.js App Router (layout, page, globals.css)
├── features/
│   ├── speedometer/   # GPS, session state, metrics, display
│   ├── stats/         # Historical records
│   ├── settings/      # User preferences
│   └── onboarding/    # GPS permission gate
├── components/ui/     # AppShell, modals, slide indicators
├── hooks/             # useWakeLock, useOrientation
├── lib/               # storage.ts, calories.ts
├── providers/         # ThemeProvider, AppProviders
├── i18n/              # PT-BR and EN locale strings
└── constants/         # AUTO_PAUSE_DELAY, MET, SESSION_DRAFT_INTERVAL
```

See [`spec/PRD.md`](spec/PRD.md) for full product requirements and [`spec/SCAFFOLD.md`](spec/SCAFFOLD.md) for detailed architecture.
