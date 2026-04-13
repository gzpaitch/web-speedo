# PR Review — TODOs e Análise

> PR #1 · `feat: scaffold MVP structure with PWA support and updated specs`
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

### CI-1 · `format:check` formatava em vez de verificar
**Arquivo:** `package.json`
Script corrigido de `biome format .` para `biome format --check .`.

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
