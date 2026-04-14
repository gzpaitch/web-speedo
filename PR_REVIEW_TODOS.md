# PR Review — TODOs e Análise

> PR #1 · `feat: scaffold MVP structure with PWA support and updated specs`
> PR #3 · `feat: unify GPS/status UI, fix permission flow, and auto-unregister SW in dev`
> PR #5 · `feat(v1): v1.0 development — foundation through stats (Stages 0-7)`
> Revisado por: CodeRabbit + Qodo + Kilo + Gemini + Cubic

---

## ✅ Corrigidos

### BUG-1 · GPS travado após erro de geolocalização
**Arquivo:** `app/MVP/useChromeSpeedometer.ts`
O handler de erro do `watchPosition` agora chama `clearWatch` e zera `watchIdRef.current`, permitindo reiniciar o GPS após qualquer erro sem reload.

### LEAK-1 · `PermissionStatus.onchange` não removido no cleanup
**Arquivo:** `app/MVP/useChromeSpeedometer.ts`
Substituído `status.onchange = ...` por `addEventListener("change", handler)` com `removeEventListener` no cleanup do `useEffect`.

### LEAK-2 · `appinstalled` listener vazando no `usePWAInstall`
**Arquivo:** `app/MVP/usePWAInstall.ts`
Handler extraído em variável e removido no cleanup junto com `beforeinstallprompt`.

### DATA-1 · Guard para timestamp duplicado
**Arquivo:** `app/MVP/useChromeSpeedometer.ts`
Guard `timestamp <= previousTimestamp` descarta updates com mesmo timestamp, evitando samples com `speed=0` que distorciam a média.

### DATA-2 · `stop()` não limpava `samplesRef`
**Arquivo:** `app/MVP/useChromeSpeedometer.ts`
`stop()` agora zera `samplesRef.current = []`, evitando que dados da sessão anterior poluam a próxima.

### PERF-1 · Spread + slice no array de samples a cada update GPS
**Arquivo:** `app/MVP/useChromeSpeedometer.ts`
Substituído por `push` + `shift` condicional — mutação direta no `useRef`, sem alocar novo array a cada callback.

### SW-1 · Service Worker registrado fora de produção
**Arquivo:** `app/sw-register.tsx`
Registro agora condicionado a `NODE_ENV === "production"`. Adicionado `.catch` para logar falhas silenciosas.

### SW-2 · Cache-first persistia respostas 404/500
**Arquivo:** `public/sw.js`
Adicionado guard `res.ok` antes de cachear — tanto na estratégia cache-first (assets) quanto network-first (navegação).

### SW-3 · Cache cleanup apagava caches de outras origens
**Arquivo:** `public/sw.js`
Cleanup agora filtra por prefixo `speedo-`, deletando apenas caches próprios do app.

### CI-1 · Script `format:check` com comando inválido
**Arquivo:** `package.json`
`biome format --check .` não existe no Biome CLI — o flag `--check` não é reconhecido.
Corrigido para `biome ci .`, que verifica formatação + lint sem escrever arquivos e falha com exit ≠ 0 quando há problemas. *(A tentativa anterior de usar `biome format --check` era incorreta — CodeRabbit confirmou via web search.)*

### BUG-2 · `getRegistrations()` sem `.catch()` em modo dev
**Arquivo:** `app/sw-register.tsx` (PR #3)
`navigator.serviceWorker.getRegistrations().then(...)` não tinha tratamento de erro.
Como o componente é montado no root layout, qualquer rejeição gerava unhandled promise rejection a cada page load em dev.
Adicionado `.catch((err) => console.warn("[SW] Failed to unregister:", err))`.

### CODE-1 · `TrackingButtonConfig.onClick` morto + IIFE desnecessário
**Arquivo:** `app/MVP/SpeedometerMVP.tsx` (PR #3)
O campo `onClick` em `TrackingButtonConfig` era sempre `undefined` em todos os branches de `resolveTrackingButton()` e nunca era lido pelo componente — o handler real era calculado separadamente dentro de um IIFE no JSX.
- Removido `onClick` do tipo `TrackingButtonConfig`
- Substituído o IIFE por variáveis pré-calculadas (`trackingBtn`, `TrackingIcon`, `trackingOnClick`) antes do `return` do componente, tornando o JSX mais legível

### RECOVERY-1 · `useSessionDraft` apagava recovery draft no mount inicial
**Arquivo:** `features/speedometer/hooks/useSessionDraft.ts` (PR #5)
Comentário do Gemini fazia sentido: ao montar com sessão `IDLE`, o effect limpava o draft antes da futura tela de recovery poder lê-lo.
Corrigido com `hasMountedRef` para impedir `clearSessionDraft()` no mount inicial e só limpar após transição ativa → inativa.

### DATA-3 · Integração temporal da sessão usava `Date.now()` em vez de `reading.timestamp`
**Arquivo:** `features/speedometer/hooks/useSession.ts` (PR #5)
Comentário do Gemini procedente. `applyReading()` agora prefere `reading.timestamp` e cai para `Date.now()` apenas como fallback, reduzindo erro de integração quando a main thread atrasa.

### UI-1 · Estado `unsupported` mostrava CTA de retry sem ação válida
**Arquivo:** `features/onboarding/components/GpsPermissionGate.tsx` (PR #5)
Comentário do Cubic procedente. O fluxo `unsupported` estava reutilizando `GpsDeniedScreen`, que sempre renderiza botão de retry.
Corrigido separando o fluxo de browser sem suporte do fluxo de permissão negada.

### HYDRATION-1 · `useOrientation` inicializava estado com leitura do client durante render
**Arquivo:** `hooks/useOrientation.ts` (PR #5)
Comentário do Cubic procedente. A leitura inicial podia divergir entre SSR e hidratação.
Corrigido usando valor estável na renderização inicial e atualização posterior em effect.

### GPS-1 · Branch final de accuracy marcava `weak` duas vezes
**Arquivo:** `features/speedometer/hooks/useGeolocation.ts` (PR #5)
Comentário do Cubic procedente. O `else` final tornava `weakMax` inócuo e tratava sinal muito ruim como utilizável.
Corrigido para degradar corretamente o estado de GPS no branch final.

### DATA-4 · `keepScreenOn` aceitava qualquer truthy no sanitize
**Arquivo:** `lib/storage.ts` (PR #5)
Comentário do Cubic procedente. O sanitize foi endurecido para aceitar apenas booleano real (`true`), evitando coercions indevidas.

### DATA-5 · `getGpsGrantedFlag()` podia lançar ao acessar `localStorage`
**Arquivo:** `lib/storage.ts` (PR #5)
Comentário do Cubic procedente. A leitura agora está protegida por `try/catch`, cobrindo cenários como storage bloqueado.

### UX-1 · `NumberInputRow` não forçava `min`/`max` antes de persistir
**Arquivo:** `features/settings/components/NumberInputRow.tsx` (PR #5)
Comentário do Cubic procedente. O valor numérico agora é validado/clampado antes de propagar `onChange`, em vez de confiar só no limite visual do input.

### DATA-6 · Métrica `totalTime` podia ficar stale quando `currentTime` não estava ativa
**Arquivo:** `features/speedometer/hooks/useMetrics.ts` (PR #5)
Comentário do Cubic procedente. O tick temporal foi ajustado para não depender apenas da seleção de `currentTime`.

### HYDRATION-2 · `ThemeProvider` lia tema do sistema no initializer
**Arquivo:** `providers/ThemeProvider.tsx` (PR #5)
Comentário original do Cubic procedente: inicializar `systemTheme` a partir de `matchMedia` no render podia causar mismatch SSR/client.
Corrigido usando default estável no SSR e sincronização via `useEffect` após mount.

### UI-2 · `watchDrag` do shell ignorava targets SVG dentro do carousel interno
**Arquivo:** `components/ui/AppShell.tsx` (PR #5)
Comentário do Cubic procedente. O guard foi ampliado para não depender só de `HTMLElement`, evitando que gestos em ícones SVG arrastem o carousel externo.

### UI-3 · `SlideIndicator` usava `key={label}`
**Arquivo:** `components/ui/SlideIndicator.tsx` (PR #5)
Comentário do Cubic procedente. Labels duplicados podiam causar reuse incorreto de tabs no React.
Corrigido adotando chave estável que inclui o índice.

### STORAGE-1 · `sanitizeSessionDraft()` agora valida o shape completo
**Arquivo:** `lib/storage.ts` (PR #5)
Comentário do Cubic procedente. O sanitize deixava passar objetos parcialmente inválidos por fazer cast cego após validação incompleta.
Corrigido validando explicitamente `state`, `updatedAt` e `lastAltitude`, além de retornar um objeto normalizado em vez de `raw as SessionDraft`.

### STATS-1 · `onHookReady` agora dispara só uma vez no mount
**Arquivo:** `features/stats/components/StatsScreen.tsx` (PR #5)
Comentário do Cubic procedente. O effect dependia de `recordsHook`, então reexecutava quando `records`/`hydrated` mudavam.
Corrigido usando uma ref estável para o hook exposto ao shell e effect com `[]`, preservando o contrato one-shot.

---

## 🔲 Pendentes (decisão de produto)

### SEMANTIC-1 · Velocidade média: rolling average vs. média da sessão
**Arquivo:** `app/MVP/useChromeSpeedometer.ts` · linha ~247

O código calcula rolling average dos últimos 120 samples (~2 min). O PRD especifica `distância total / tempo em movimento`. Requer decisão de design antes de implementar.

### SEMANTIC-2 · Distância percorrida ausente no estado
**Arquivo:** `app/MVP/useChromeSpeedometer.ts` · linha ~23

`ChromeSpeedometerState` não expõe `totalDistanceMeters`. PRD (Seção 7) lista como métrica da Tela 2. Feature a implementar em iteração futura. Requer:
- `totalDistanceRef` como `useRef<number>`
- Acumular `haversineMeters()` a cada update com `previousPosition` válido
- Expor no estado e exibir em `SpeedometerMVP.tsx`

### SPEC-1 · Auto-fullscreen requer user activation
**Arquivo:** `spec/PRD.md` · linha ~115

`Element.requestFullscreen()` requer transient user activation nos browsers móveis modernos (Chrome, Safari, Firefox). A sessão que inicia via GPS auto-start não dispara uma gesture do usuário, tornando o critério de "entrar em fullscreen automaticamente" inviável.
Opções:
- Diferir o fullscreen até o usuário tocar na tela após o início do tracking
- Exigir um botão "Start" explícito que sirva de gesture (já suficiente para GPS + fullscreen no mesmo tap)

### THEME-1 · Default `"dark"` evita mismatch, mas ainda pode causar flash incorreto em SO light
**Arquivo:** `providers/ThemeProvider.tsx` · linha ~49 (PR #5)

O comentário novo do Cubic aponta um efeito visual real: o app nasce em `"dark"` e só depois do mount corrige para `"light"` quando o sistema prefere claro.
Mas a sugestão literal do review ("inicializar com `getSystemTheme()`") reintroduz o problema anterior de hidratação. Se isso virar prioridade de UX, a correção precisa ser via tema injetado antes da hidratação (por exemplo script inline no documento), não via `matchMedia` no initializer do React.

---

## 🚫 Falso positivo / Não aplicável

### Haversine `lat2` usa `from.lat`
**Arquivo:** `app/MVP/useChromeSpeedometer.ts` · linha ~49
Comentário inválido — o código já usa corretamente `lat2 = toRadians(to.lat)`.

### `isWatching=false` em erros recuperáveis
**Arquivo:** `app/MVP/useChromeSpeedometer.ts` · linha ~277
Comentário baseado no código anterior ao BUG-1. Com o fix aplicado, qualquer erro para o watch completamente — comportamento intencional.

### Comentários em `spec/`, `README.md`, `SCAFFOLD.md`
Documentação, não afeta runtime. Sem prioridade.

### `SlideIndicator`: "label concatenation" geraria `Settings1`
**Arquivo:** `components/ui/SlideIndicator.tsx` · linha ~30 (PR #5)
Falso positivo do Kilo. A expressão atual é `labels[index] ?? \`${index + 1}\``, usando nullish coalescing, não concatenação.
O problema real nesse ponto era outro: `key={label}` não garante unicidade quando há labels repetidos.
