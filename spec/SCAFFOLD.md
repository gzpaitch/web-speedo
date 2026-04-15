# Scaffold — Speedo PWA

## Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (providers, metadata, PWA meta tags)
│   ├── page.tsx                    # Entry point → renderiza <AppShell /> ou <GpsPermissionGate />
│   └── globals.css                 # CSS variables de tema (--background, --foreground, etc.)
│
├── tailwind.config.ts              # darkMode: 'class' + mapeamento dos tokens CSS
│
├── features/
│   ├── speedometer/
│   │   ├── components/
│   │   │   ├── SpeedometerScreen.tsx     # Tela 2 — layout principal (portrait + landscape)
│   │   │   ├── DigitalDisplay.tsx        # Número animado da velocidade (framer-motion spring)
│   │   │   ├── MetricsCarousel.tsx       # Embla interno — pares de métricas com swipe
│   │   │   ├── MetricCard.tsx            # Card individual de métrica (label + valor)
│   │   │   ├── MetricsEditMode.tsx       # Overlay de edição de métricas ativas
│   │   │   ├── SessionControls.tsx       # Botões Pausar / Retomar / Finalizar
│   │   │   ├── GpsStatus.tsx             # Badge de status GPS
│   │   │   └── FocusMode.tsx             # Wrapper de fullscreen ao iniciar sessão
│   │   ├── hooks/
│   │   │   ├── useGeolocation.ts         # Geolocation API + fallback Haversine
│   │   │   ├── useSession.ts             # useReducer — IDLE/RUNNING/AUTO_PAUSED/MANUALLY_PAUSED
│   │   │   ├── useMetrics.ts             # Calcula métricas derivadas da sessão em tempo real
│   │   │   ├── useActiveMetrics.ts       # Gerencia quais métricas estão ativas/ordem
│   │   │   ├── useSessionDraft.ts        # Persiste/restaura sessão interrompida (session_draft)
│   │   │   └── useFocusMode.ts           # requestFullscreen + toggle por toque
│   │   ├── utils/
│   │   │   ├── speed.ts                  # Conversões m/s → km/h → mph
│   │   │   ├── haversine.ts              # Distância entre coordenadas GPS
│   │   │   └── metrics.ts                # Formatação de valores por tipo de métrica
│   │   ├── types/
│   │   │   └── index.ts                  # SessionState, GpsStatus, MetricId, SpeedReading
│   │   └── index.ts
│   │
│   ├── stats/
│   │   ├── components/
│   │   │   ├── StatsScreen.tsx           # Tela 3 — layout (portrait + landscape grid)
│   │   │   ├── RecordCard.tsx            # Card individual de recorde
│   │   │   └── ResetRecordsButton.tsx    # Botão com modal de confirmação (shadcn Dialog)
│   │   ├── hooks/
│   │   │   └── useRecords.ts             # Lê/salva/reseta recordes do localStorage
│   │   ├── types/
│   │   │   └── index.ts                  # Records, SessionSummary
│   │   └── index.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── SettingsScreen.tsx        # Tela 1 — layout (portrait + landscape 2 colunas)
│   │   │   ├── ToggleRow.tsx             # Linha reutilizável com shadcn Switch
│   │   │   ├── NumberInputRow.tsx        # Linha com input numérico (inputmode=numeric)
│   │   │   ├── MetricsToggleList.tsx     # Lista de toggles para ativar/desativar métricas
│   │   │   └── LanguageSelector.tsx      # Seletor PT / EN
│   │   ├── hooks/
│   │   │   └── useSettings.ts            # Lê/salva settings no localStorage
│   │   ├── types/
│   │   │   └── index.ts                  # AppSettings, MetricId
│   │   └── index.ts
│   │
│   └── onboarding/
│       ├── components/
│       │   ├── GpsPermissionGate.tsx     # Wrapper — bloqueia app se GPS negado
│       │   ├── GpsPermissionScreen.tsx   # Tela de solicitação de permissão GPS
│       │   └── GpsDeniedScreen.tsx       # Tela de bloqueio + instrução para habilitar
│       ├── hooks/
│       │   └── useGpsPermission.ts       # Verifica/solicita permissão, persiste estado
│       └── index.ts
│
├── components/
│   └── ui/
│       ├── AppShell.tsx                  # Embla Carousel externo — 3 telas, inicia na tela 2
│       ├── SlideIndicator.tsx            # Dots de navegação entre telas
│       ├── Modal.tsx                     # Modal genérico de confirmação (shadcn Dialog)
│       └── SessionRecoveryModal.tsx      # Modal de recuperação de sessão interrompida
│
├── hooks/
│   ├── useWakeLock.ts                    # Screen Wake Lock API + reativação por visibilitychange
│   └── useOrientation.ts                 # Detecta portrait/landscape para layouts adaptativos
│
├── lib/
│   ├── storage.ts                        # Wrappers tipados: settings, records, session_draft
│   └── calories.ts                       # Cálculo de calorias (MET × peso × tempo)
│
├── i18n/
│   ├── locales/
│   │   ├── pt.json                       # Strings em português
│   │   └── en.json                       # Strings em inglês
│   └── config.ts                         # Configuração do next-intl
│
├── providers/
│   ├── AppProviders.tsx                  # Agrupa ThemeProvider + IntlProvider
│   └── ThemeProvider.tsx                 # Lê prefers-color-scheme, expõe useTheme()
│
├── types/
│   └── global.ts                         # Tipos globais compartilhados
│
└── constants/
    └── index.ts                          # AUTO_PAUSE_DELAY, SESSION_DRAFT_INTERVAL, MET, etc.
```

---

## Responsabilidades por camada

### `features/`
Cada feature é **auto-contida**: componentes, hooks, tipos e utils próprios. Comunicação entre features exclusivamente via `lib/storage.ts`.

| Feature | Responsabilidade |
|---|---|
| `speedometer` | GPS, sessão, cálculo de métricas, display, modo foco |
| `stats` | Leitura e reset de recordes históricos |
| `settings` | Configurações do usuário, gerenciamento de métricas ativas |
| `onboarding` | Permissão GPS, bloqueio e orientação ao usuário |

### `components/ui/`
Componentes **sem lógica de negócio**. Apenas estrutura, layout e presentação.

### `hooks/` (raiz)
Hooks **cross-feature**: `useWakeLock` (qualquer tela pode precisar) e `useOrientation` (usado por todas as telas para layout adaptativo).

### `lib/`
Funções puras e infraestrutura. **Zero dependência de React** — testáveis isoladamente.

### `providers/`
Contextos globais separados do `app/layout.tsx` para não poluir o root.

---

## Fluxo de dados

```
GpsPermissionGate
      ↓ (permissão concedida)
AppShell (Embla externo — 3 telas)
      │
      ├── Tela 1: SettingsScreen
      │     └── useSettings → lib/storage.ts (speedo:settings)
      │
      ├── Tela 2: SpeedometerScreen
      │     ├── useGpsPermission → navigator.permissions
      │     ├── useGeolocation → Geolocation API
      │     ├── useSession (useReducer) → estado da sessão
      │     ├── useMetrics → métricas derivadas em tempo real
      │     ├── useActiveMetrics → lib/storage.ts (speedo:settings)
      │     ├── useSessionDraft → lib/storage.ts (speedo:session_draft)
      │     └── useFocusMode → document.requestFullscreen()
      │
      └── Tela 3: StatsScreen
            └── useRecords → lib/storage.ts (speedo:records)

Ao finalizar sessão:
useSession → lib/storage.ts → salva/atualiza speedo:records
                            → apaga speedo:session_draft
```

---

## Notas de implementação

- **Dois Embla independentes:** o externo navega entre as 3 telas; o interno (`MetricsCarousel`) navega entre pares de métricas — instâncias separadas para não conflitar nos gestos
- **`useSession`** usa `useReducer` com estados `IDLE | RUNNING | AUTO_PAUSED | MANUALLY_PAUSED`
- **`useSessionDraft`** persiste o estado da sessão no `localStorage` a cada 5s via `setInterval` e restaura ao montar o componente
- **`useOrientation`** escuta `window.addEventListener('orientationchange')` e retorna `'portrait' | 'landscape'` — usado por todas as telas para alternar layouts
- **`GpsPermissionGate`** envolve o `AppShell` inteiro — se GPS negado, nenhuma tela é renderizada
- **Tema:** `ThemeProvider` lê `prefers-color-scheme` na montagem e aplica `.dark` ou `.light` no `<html>`; o toggle nas Settings chama `setTheme` no contexto mas **não persiste** — ao fechar o app reseta para o sistema
- **CSS variables:** todas as cores usam tokens semânticos (`--background`, `--foreground`, `--muted`, etc.) definidos em `globals.css` — nunca valores hardcoded. Isso permite adicionar novas paletas na v2 alterando apenas `globals.css`
- **Regra de ouro:** sempre `text-foreground`, `bg-background`, `border-border` — nunca `text-white`, `bg-black`
- **`lib/storage.ts`** exporta funções tipadas: `getSettings / saveSettings`, `getRecords / saveRecords`, `getSessionDraft / saveSessionDraft / clearSessionDraft`
- **`AppShell`** inicia na posição `1` (índice da tela Speedometer)
- **i18n** usa `en` como idioma padrão e permite troca para PT-BR nas configurações
- **Inputs numéricos** usam `inputmode="numeric"` para abrir teclado numérico no mobile
