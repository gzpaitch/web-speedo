# Speedo v1.0 — TODO

**Branch:** `claude/plan-app-development-pGrxT`
**Última atualização:** Stages 0-9 concluídos; seguem pendências de verificação em device/PWA e 3 itens de bug/documentação mantidos em aberto.

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
- [x] **`app/globals.css:9`** — `--font-display: var(--font-display)` é referência circular; fonte nunca é aplicada
- [x] **`useSessionDraft.ts`** — `clearSessionDraft()` dispara no mount quando `isActive=false`, apagando o draft antes que o Stage 9 possa recuperá-lo
- [x] **`useGpsPermission.ts:93`** — erros de geolocalização não relacionados a permissão são mapeados como `denied`, bloqueando o retry correto
- [x] **`useWakeLock.ts:63`** — o `release` listener não valida se o sentinel é o atual; um release antigo pode zerar um lock novo

### P2 — Médios

- [x] **`useGeolocation.ts:83`** — ramo `else` final seta `weak` novamente; `weakMax` vira inefetivo. Deve usar `waiting`
- [x] **`SpeedometerScreen.tsx:92`** — parse do valor formatado com `.replace(",", ".")` quebra em locales que usam vírgula como separador de milhar; usar `currentSpeedMps` diretamente
- [x] **`useSession.ts:~260`** — usar `reading.timestamp` em vez de `Date.now()` para integração mais precisa de tempo/distância
- [x] **`useSession.ts:~92`** — ganho de elevação sem threshold (GPS é ruidoso); adicionar mínimo de ~2 m antes de acumular
- [x] **`lib/storage.ts:191`** — `getSessionDraft` sem sanitização; JSON malformado pode quebrar o reducer no hydrate
- [x] **`lib/storage.ts:123`** — `keepScreenOn: Boolean(x)` aceita truthy; deve exigir boolean real (`=== true`)
- [x] **`lib/storage.ts:209`** — `getGpsGrantedFlag` pode lançar em modo privado; envolver em try/catch
- [x] **`MetricsEditMode.tsx:99`** — `Switch` dentro de `<button>` = controles interativos aninhados (a11y)
- [x] **`GpsPermissionGate.tsx:53`** — estado `unsupported` cai em `GpsDeniedScreen` que sempre mostra botão Retry (ação não-funcional para dispositivo sem GPS)
- [x] **`useOrientation.ts:17`** — `useState(() => getOrientation())` calcula via `matchMedia` no initializer → mismatch SSR/hydration
- [x] **`ThemeProvider.tsx:47`** — `systemTheme` via `window.matchMedia` no initializer → mismatch SSR/hydration
- [x] **`NumberInputRow.tsx:59`** — `min`/`max` não são enforçados antes de chamar `onChange`; valores fora de range são salvos
- [x] **`useMetrics.ts:59`** — `totalTime` usa `Date.now()` mas o interval só roda quando `currentTime` está ativo; métrica fica estagnada quando `currentTime` não está selecionado
- [x] **`app/layout.tsx:60`** — `<html lang="en">` hardcoded não reflete o idioma ativo (PT/EN); leitores de tela anunciam em inglês mesmo no PT
- [ ] **`app/layout.tsx:40-50`** — viewport com `maximumScale: 1` + `userScalable: false` bloqueia zoom (a11y) — **intencional para PWA de ciclismo (PRD §2)**
- [x] **`SpeedometerScreen.tsx:149,164`** — `aria-label="Speedometer"` e `aria-label="Toggle focus mode"` hardcoded em inglês; usar `useTranslations("session")`
- [x] **`SettingsScreen.tsx:124-128`** — texto `"loading settings"` hardcoded em inglês (deveria usar `t("loading")`)
- [ ] **`components/ui/dialog.tsx:41-43`** — variantes Tailwind inválidas `data-open:` / `data-closed:`; deveria ser `data-[state=open]:` / `data-[state=closed]:` — **requer verificação; shadcn pode usar atributos custom**
- [x] **`metrics.ts:113-118`** — `formatCoords` não checa `Number.isFinite(lat/lon)`; retornaria `"NaN"` para coords inválidas
- [x] **`lib/calories.ts:14-19`** — sem guard `Number.isFinite(weightKg)` / `Number.isFinite(movementMs)`; aceita `Infinity`
- [x] **`StatsScreen.tsx:33-35`** — `onHookReady?.(recordsHook)` dispara em todo render porque `recordsHook` é novo objeto a cada render
- [x] **`useRecords.ts:97`** — retorno `{ records, applySession, reset, hydrated }` não é memoizado → referência instável
- [ ] **`useSession.ts:257-275`** — `applyReading` lê `snapshotRef.current.state` após `dispatch`, que ainda é stale; calcular next phase sincronamente — **não é bug: snapshotRef lido é pré-dispatch (correto para decidir timer)**
- [x] **`MetricsCarousel.tsx:61-66`** — card único não centraliza: `grid-cols-2` reserva 2 colunas e `w-1/2` ocupa só 25%; usar `col-span-2`
- [x] **`SettingsScreen.tsx:49-54`** — toggle de tema perde a opção `"system"` permanentemente após primeira interação
- [x] **`useMetrics.ts:52`** — parâmetro `sessionState` recebido e descartado como `_sessionState` (dead parameter)
- [x] **`LanguageSelector.tsx:22-31`** — botões de idioma sem `aria-pressed` (a11y)
- [x] **`GpsPermissionGate.tsx:38-40`** — bloco `if (next !== "granted") { /* comment */ }` é dead code
- [ ] **`MetricsEditMode.tsx:99-103`** — `onCheckedChange` no `Switch` com `pointer-events-none` nunca dispara (callback morto) — **mantido: React requer handler em controlled component**

---

## 🔲 Stages pendentes

### Stage 8 — Shell e navegação

- [x] `components/ui/AppShell.tsx` — Embla externo com 3 telas (`startIndex: 1` → speedometer no centro)
- [x] `components/ui/SlideIndicator.tsx` — dots de navegação
- [x] Validar que o Embla externo (telas) não conflita com o Embla interno (métricas)
- [x] Atualizar `app/page.tsx`: `GpsPermissionGate → AppShell`

### Stage 9 — Session recovery

- [x] `components/ui/SessionRecoveryModal.tsx`
- [x] No mount do AppShell: detectar `speedo:session_draft` e abrir modal com tempo + distância
- [x] Retomar → `useSession.hydrate(draft)`, estado `MANUALLY_PAUSED`
- [x] Descartar → `clearSessionDraft()`, inicia do zero

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
