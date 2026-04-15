# Speedo v1.0 — Plano de Desenvolvimento

**Branch:** `claude/plan-app-development-pGrxT`
**Baseado em:** `spec/PRD.md` (v1.0)
**Estado inicial:** MVP funcional em `app/MVP/` (protótipo descartável — não evoluir in-place)

---

## Estratégia

Construir a v1.0 em paralelo sob `features/`, `hooks/`, `lib/`, `providers/`, `i18n/` e `constants/`, trocando o entry point (`app/page.tsx`) ao final. O MVP atual (paleta ciano/slate) diverge do sistema de tokens semânticos do PRD e não deve ser refatorado — serve apenas como referência.

---

## Etapa 0 — Fundação e dependências

- [ ] Instalar `framer-motion`
- [ ] Instalar `next-intl`
- [ ] Instalar `idb` (preparação v2)
- [ ] Adicionar shadcn `Switch`
- [ ] Adicionar shadcn `Dialog`
- [ ] Adicionar shadcn `Badge`
- [ ] Adicionar shadcn `Separator`
- [ ] Auditar `app/globals.css`: tokens semânticos exatos do PRD §3 (`:root` + `.dark`)
- [ ] Garantir `darkMode: 'class'` na configuração Tailwind
- [ ] Criar `constants/index.ts` com `AUTO_PAUSE_DELAY=10_000`, `SESSION_DRAFT_INTERVAL=5_000`, `MET=8.0`, `AUTO_START_SPEED=0.5`

---

## Etapa 1 — Providers e storage

- [ ] `providers/ThemeProvider.tsx`: lê `prefers-color-scheme`, aplica `.dark`, expõe `useTheme()`, **não persiste**
- [ ] `providers/AppProviders.tsx`: compõe Theme + IntlProvider
- [ ] `lib/storage.ts`: wrappers tipados
  - [ ] `getSettings` / `saveSettings` (`speedo:settings`)
  - [ ] `getRecords` / `saveRecords` (`speedo:records`)
  - [ ] `getSessionDraft` / `saveSessionDraft` / `clearSessionDraft` (`speedo:session_draft`)
- [ ] `lib/calories.ts`: `MET × weight_kg × duration_hours`

---

## Etapa 2 — Internacionalização (i18n)

- [ ] `i18n/config.ts`
- [ ] `i18n/locales/en.json` (todas as strings da UI)
- [ ] `i18n/locales/pt.json` (todas as strings da UI)
- [ ] Integrar `next-intl` no `app/layout.tsx` via `AppProviders`
- [ ] Idioma default `en`; override via Settings

---

## Etapa 3 — Feature: onboarding (GPS gate)

- [ ] `features/onboarding/hooks/useGpsPermission.ts` (Permissions API + flag `speedo:gps_granted`)
- [ ] `features/onboarding/components/GpsPermissionScreen.tsx`
- [ ] `features/onboarding/components/GpsDeniedScreen.tsx` (mensagem + "Try again")
- [ ] `features/onboarding/components/GpsPermissionGate.tsx` (bloqueia app sem permissão)
- [ ] Tratar estado "permanentemente negado" com instrução específica

---

## Etapa 4 — Feature: speedometer — núcleo de dados

- [ ] `features/speedometer/types/index.ts`: `SessionState`, `GpsStatus`, `MetricId`, `SpeedReading`
- [ ] `features/speedometer/utils/haversine.ts`
- [ ] `features/speedometer/utils/speed.ts` (m/s ↔ km/h ↔ mph)
- [ ] `features/speedometer/utils/metrics.ts` (formatação)
- [ ] `hooks/useGeolocation.ts`: `watchPosition({ enableHighAccuracy: true })`
  - [ ] Status `waiting` / `weak` / `ok`
  - [ ] Fallback Haversine quando `coords.speed === null`
- [ ] `hooks/useSession.ts`: `useReducer` — máquina `IDLE → RUNNING ↔ AUTO_PAUSED ↔ MANUALLY_PAUSED → IDLE`
  - [ ] Auto-start em `speed > 0.5 m/s`
  - [ ] Auto-pause após `speed ≈ 0` por 10s consecutivos
- [ ] `hooks/useMetrics.ts`: max, avg, movement time, total time, distance, altitude, elevation gain, calorias, coords
- [ ] `hooks/useActiveMetrics.ts` (lê/escreve em `speedo:settings`)
- [ ] `hooks/useSessionDraft.ts` (save a cada 5s; clear no término normal)
- [ ] `hooks/useFocusMode.ts` (`requestFullscreen()`; tap toggle; sai em pause/end)

---

## Etapa 5 — Feature: speedometer — UI

- [ ] `SpeedometerScreen.tsx` (portrait + landscape via `landscape:`)
- [ ] `DigitalDisplay.tsx` (spring framer-motion, Bebas Neue via `next/font`, pulso de alerta)
- [ ] `GpsStatus.tsx` (shadcn `Badge` + `AnimatePresence`)
- [ ] `MetricsCarousel.tsx` (Embla interno, `loop: false`, pares, dots)
- [ ] `MetricCard.tsx`
- [ ] `MetricsEditMode.tsx` (ícone lápis + overlay com checkboxes)
- [ ] `SessionControls.tsx` (Pausar/Retomar + Fim com shadcn `Dialog`)
- [ ] Métrica ímpar → centraliza sozinha no último par
- [ ] Touch targets: mínimo 48px; Pausar/Fim 64px
- [ ] Feedback haptic/visual no tap dos botões (`scale 0.95`)

---

## Etapa 6 — Feature: settings

- [ ] `features/settings/hooks/useSettings.ts` (`speedo:settings`)
- [ ] `SettingsScreen.tsx`
- [ ] `ToggleRow.tsx`
- [ ] `NumberInputRow.tsx` (`inputmode="numeric"`)
- [ ] `MetricsToggleList.tsx`
- [ ] `LanguageSelector.tsx`
- [ ] Campos: tema (não persiste), unidades, keep screen on, peso, alerta de velocidade, idioma
- [ ] `Separator` entre grupos; row mínimo 56px
- [ ] Aviso discreto se Wake Lock API não suportada

---

## Etapa 7 — Feature: stats

- [ ] `features/stats/hooks/useRecords.ts` (`speedo:records`)
- [ ] `StatsScreen.tsx`
- [ ] `RecordCard.tsx`
- [ ] `ResetRecordsButton.tsx` (Dialog de confirmação)
- [ ] Atualiza recordes no término de sessão
- [ ] Exibe `—` quando vazio
- [ ] Portrait linear / landscape grid 2×N
- [ ] Recordes: max speed, longest distance, longest movement, highest calories, last record date

---

## Etapa 8 — Shell e navegação

- [ ] `components/ui/AppShell.tsx` (Embla externo, 3 telas, `startIndex: 1`)
- [ ] `components/ui/SlideIndicator.tsx` (dots)
- [ ] Validar independência entre Embla externo (telas) e interno (métricas) — risco PRD §4
- [ ] Atualizar `app/page.tsx`: `GpsPermissionGate → AppShell` (substitui entry do MVP)

---

## Etapa 9 — Session recovery

- [ ] `components/ui/SessionRecoveryModal.tsx`
- [ ] No mount do AppShell: se `speedo:session_draft` existe, abre modal com tempo + distância
- [ ] Retomar → restaura métricas, estado `MANUALLY_PAUSED`
- [ ] Descartar → limpa draft, inicia do zero

---

## Etapa 10 — Wake Lock, alerta e hooks gerais

- [ ] `hooks/useWakeLock.ts` (`navigator.wakeLock.request('screen')`, reativa em `visibilitychange`)
- [ ] `hooks/useOrientation.ts` (`'portrait' | 'landscape'`)
- [ ] Lógica de alerta de velocidade
  - [ ] Dispara `navigator.vibrate()`
  - [ ] Pulso visual no número (keyframe loop framer-motion)
  - [ ] Uma vez por cruzamento (não repete enquanto acima)
  - [ ] `0` / vazio → desabilitado

---

## Etapa 11 — PWA polish

- [ ] Validar `app/manifest.ts`: `name: "Speedo"`, `display: standalone`, `theme_color` preto/branco
- [ ] Ícones 192×192 e 512×512 em `public/icons/`
- [ ] Revisar `public/sw.js` + `app/sw-register.tsx`: cache offline de assets estáticos
- [ ] Testar prompt de instalação no Chrome Android (reaproveitar `usePWAInstall` se útil)

---

## Etapa 12 — Cleanup e QA

- [ ] Remover `app/MVP/` (ou mover para `spec/reference-mvp/` se quiser preservar)
- [ ] Substituir classes raw (`text-white`, `bg-black`, slate/cyan) por semânticas (`text-foreground`, `bg-background`, `border-border`)
- [ ] `pnpm type-check` limpo
- [ ] `pnpm lint` limpo
- [ ] Smoke test em device real:
  - [ ] Portrait + landscape
  - [ ] GPS frio (badge `Waiting…`)
  - [ ] Auto-start e auto-pause (10s)
  - [ ] Session recovery
  - [ ] Alerta de velocidade (vibração + visual)
  - [ ] Modo foco (fullscreen + tap toggle)
  - [ ] Tema dark/light
  - [ ] Troca de idioma PT/EN
  - [ ] Instalação PWA
- [ ] Commit incremental e push em `claude/plan-app-development-pGrxT`

---

## Riscos monitorados (PRD §4)

- [ ] Conflito de gestos Embla externo × interno — validar na Etapa 8
- [ ] `coords.speed === null` — coberto na Etapa 4 (Haversine)
- [ ] GPS frio — badge `Waiting…`, não auto-iniciar antes do fix
- [ ] Wake Lock não suportado — aviso discreto na Etapa 6
- [ ] `requestFullscreen` no iOS — fora de escopo, documentar
- [ ] Suspensão de GPS ao minimizar — orientar usuário + `visibilitychange`
