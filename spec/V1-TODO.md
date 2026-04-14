# Speedo v1.0 — TODO

**Branch:** `claude/plan-app-development-pGrxT`
**Última atualização:** Stages 0-7 concluídos, bugs de PR em aberto.

---

## ✅ Concluído

- [x] **Stage 0** — Fundação: dependências, constants, tokens OKLCH, Bebas Neue, shadcn Dialog/Switch/Badge/Separator
- [x] **Stage 1** — Providers & storage: ThemeProvider (sem persistência), AppProviders, lib/storage.ts, lib/calories.ts
- [x] **Stage 2** — i18n: next-intl, en.json, pt.json, IntlProvider + useLanguage()
- [x] **Stage 3** — Onboarding: useGpsPermission, GpsPermissionScreen, GpsDeniedScreen, GpsPermissionGate
- [x] **Stage 4** — Speedometer (dados): useGeolocation, useSession (máquina de estados), useMetrics, useActiveMetrics, useSessionDraft, useFocusMode, utils (haversine, speed, metrics)
- [x] **Stage 5** — Speedometer (UI): DigitalDisplay, GpsStatus, MetricCard, MetricsCarousel, MetricsEditMode, SessionControls, SpeedometerScreen (portrait + landscape + alerta)
- [x] **Stage 6** — Settings: useSettings, SettingsScreen, ToggleRow, NumberInputRow, LanguageSelector, MetricsToggleList, useWakeLock
- [x] **Stage 7** — Stats: useRecords, RecordCard, ResetRecordsButton, StatsScreen

---

## 🐛 Bugs do PR a corrigir (antes de continuar stages)

### P1 — Críticos

- [x] ~~Double `onSessionEnd` callback~~ — `SpeedometerScreen` chamava o callback duas vezes (fix: 41151ce)
- [ ] **`app/globals.css:9`** — `--font-display: var(--font-display)` é referência circular; fonte nunca é aplicada
- [ ] **`useSessionDraft.ts`** — `clearSessionDraft()` dispara no mount quando `isActive=false`, apagando o draft antes que o Stage 9 possa recuperá-lo
- [ ] **`useGpsPermission.ts:93`** — erros de geolocalização não relacionados a permissão são mapeados como `denied`, bloqueando o retry correto
- [ ] **`useWakeLock.ts:63`** — o `release` listener não valida se o sentinel é o atual; um release antigo pode zerar um lock novo

### P2 — Médios

- [ ] **`useGeolocation.ts:83`** — ramo `else` final seta `weak` novamente; `weakMax` vira inefetivo. Deve usar `waiting`
- [ ] **`SpeedometerScreen.tsx:92`** — parse do valor formatado com `.replace(",", ".")` quebra em locales que usam vírgula como separador de milhar; usar `currentSpeedMps` diretamente
- [ ] **`useSession.ts:~260`** — usar `reading.timestamp` em vez de `Date.now()` para integração mais precisa de tempo/distância
- [ ] **`useSession.ts:~92`** — ganho de elevação sem threshold (GPS é ruidoso); adicionar mínimo de ~2 m antes de acumular
- [ ] **`lib/storage.ts:191`** — `getSessionDraft` sem sanitização; JSON malformado pode quebrar o reducer no hydrate
- [ ] **`lib/storage.ts:123`** — `keepScreenOn: Boolean(x)` aceita truthy; deve exigir boolean real (`=== true`)
- [ ] **`lib/storage.ts:209`** — `getGpsGrantedFlag` pode lançar em modo privado; envolver em try/catch
- [ ] **`MetricsEditMode.tsx:99`** — `Switch` dentro de `<button>` = controles interativos aninhados (a11y)
- [ ] **`GpsPermissionGate.tsx:53`** — estado `unsupported` cai em `GpsDeniedScreen` que sempre mostra botão Retry (ação não-funcional para dispositivo sem GPS)
- [ ] **`useOrientation.ts:17`** — `useState(() => getOrientation())` calcula via `matchMedia` no initializer → mismatch SSR/hydration
- [ ] **`ThemeProvider.tsx:47`** — `systemTheme` via `window.matchMedia` no initializer → mismatch SSR/hydration
- [ ] **`NumberInputRow.tsx:59`** — `min`/`max` não são enforçados antes de chamar `onChange`; valores fora de range são salvos
- [ ] **`useMetrics.ts:59`** — `totalTime` usa `Date.now()` mas o interval só roda quando `currentTime` está ativo; métrica fica estagnada quando `currentTime` não está selecionado

---

## 🔲 Stages pendentes

### Stage 8 — Shell e navegação

- [ ] `components/ui/AppShell.tsx` — Embla externo com 3 telas (`startIndex: 1` → speedometer no centro)
- [ ] `components/ui/SlideIndicator.tsx` — dots de navegação
- [ ] Validar que o Embla externo (telas) não conflita com o Embla interno (métricas)
- [ ] Atualizar `app/page.tsx`: `GpsPermissionGate → AppShell`

### Stage 9 — Session recovery

- [ ] `components/ui/SessionRecoveryModal.tsx`
- [ ] No mount do AppShell: detectar `speedo:session_draft` e abrir modal com tempo + distância
- [ ] Retomar → `useSession.hydrate(draft)`, estado `MANUALLY_PAUSED`
- [ ] Descartar → `clearSessionDraft()`, inicia do zero

### Stage 10 — Verificação de Wake Lock e alertas

> `useWakeLock` e `useOrientation` já criados nas Stages 6 e 4. Alerta de velocidade já está em `SpeedometerScreen`.

- [ ] Testar Wake Lock + `visibilitychange` end-to-end no device real
- [ ] Verificar vibração (`navigator.vibrate`) no Android
- [ ] Confirmar que o alerta só dispara uma vez por cruzamento (não repete enquanto acima)

### Stage 11 — PWA polish

- [ ] Validar `app/manifest.ts`: `name: "Speedo"`, `display: standalone`, `theme_color` preto/branco
- [ ] Checar ícones 192×192 e 512×512 em `public/icons/`
- [ ] Revisar `public/sw.js` + `app/sw-register.tsx`: cache offline de assets estáticos

### Stage 12 — Cleanup e QA

- [ ] Remover `app/MVP/` (ou mover para `spec/reference-mvp/`)
- [ ] Remover `components/theme-provider.tsx` (next-themes, não mais usado)
- [ ] Substituir classes raw remanescentes por tokens semânticos
- [ ] `pnpm type-check` limpo
- [ ] `pnpm exec biome check` limpo em todos os arquivos
- [ ] Smoke test em device real:
  - [ ] Portrait + landscape
  - [ ] GPS frio (badge `Waiting…`)
  - [ ] Auto-start e auto-pause (10 s)
  - [ ] Session recovery
  - [ ] Alerta de velocidade (vibração + visual)
  - [ ] Modo foco (fullscreen + tap toggle)
  - [ ] Tema dark / light
  - [ ] Troca de idioma PT / EN
  - [ ] Instalação PWA
- [ ] Push final em `claude/plan-app-development-pGrxT`
