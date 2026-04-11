# PRD — Speedo

**Version:** 1.0  
**Status:** Ready for Development  
**Stack:** Next.js + PWA  
**Platform:** Android (Chrome Mobile)

---

## 1. Overview

**Speedo** é uma Progressive Web App (PWA) construída com Next.js que transforma o smartphone do ciclista em um ciclocomputador digital. O app utiliza a Geolocation API do browser para capturar dados de velocidade em tempo real, exibindo métricas da sessão e mantendo um registro de recordes históricos — tudo armazenado localmente no dispositivo, sem necessidade de conta ou backend.

### Problema
Ciclocomputadores dedicados custam caro. Apps nativos exigem download e permissões extensas. O ciclista casual precisa de uma solução leve, instalável e que funcione offline, acessível direto pelo browser.

### Solução
Uma PWA instalável que roda no Chrome do Android, com interface de três telas navegáveis por swipe, velocímetro digital em tempo real e persistência local de recordes.

---

## 2. Objetivos

| Objetivo | Métrica de sucesso |
|---|---|
| Exibir velocidade em tempo real | Latência < 2s após iniciar sessão |
| Registrar recordes históricos | Dados persistem após fechar o app |
| Funcionar como PWA instalável | Ícone na home screen, funciona offline |
| Suporte a dark/light mode | Segue tema do sistema por padrão |
| Suporte a i18n (PT/EN) | Todas as strings traduzidas |

---

## 3. Fora do Escopo (v1.0)

- Mapa/trajeto da rota
- Gráfico de velocidade por sessão
- Login e sincronização em nuvem *(planejado para v2)*
- Customização de fonte/cor do velocímetro *(planejado para v2)*
- Velocímetro analógico *(planejado para v2)*
- Exportação de dados

---

## 4. Usuário-alvo

Ciclista casual ou recreativo que usa Android e quer acompanhar sua velocidade sem instalar um app dedicado. Não requer cadastro, configuração técnica ou hardware adicional.

---

## 5. Identidade Visual

| Atributo | Decisão |
|---|---|
| Nome | **Speedo** |
| Domínio | `speedo.bike` |
| Estilo | Minimalista utilitário |
| Paleta | Preto, branco e tons de cinza |
| Dark mode | Padrão — segue tema do sistema |
| Fonte do velocímetro | Display numérica, peso heavy (ex: `Oswald`, `Barlow Condensed`, ou `Bebas Neue`) |
| Animação da velocidade | Contagem suave estilo odômetro (framer-motion spring) |

**Princípio visual:** interface que desaparece — o número de velocidade é o protagonista. Sem ornamentos desnecessários. Contraste alto para legibilidade ao sol.

### Sistema de Temas

O sistema de temas é implementado desde a v1 com **CSS variables semânticas** via shadcn/ui + Tailwind. Isso garante que paletas alternativas e customizações futuras sejam triviais de adicionar.

#### Tokens CSS (globals.css)

```css
/* Light */
:root {
  --background:   0 0% 100%;      /* #ffffff */
  --foreground:   0 0% 4%;        /* #0a0a0a */
  --muted:        0 0% 96%;       /* #f5f5f5 */
  --muted-foreground: 0 0% 45%;   /* #737373 */
  --primary:      0 0% 4%;        /* #0a0a0a */
  --primary-foreground: 0 0% 100%;
  --border:       0 0% 90%;       /* #e5e5e5 */
  --ring:         0 0% 4%;
  --radius:       0.5rem;
}

/* Dark */
.dark {
  --background:   0 0% 4%;        /* #0a0a0a */
  --foreground:   0 0% 100%;      /* #ffffff */
  --muted:        0 0% 10%;       /* #1a1a1a */
  --muted-foreground: 0 0% 55%;   /* #8c8c8c */
  --primary:      0 0% 100%;      /* #ffffff */
  --primary-foreground: 0 0% 4%;
  --border:       0 0% 15%;       /* #262626 */
  --ring:         0 0% 100%;
}
```

#### Regras de uso

- **Sempre usar classes semânticas** — nunca `text-white` ou `bg-black` diretamente
- ✅ `text-foreground`, `bg-background`, `text-muted-foreground`, `border-border`
- ❌ `text-white`, `bg-black`, `text-gray-400`
- A única exceção são cores de estado: `text-green-500` (GPS OK), `text-yellow-500` (GPS fraco)

#### ThemeProvider

```
providers/ThemeProvider.tsx
```

- Lê `prefers-color-scheme` na montagem e aplica classe `.dark` ou `.light` no `<html>`
- Expõe `useTheme()` → `{ theme, setTheme }` via Context
- `setTheme` aplica a classe imediatamente mas **não persiste** — ao fechar o app, reseta para o sistema
- Compatível com shadcn/ui nativamente (sem config extra)

#### Tailwind config

```js
// tailwind.config.ts
darkMode: 'class'  // controle via classe .dark no <html>
```

#### Roadmap de temas (v2+)
- Paleta "noturno" (vermelho escuro — melhor para olhos à noite)
- Paleta "alto contraste" (para sol intenso)
- Customização de cor de destaque do velocímetro pelo usuário

---

## 6. UI/UX — Contexto de Uso

O app é usado **em movimento, ao ar livre, com o celular preso no guidão**. Isso define todas as decisões de UI.

### Contexto físico

| Fator | Implicação |
|---|---|
| Tela ao sol | Contraste máximo, dark mode preferido, sem transparências frágeis |
| Mãos com luvas | Toque com área ampla, sem elementos pequenos ou próximos |
| Vibração do guidão | Sem interações que exijam precisão ou arrastar fino |
| Atenção dividida | Leitura em < 1 segundo, hierarquia visual clara |
| Orientação variável | Layout responsivo para portrait e landscape |

---

### Touch Targets

Todos os elementos interativos seguem as diretrizes mínimas:

| Elemento | Tamanho mínimo |
|---|---|
| Botões de ação (Pausar, Fim) | `min-h-16` (64px) — toque com luva |
| Botão de edição de métricas | `min-h-12 min-w-12` (48px) |
| Toggles nas Settings | `min-h-12` com área de toque expandida |
| Indicadores de página (dots) | `min-h-10 min-w-10` com padding invisível |
| Checkboxes no edit mode | `min-h-12 min-w-12` |

> Regra geral: nenhum elemento tocável menor que **48×48px**. Elementos críticos (pausar/retomar) chegam a **64px de altura**.

---

### Espaçamento e Densidade

- **Padding lateral:** `px-6` (24px) — nunca menos que 16px
- **Gap entre métricas:** `gap-4` (16px) mínimo
- **Margem entre velocidade e métricas:** `mt-8` (32px) — respiro visual
- **Altura dos cards de métrica:** `h-20` (80px) — legível em movimento
- **Fonte das métricas secundárias:** mínimo `text-lg` (18px), label em `text-xs` uppercase

---

### Tipografia

| Elemento | Fonte | Tamanho | Peso |
|---|---|---|---|
| Velocidade atual | Display numérica (Bebas Neue ou similar) | `text-8xl` / `9xl` portrait · `text-7xl` landscape | Heavy |
| Unidade (km/h) | Mesma display, opacidade reduzida | `text-2xl` | Regular |
| Valor das métricas | Monospace ou display | `text-2xl` | Semibold |
| Label das métricas | Sans-serif | `text-xs` uppercase tracking-widest | Regular |
| Botões | Sans-serif | `text-base` | Medium |
| Settings | Sans-serif | `text-base` | Regular |

---

### Orientação de Tela

#### Portrait (padrão)
```
┌───────────────────┐
│   [GPS badge]     │
│                   │
│       32.4        │  ← velocidade ocupa ~40% da altura
│       km/h        │
│                   │
│  [Máx] │ [Méd]   │  ← métricas em 2 colunas
│   ● ○ ○           │
│                   │
│ [Pausar]  [Fim]   │  ← botões full-width divididos
└───────────────────┘
```

#### Landscape
```
┌──────────────────────────────────────┐
│  [GPS]                    [Pausar][Fim] │
│                                        │
│   32.4 km/h   │  [Máx]  │  [Méd]      │  ← layout 3 colunas
│               │  41.2   │  28.7        │
│               │  ● ○ ○  │             │
└──────────────────────────────────────┘
```

- Em landscape, velocidade ocupa coluna esquerda (~50%), métricas ocupam direita
- Botões migram para o topo direito como ícones compactos (`min-h-12`)
- Fonte da velocidade reduz de `9xl` para `7xl` para caber na altura disponível
- Usar `@media (orientation: landscape)` + classes Tailwind `landscape:`

---

### Legibilidade ao Sol

- **Dark mode:** fundo `#0a0a0a`, texto `#ffffff` — contraste máximo
- **Light mode:** fundo `#ffffff`, texto `#0a0a0a`
- **Sem gradientes** na área do velocímetro — aumentam dificuldade de leitura
- **Sem opacidade reduzida** em dados críticos (velocidade, máx, méd)
- Opacidade reduzida apenas em labels secundários (`opacity-50`)
- Badge de GPS com cor sólida (verde/amarelo/cinza), sem outline frágil

---

### Feedback Visual e Haptic

| Evento | Feedback |
|---|---|
| Tap em botão | Scale down `0.95` via framer-motion (press feedback) |
| Sessão iniciada | Pulso sutil no número de velocidade |
| Auto-pause ativado | Número faz fade para `opacity-40` + badge "Pausado" |
| Alerta de velocidade | Pulso de borda branca/vermelha + vibração |
| Finalizar sessão | Modal com transição suave, fundo bloqueado |
| Editar métricas | Cards ganham overlay com escala leve |

---

### Settings e Stats — Landscape

Ambas as telas funcionam em portrait e landscape. Em landscape:

- Layout de **2 colunas** com scroll vertical em cada coluna
- Settings: coluna esquerda com toggles, coluna direita com inputs numéricos
- Stats: cards de recordes em grid 2×N em vez de lista linear
- Usar `@media (orientation: landscape)` com classes `landscape:` do Tailwind

### Settings — UX específico

- Itens de setting com **altura mínima de 56px** para toque fácil
- `Separator` entre grupos de configurações
- Input de peso e alerta de velocidade com `inputmode="numeric"` (teclado numérico no mobile)
- Labels descritivos + subtexto explicativo em `text-sm opacity-60`
- Scroll vertical nativo — sem carrossel nesta tela
- Toggle de tema **não persiste** ao fechar o app — sempre reseta para o tema do sistema

---

## 7. Estados e Fluxos de Sistema

### Permissão de GPS (Onboarding)

Na **primeira abertura**, antes de mostrar o velocímetro, o app solicita permissão de GPS:

```
┌─────────────────────────────┐
│                             │
│          [ ícone GPS ]      │
│                             │
│    Speedo precisa de acesso   │
│    à sua localização para   │
│    medir a velocidade.      │
│                             │
│    [ Permitir acesso GPS ]  │  ← abre prompt nativo do browser
│                             │
└─────────────────────────────┘
```

| Resultado | Comportamento |
|---|---|
| Usuário permite | Salva flag `gps_granted` no localStorage → abre speedometer normalmente |
| Usuário nega | Exibe tela de bloqueio com mensagem explicativa + botão "Tentar novamente" + instrução de como habilitar nas configurações do browser |
| Permissão negada permanentemente | Exibe mensagem específica orientando abrir as configurações do browser manualmente |

> O app **não funciona sem GPS** — não faz sentido exibir o velocímetro com dados zerados. A tela de bloqueio substitui o app inteiro até a permissão ser concedida.

---

### Sessão Interrompida (Recuperação)

Se o usuário **fechar o app acidentalmente** com uma sessão ativa, ao reabrir:

1. App detecta sessão em andamento salva no `localStorage` (`speedo:session_draft`)
2. Exibe modal de recuperação:

```
┌─────────────────────────────┐
│   Sessão em andamento       │
│                             │
│   Você tem uma sessão       │
│   pausada:                  │
│   • Tempo: 00:23:14         │
│   • Distância: 8.4 km       │
│                             │
│  [ Retomar ]  [ Descartar ] │
└─────────────────────────────┘
```

3. **Retomar:** restaura métricas, retoma sessão em estado `MANUALLY_PAUSED`
4. **Descartar:** limpa o draft, inicia do zero

> O `session_draft` é salvo a cada 5 segundos durante sessão ativa e apagado ao finalizar normalmente.

---

### Tema

| Situação | Comportamento |
|---|---|
| Primeira abertura | Segue `prefers-color-scheme` do sistema |
| Toggle nas Settings ativado | Sobrescreve enquanto o app está aberto |
| App fechado e reaberto | Volta a seguir o sistema (toggle não persiste) |

---

### Modo Foco (Fullscreen)

Ativado automaticamente ao iniciar uma sessão na tela do velocímetro:

- Chama `document.documentElement.requestFullscreen()` ao iniciar sessão
- Esconde barra de status do Android → mais espaço para o número
- Exibe **apenas** a velocidade + badge GPS + botões de controle
- Métricas secundárias e indicadores de página ficam ocultos no modo foco
- Toque simples na tela alterna entre **modo foco** e **modo normal**
- Ao pausar ou finalizar sessão, sai do fullscreen automaticamente

---

## 8. Arquitetura de Navegação

O app é composto por **3 telas** organizadas em sequência horizontal, navegáveis por **swipe (Embla Carousel)** ou toque nos indicadores de página.

```
[ Tela 1: Settings ] ←→ [ Tela 2: Velocímetro ] ←→ [ Tela 3: Stats ]
```

A tela padrão ao abrir o app é a **Tela 2 (Velocímetro)**.

---

## 7. Telas

### Tela 1 — Settings

Configurações persistidas no `localStorage`.

| Configuração | Tipo | Padrão |
|---|---|---|
| Tema (dark/light) | Toggle (shadcn Switch) | Segue sistema |
| Unidades | Toggle | Métrico (km/h, m) |
| Manter tela ligada | Toggle | Desligado |
| Peso do usuário | Input numérico | — (opcional) |
| Alerta de velocidade | Input numérico (km/h) | Desligado (0 = inativo) |
| Idioma | Seletor (PT / EN) | Segue sistema |

**Comportamento do alerta de velocidade:**
- Usuário define um limite em km/h (ex: 30)
- Ao ultrapassar o limite: vibração via `navigator.vibrate()` + destaque visual pulsante na velocidade (framer-motion)
- **Sem som** — vibração + visual são suficientes
- Alerta dispara **uma vez por evento** de ultrapassagem — não repete enquanto mantém acima do limite
- `0` ou vazio = alerta desativado

**Comportamento do Wake Lock:**
- Ao ativar, chama `navigator.wakeLock.request('screen')`
- Reativa automaticamente via `visibilitychange` ao retornar ao app
- Exibe aviso discreto caso o browser não suporte a API

---

### Tela 2 — Velocímetro

Tela principal. Velocidade no centro, métricas secundárias abaixo em carrossel horizontal.

#### Layout

```
┌─────────────────────────────┐
│       [ GPS: OK ●  ]        │  ← badge de status no topo
│                             │
│           32.4              │  ← velocidade atual (fonte grande, centro)
│           km/h              │  ← unidade abaixo, menor
│                             │
│  ╔══════════╦══════════╗    │
│  ║ Máx      ║ Méd      ║    │  ← par de métricas ativo (swipe ←→)
│  ║ 41.2     ║ 28.7     ║    │
│  ╚══════════╩══════════╝    │
│        ● ○ ○ ○ ○           │  ← indicador de página do carrossel
│                             │
│   [ ⏸ Pausar ]  [ ■ Fim ]  │  ← controles
└─────────────────────────────┘
```

#### Métricas disponíveis

Agrupadas em pares e navegadas por swipe horizontal (Embla Carousel independente do carrossel de telas). Cada métrica pode ser **ativada ou desativada** individualmente.

| Métrica | Fonte de dado | Padrão |
|---|---|---|
| Velocidade máxima da sessão | Calculada em runtime | ✅ ativo |
| Velocidade média da sessão | Distância ÷ tempo em movimento | ✅ ativo |
| Tempo de movimento | Timer descontando pausas | ○ inativo |
| Tempo total da sessão | Timer desde o início | ○ inativo |
| Hora atual | `new Date()` | ○ inativo |
| Distância percorrida | Haversine acumulado | ○ inativo |
| Altitude atual | `coords.altitude` | ○ inativo |
| Ganho de elevação | Acumulado quando altitude sobe | ○ inativo |
| Calorias estimadas | MET × peso × tempo | ○ inativo |
| Coordenadas GPS | `coords.latitude / longitude` | ○ inativo |

> Se o número de métricas ativas for ímpar, o último par exibe a métrica sozinha centralizada.

#### Onde gerenciar métricas ativas

**1. Nas Settings (Tela 1):**
Seção "Métricas do velocímetro" com lista de toggles (shadcn Switch) para cada métrica.

**2. Direto na Tela 2 — modo de edição:**
- Botão discreto (ícone ✏️) no canto da área de métricas
- Ao tocar, entra em **edit mode**: cards com checkbox overlay
- Usuário ativa/desativa sem sair da tela
- Confirmação automática ao tocar fora ou fechar
- Animação de entrada/saída via framer-motion

#### Animações (framer-motion)

| Elemento | Animação |
|---|---|
| Número de velocidade | Spring suave a cada novo valor (estilo odômetro) |
| Transição RUNNING → PAUSED | Fade + leve scale down no número |
| Alerta de velocidade | Pulso de cor na velocidade (keyframe loop) |
| Badge GPS | AnimatePresence ao mudar status |
| Swipe entre pares de métricas | Embla com drag livre |
| Entrada no edit mode | Scale + fade nos overlays de checkbox |
| Métrica ativada/desativada | AnimatePresence (entra/sai do carrossel) |

#### Controle de sessão

- **Auto-start:** `coords.speed > 0.5 m/s` pela primeira vez → inicia sessão automaticamente
- **Auto-pause:** `speed ≈ 0` por **10 segundos consecutivos** → pausa automática
- **Manual:** botão "Pausar / Retomar" força pausa ou retomada a qualquer momento
- **Finalizar:** botão "Fim" abre modal de confirmação (shadcn Dialog) → salva sessão → reseta métricas

#### Estados da sessão

```
IDLE → (speed > 0.5 m/s) → RUNNING → (speed ≈ 0 por 10s) → AUTO_PAUSED
                               ↑                                    ↓
                        (botão Retomar                     (botão Retomar
                         ou movimento)                      ou movimento)

RUNNING / AUTO_PAUSED / MANUALLY_PAUSED → (botão Fim confirmado) → IDLE
```

#### GPS e precisão

- `enableHighAccuracy: true`, `distanceFilter: 0`
- Status do GPS via Badge: `Aguardando…` / `Sinal fraco` / `OK`
- Se `coords.speed === null` → calcula velocidade via Haversine entre posições consecutivas ÷ Δt

---

### Tela 3 — Stats

Recordes históricos globais acumulados ao longo de todas as sessões.

| Recorde | Descrição |
|---|---|
| 🏆 Velocidade máxima | Maior `speed` já registrado (km/h) |
| 📏 Maior distância | Sessão com maior distância percorrida |
| ⏱ Maior tempo de movimento | Sessão mais longa |
| 🔥 Maior gasto calórico | Requer peso configurado |
| 📅 Data do último recorde | Timestamp da sessão mais recente |

**Comportamento:**
- Recordes atualizados ao **finalizar uma sessão**
- Exibe `—` para recordes sem dados
- Botão "Resetar recordes" com modal de confirmação (shadcn Dialog)

---

## 8. Armazenamento Local

| Dado | Storage | Chave |
|---|---|---|
| Configurações | `localStorage` | `speedo:settings` |
| Recordes globais | `localStorage` | `speedo:records` |
| Histórico de sessões *(v2)* | `IndexedDB` | `speedo:sessions` |

> IndexedDB preparado na arquitetura da v1 para facilitar migração para nuvem na v2, mas não exposto na UI.

---

## 9. Cálculo de Calorias

```
calorias = MET × peso_kg × duração_horas
```

- MET: `8.0` (ciclismo moderado ~20 km/h)
- Requer peso preenchido nas Settings
- Exibido apenas se peso estiver configurado

---

## 10. Internacionalização (i18n)

- Biblioteca: `next-intl`
- Idiomas: **PT-BR** e **EN**
- Detecção automática via `navigator.language`, fallback `en`
- Usuário pode sobrescrever nas Settings
- Strings, unidades e formatos de data/hora todos traduzidos

---

## 11. PWA

| Requisito | Detalhe |
|---|---|
| `manifest.json` | `name: "Speedo"`, `start_url: "https://speedo.bike"`, ícone, `display: standalone` |
| Service Worker | Cache de assets estáticos (offline) |
| Instalável | Prompt no Chrome Android |
| Ícones | 192×192 e 512×512 |
| `theme_color` | `#000000` (dark) / `#ffffff` (light) |

---

## 12. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS (`darkMode: 'class'`) |
| Tokens de tema | CSS variables semânticas (shadcn/ui padrão) |
| Componentes UI | shadcn/ui (Switch, Dialog, Badge, Button, Separator) |
| Animações | framer-motion (spring no odômetro, AnimatePresence, layout animations) |
| Navegação entre telas | Embla Carousel |
| GPS | Geolocation API (nativa) |
| Wake Lock | Screen Wake Lock API (nativa) |
| i18n | next-intl |
| Armazenamento | localStorage + idb (IndexedDB) |
| PWA | next-pwa |

---

## 13. Limitações Conhecidas

| Limitação | Impacto | Mitigação |
|---|---|---|
| `coords.speed` pode ser `null` | Velocidade não exibida | Fallback via Haversine |
| Wake Lock sem suporte no Safari/Firefox | Tela pode apagar | Aviso ao usuário |
| Browser suspende GPS ao minimizar | Sessão interrompida | Orientar manter app em foco |
| GPS frio (~30s para adquirir sinal) | Velocidade zerada no início | Badge "Aguardando sinal…" |

---

## 14. Roadmap

### v1.0 — este documento
- Velocímetro digital com velocidade atual, máxima e média
- Métricas secundárias configuráveis em carrossel (10 opções)
- Controle automático (10s) + manual de sessão
- Recuperação de sessão interrompida
- Recordes históricos locais
- Settings completo (tema, unidades, wake lock, peso, alerta, idioma)
- Onboarding com solicitação de permissão GPS
- Tela de bloqueio se GPS negado
- Modo foco (fullscreen) ao iniciar sessão
- Tema segue sistema (toggle temporário nas settings)
- Landscape em todas as telas
- Identidade visual minimalista (P&B)
- Sistema de temas com CSS variables semânticas (dark/light)
- Animação de odômetro na velocidade
- Alerta com vibração + destaque visual
- PWA instalável, i18n PT/EN

### v2.0
- Login e sincronização em nuvem
- Histórico completo de sessões com lista
- Mapa do trajeto (Mapbox ou Leaflet)
- Gráfico de velocidade por sessão

### v3.0
- Velocímetro analógico
- Customização de cor de destaque e fonte do velocímetro
- Múltiplos perfis de usuário
