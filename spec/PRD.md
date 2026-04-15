# PRD — Speedo PWA

**Version:** 1.0
**Status:** Ready for Development
**Stack:** Next.js + PWA
**Platform:** Android (Chrome Mobile)

---

## 1. Executive Summary

### Problem Statement

Dedicated bike computers are expensive and native apps require downloads and extensive permissions. The casual cyclist needs a lightweight, installable solution that works offline, accessible directly through the browser — without registration or additional hardware.

### Proposed Solution

An installable PWA built with Next.js that runs in Chrome on Android. It uses the Geolocation API to capture real-time speed data, displays session metrics, and maintains a local record of historical bests — all stored on-device, no account or backend required.

### Success Criteria

| KPI | Target |
|---|---|
| Real-time speed display latency | < 2s after session starts |
| Historical records persistence | Data persists after closing the app |
| PWA installability | App icon on home screen, works offline |
| Dark/light theme support | Follows system theme by default |
| i18n coverage | 100% of strings translated (PT-BR / EN) |
| GPS signal acquisition | Badge shows status within 1s of state change |
| Touch target compliance | No interactive element smaller than 48×48px |

---

## 2. User Experience & Functionality

### User Personas

**Primary — Casual Cyclist**
Uses Android, rides recreationally 2–4x per week. Wants to track speed without installing a dedicated app. Not technically sophisticated. Uses the phone mounted on the handlebar, often with gloves, in full sun.

**Secondary — Commuter Cyclist**
Daily commuter who wants quick session data (avg/max speed, distance). Expects the app to just work — no setup, no accounts.

---

### User Stories & Acceptance Criteria

#### Onboarding — GPS Permission

**Story:** As a first-time user, I want to grant GPS permission so the app can measure my speed.

**Acceptance Criteria:**
- On first open, a permission screen is shown before the speedometer
- Tapping "Allow GPS" triggers the native browser permission prompt
- If granted: stores `gps_granted` in `localStorage` → opens speedometer normally
- If denied: shows a blocking screen with instructions to enable it in browser settings + "Try again" button
- If permanently denied: shows specific message directing user to open browser settings manually
- The speedometer is **never** shown without GPS permission

---

#### Speedometer — Real-Time Speed Display

**Story:** As a cyclist, I want to see my current speed in large digits so I can read it at a glance while riding.

**Acceptance Criteria:**
- Speed is displayed as a large numeric value, centered on screen (`text-8xl` / `9xl` portrait, `text-7xl` landscape)
- Font is a heavy display typeface (Bebas Neue or equivalent)
- Speed updates with a smooth spring animation (framer-motion) — odometer style
- Unit label (`km/h` or `mph`) displayed below the speed, smaller, with reduced opacity
- GPS status badge displayed at the top: `Waiting…` / `Weak signal` / `OK`
- If `coords.speed === null`, speed is calculated via Haversine between consecutive positions ÷ Δt
- Layout adapts to portrait and landscape orientations

---

#### Speedometer — Session Control

**Story:** As a cyclist, I want the session to start automatically when I start moving so I don't need to interact with the phone.

**Acceptance Criteria:**
- Session auto-starts when `coords.speed > 0.5 m/s` for the first time → state `RUNNING`
- Session auto-pauses after `speed ≈ 0` for **10 consecutive seconds** → state `AUTO_PAUSED`
- "Pause" button manually forces pause at any time → state `MANUALLY_PAUSED`
- "Resume" button or new movement resumes the session → state `RUNNING`
- "End" button opens a confirmation modal (shadcn Dialog) → saves session → resets metrics → state `IDLE`
- State machine: `IDLE → RUNNING → AUTO_PAUSED ↔ RUNNING → IDLE`

---

#### Speedometer — Secondary Metrics Carousel

**Story:** As a cyclist, I want to swipe through secondary metrics during my ride without leaving the speedometer screen.

**Acceptance Criteria:**
- Metrics displayed in pairs via an Embla Carousel (independent from the screen carousel)
- Available metrics: Max Speed, Avg Speed, Movement Time, Total Time, Current Time, Distance, Altitude, Elevation Gain, Calories, GPS Coordinates
- Default active: Max Speed + Avg Speed
- User can enable/disable individual metrics via Settings or in-screen edit mode
- Edit mode: pencil icon opens overlay with checkboxes per metric; confirms on outside tap or close
- If active count is odd, last pair shows one metric centered
- Metrics carousel uses `loop: false`; page indicator (dots) below

---

#### Speedometer — Focus Mode

**Story:** As a cyclist, I want the app to go fullscreen when I'm riding so the speed number fills the screen.

**Acceptance Criteria:**
- Calls `document.documentElement.requestFullscreen()` automatically when session starts
- Hides Android status bar → maximizes number display area
- In focus mode: only speed, GPS badge, and control buttons visible
- Tapping the screen once toggles between focus mode and normal mode
- Exiting session (pause or end) automatically exits fullscreen

---

#### Speedometer — Speed Alert

**Story:** As a cyclist, I want a vibration alert when I exceed my configured speed limit so I know without looking.

**Acceptance Criteria:**
- User configures a speed threshold in km/h in Settings (0 or empty = disabled)
- When speed exceeds the threshold: `navigator.vibrate()` fires + pulsing visual highlight on the speed number (framer-motion keyframe loop)
- Alert fires **once per crossing event** — does not repeat while above the limit
- No audio alert — vibration + visual only

---

#### Session Recovery

**Story:** As a cyclist, if the app closes accidentally during a session, I want to resume where I left off.

**Acceptance Criteria:**
- During an active session, state is saved to `localStorage` (`speedo:session_draft`) every 5 seconds
- On app open, if `session_draft` exists, a recovery modal is shown with: elapsed time and distance
- "Resume" → restores metrics, resumes in `MANUALLY_PAUSED` state
- "Discard" → clears draft, starts fresh
- `session_draft` is cleared on normal session end

---

#### Settings

**Story:** As a user, I want to configure the app preferences so it works for my riding style and environment.

**Acceptance Criteria:**

| Setting | Type | Default | Behavior |
|---|---|---|---|
| Theme (dark/light) | Toggle (shadcn Switch) | Follows system | Overrides while app is open; resets on close |
| Units | Toggle | Metric (km/h, m) | Switches all displayed units |
| Keep screen on | Toggle | Off | Calls `navigator.wakeLock.request('screen')` when enabled |
| User weight | Numeric input | — (optional) | Used for calorie calculation |
| Speed alert | Numeric input (km/h) | 0 (disabled) | Triggers alert when exceeded |
| Language | Selector (PT / EN) | English | Overrides the app default language |

- All settings use `inputmode="numeric"` for numeric fields
- Wake Lock reactivates via `visibilitychange` on app return
- Wake Lock shows a discrete warning if the browser API is unsupported
- Settings minimum row height: 56px for easy tap
- `Separator` between setting groups

---

#### Stats — Historical Records

**Story:** As a cyclist, I want to see my all-time records so I can track my progress over time.

**Acceptance Criteria:**
- Records stored globally in `localStorage` (`speedo:records`), updated on session end
- Records displayed: Max Speed, Longest Distance, Longest Movement Time, Highest Calorie Burn (requires weight), Date of Last Record
- Shows `—` for records with no data
- "Reset records" button with confirmation modal (shadcn Dialog)
- Portrait: linear card list; Landscape: 2×N grid

---

### Non-Goals (v1.0)

- Route map / trajectory tracking
- Per-session speed graphs
- Login or cloud sync *(planned v2)*
- Speedometer color/font customization *(planned v2)*
- Analog speedometer *(planned v2)*
- Data export
- Session history list in the UI *(IndexedDB prepared in architecture but not exposed)*

---

## 3. Technical Specifications

### Architecture Overview

```
GpsPermissionGate
      ↓ (permission granted)
AppShell (Embla Carousel — 3 screens, default: index 1)
      │
      ├── Screen 0: SettingsScreen
      │     └── useSettings → lib/storage.ts (speedo:settings)
      │
      ├── Screen 1: SpeedometerScreen
      │     ├── useGeolocation → Geolocation API (enableHighAccuracy: true)
      │     ├── useSession (useReducer) → IDLE | RUNNING | AUTO_PAUSED | MANUALLY_PAUSED
      │     ├── useMetrics → derived metrics in real-time
      │     ├── useActiveMetrics → lib/storage.ts (speedo:settings)
      │     ├── useSessionDraft → lib/storage.ts (speedo:session_draft) [every 5s]
      │     └── useFocusMode → document.requestFullscreen()
      │
      └── Screen 2: StatsScreen
            └── useRecords → lib/storage.ts (speedo:records)

On session end:
useSession → lib/storage.ts → update speedo:records
                            → clear speedo:session_draft
```

### Folder Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (providers, metadata, PWA meta tags)
│   ├── page.tsx                    # Entry point → <AppShell /> or <GpsPermissionGate />
│   └── globals.css                 # CSS variables (--background, --foreground, etc.)
│
├── features/
│   ├── speedometer/
│   │   ├── components/
│   │   │   ├── SpeedometerScreen.tsx
│   │   │   ├── DigitalDisplay.tsx        # Animated speed number (framer-motion spring)
│   │   │   ├── MetricsCarousel.tsx       # Inner Embla — metric pairs
│   │   │   ├── MetricCard.tsx
│   │   │   ├── MetricsEditMode.tsx
│   │   │   ├── SessionControls.tsx
│   │   │   ├── GpsStatus.tsx
│   │   │   └── FocusMode.tsx
│   │   ├── hooks/
│   │   │   ├── useGeolocation.ts         # Geolocation API + Haversine fallback
│   │   │   ├── useSession.ts             # useReducer — session state machine
│   │   │   ├── useMetrics.ts             # Real-time derived metrics
│   │   │   ├── useActiveMetrics.ts       # Active metrics list management
│   │   │   ├── useSessionDraft.ts        # Persist/restore interrupted session
│   │   │   └── useFocusMode.ts           # requestFullscreen + tap toggle
│   │   ├── utils/
│   │   │   ├── speed.ts                  # m/s → km/h → mph conversions
│   │   │   ├── haversine.ts              # GPS distance calculation
│   │   │   └── metrics.ts                # Metric value formatting
│   │   └── types/index.ts                # SessionState, GpsStatus, MetricId, SpeedReading
│   │
│   ├── stats/
│   │   ├── components/
│   │   │   ├── StatsScreen.tsx
│   │   │   ├── RecordCard.tsx
│   │   │   └── ResetRecordsButton.tsx
│   │   └── hooks/useRecords.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── ToggleRow.tsx
│   │   │   ├── NumberInputRow.tsx
│   │   │   ├── MetricsToggleList.tsx
│   │   │   └── LanguageSelector.tsx
│   │   └── hooks/useSettings.ts
│   │
│   └── onboarding/
│       ├── components/
│       │   ├── GpsPermissionGate.tsx
│       │   ├── GpsPermissionScreen.tsx
│       │   └── GpsDeniedScreen.tsx
│       └── hooks/useGpsPermission.ts
│
├── components/ui/
│   ├── AppShell.tsx                  # Outer Embla — 3 screens
│   ├── SlideIndicator.tsx            # Page dot indicators
│   ├── Modal.tsx                     # Generic confirmation modal (shadcn Dialog)
│   └── SessionRecoveryModal.tsx
│
├── hooks/
│   ├── useWakeLock.ts                # Screen Wake Lock API + visibilitychange reactivation
│   └── useOrientation.ts             # Returns 'portrait' | 'landscape'
│
├── lib/
│   ├── storage.ts                    # Typed wrappers: getSettings/saveSettings, getRecords/saveRecords,
│   │                                 # getSessionDraft/saveSessionDraft/clearSessionDraft
│   └── calories.ts                   # MET × weight_kg × duration_hours
│
├── i18n/
│   ├── locales/pt.json
│   ├── locales/en.json
│   └── config.ts
│
├── providers/
│   ├── AppProviders.tsx              # ThemeProvider + IntlProvider
│   └── ThemeProvider.tsx             # Reads prefers-color-scheme, exposes useTheme()
│
└── constants/index.ts                # AUTO_PAUSE_DELAY=10s, SESSION_DRAFT_INTERVAL=5s, MET=8.0
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (`darkMode: 'class'`) |
| Theme tokens | CSS semantic variables (shadcn/ui standard) |
| UI Components | shadcn/ui (Switch, Dialog, Badge, Button, Separator) |
| Animations | framer-motion (spring, AnimatePresence, layout) |
| Screen navigation | Embla Carousel (outer) |
| Metric navigation | Embla Carousel (inner — independent instance) |
| GPS | Geolocation API (native, `enableHighAccuracy: true`) |
| Wake Lock | Screen Wake Lock API (native) |
| i18n | next-intl |
| Storage | localStorage + idb (IndexedDB — v2 ready) |
| PWA | next-pwa |

### Local Storage Schema

| Data | Storage | Key |
|---|---|---|
| Settings | `localStorage` | `speedo:settings` |
| Global records | `localStorage` | `speedo:records` |
| Session draft | `localStorage` | `speedo:session_draft` |
| Session history *(v2)* | `IndexedDB` | `speedo:sessions` |

### Theme System

```css
/* globals.css */
:root {
  --background:           0 0% 100%;   /* #ffffff */
  --foreground:           0 0% 4%;     /* #0a0a0a */
  --muted:                0 0% 96%;    /* #f5f5f5 */
  --muted-foreground:     0 0% 45%;    /* #737373 */
  --primary:              0 0% 4%;     /* #0a0a0a */
  --primary-foreground:   0 0% 100%;
  --border:               0 0% 90%;    /* #e5e5e5 */
  --ring:                 0 0% 4%;
  --radius:               0.5rem;
}

.dark {
  --background:           0 0% 4%;     /* #0a0a0a */
  --foreground:           0 0% 100%;   /* #ffffff */
  --muted:                0 0% 10%;    /* #1a1a1a */
  --muted-foreground:     0 0% 55%;    /* #8c8c8c */
  --primary:              0 0% 100%;   /* #ffffff */
  --primary-foreground:   0 0% 4%;
  --border:               0 0% 15%;    /* #262626 */
  --ring:                 0 0% 100%;
}
```

**Rules:**
- Always use semantic classes: `text-foreground`, `bg-background`, `border-border`
- Never use: `text-white`, `bg-black`, `text-gray-400`
- Exception: state colors — `text-green-500` (GPS OK), `text-yellow-500` (weak GPS)

### UI Constraints (Physical Context)

| Factor | Design Decision |
|---|---|
| Full sun readability | Dark mode default; no gradients on speedometer; max contrast |
| Gloved hands | Min touch target 48×48px; critical buttons (pause/end) min 64px height |
| Handlebar vibration | No precision gestures; swipe for navigation only |
| Divided attention | Speed readable in < 1s; clear visual hierarchy |
| Portrait + landscape | Responsive layout via `landscape:` Tailwind classes |

### Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Current speed | Bebas Neue (display) | `text-8xl/9xl` portrait · `text-7xl` landscape | Heavy |
| Unit (km/h) | Same display | `text-2xl` | Regular |
| Metric values | Monospace or display | `text-2xl` | Semibold |
| Metric labels | Sans-serif | `text-xs` uppercase tracking-widest | Regular |
| Buttons | Sans-serif | `text-base` | Medium |

### Calorie Calculation

```
calories = MET × weight_kg × duration_hours
```
- MET: `8.0` (moderate cycling ~20 km/h)
- Only calculated and displayed when weight is configured in Settings

### PWA Requirements

| Requirement | Detail |
|---|---|
| `manifest.json` | `name: "Speedo"`, `start_url: "https://speedo.bike"`, `display: standalone` |
| Service Worker | Static asset caching (offline support) |
| Icons | 192×192 and 512×512 |
| `theme_color` | `#000000` (dark) / `#ffffff` (light) |
| Installable | Chrome Android install prompt |

### i18n

- Library: `next-intl`
- Languages: PT-BR, EN
- Default language is `en`
- User can switch to PT-BR in Settings
- User can override in Settings
- All strings, units, and date/time formats are translated

---

## 4. Risks & Roadmap

### Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| `coords.speed` returns `null` | Speed not displayed | Haversine fallback: calculate from consecutive positions ÷ Δt |
| Wake Lock not supported (Safari/Firefox) | Screen may turn off during ride | Warn user with a discrete in-app notice |
| Browser suspends GPS when minimized | Session interrupted mid-ride | Instruct user to keep app in foreground; detect `visibilitychange` |
| Cold GPS signal (~30s to acquire) | Zero speed at session start | Show `Waiting for signal…` badge; do not auto-start until signal acquired |
| Embla carousel gesture conflicts | Inner + outer swipe conflicts | Use two fully independent Embla instances with correct drag detection boundaries |
| `requestFullscreen` Safari restriction | Focus mode unavailable on iOS | iOS explicitly out of scope for v1; document limitation |

### Phased Roadmap

#### v1.0 — This Document
- Real-time digital speedometer (current, max, avg speed)
- 10 configurable secondary metrics in horizontal carousel
- Automatic session control (10s auto-pause) + manual controls
- Interrupted session recovery
- Local historical records (5 record types)
- Full Settings screen (theme, units, wake lock, weight, alert, language)
- GPS permission onboarding + blocked state screen
- Focus mode (fullscreen on session start)
- Theme follows system (temporary toggle in Settings, no persistence)
- Portrait + landscape layouts for all screens
- Minimalist monochrome visual identity
- Semantic CSS variable theme system (dark/light)
- Odometer animation on speed number
- Speed alert: vibration + visual pulse
- Installable PWA, i18n PT-BR / EN

#### v2.0
- Login and cloud sync
- Full session history with list UI
- Route map (Mapbox or Leaflet)
- Per-session speed graph

#### v3.0
- Analog speedometer
- User-customizable accent color and font for speedometer
- Multiple user profiles
