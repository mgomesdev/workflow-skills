---
name: a-article-assets
description: >-
  Átomo de geração determinística de capas para artigos técnicos (Design-as-Code). Renderiza capas 1200x630 em HTML/CSS via Playwright com estética Dark Editorial (Linear/Vercel style), tipografia oficial, foto real do autor e Blueprint Arquitetural 2D, salvando em public/articles/<slug>/ para os cards da Home e Open Graph (sem repetir banner decorativo no corpo do Markdown).
license: MIT
compatibility: >-
  Requer Node.js e Playwright (chromium) instalados localmente para renderização headless de HTML/CSS em PNG 1200x630.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: editorial
---

# Article Asset Generator (Átomo de Capas Blueprint 2D em Código)

Átomo responsável por gerar capas de artigos técnicos com **estética de engenharia real (Tipográfica + Blueprint 2D Flat)** a partir de código HTML/CSS renderizado via Playwright, eliminando ilustrações 3D sintéticas de IA.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo consulta os tokens visuais, tipografia, assinatura do autor e diretrizes editoriais a partir do Design System e da documentação do workspace ativo (`.stitch/DESIGN.md`, `AGENTS.md` ou páginas da LLM Wiki).
> 1. **Tokens Visuais e Padrão de Capas Blueprint 2D:** [`knowledge/wiki/concepts/identidade-visual-agentic-curator.md`](../../../knowledge/wiki/concepts/identidade-visual-agentic-curator.md) (Seção 2 — *Paleta Canônica*, Seção 3 — *Arquitetura Tipográfica* e Seção 5 — *Capas de Artigos Blueprint 2D*).
> 2. **Regras Estruturais e Linguagem Onipresente:** [`knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md`](../../../knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md) (Seção 3.3 — *Sem Banner Decorativo Repetido no Corpo do Markdown*).

---

## 🎨 Arquitetura da Capa (Estética Linear / Vercel Dark Editorial)

1. **Zero Imagens 3D Sintéticas de IA:**
   * É proibido gerar capas com *3D glassmorphism*, cubos neon flutuantes ou textos difusos de IA que passam impressão artificial para líderes técnicos.
2. **Composição Assimétrica `1200x630` (Design-as-Code):**
   * **Coluna Esquerda (Tipográfica & Autoral):**
     - Badge da categoria em `JetBrains Mono` com indicador semântico.
     - Título principal do artigo em `Outfit` (`#F8FAFC`) com alto contraste.
     - Pílulas de métricas/impacto real do artigo em `JetBrains Mono`.
     - Assinatura inferior com foto real (`public/brand/photo/profile-photo-tight.jpg`), nome (`<AUTHOR_NAME> · <AUTHOR_ROLE>`) e domínio (`<AUTHOR_DOMAIN>`).
   * **Coluna Direita (Composição Visual Única e Contextual — Proibido Reutilizar o Mesmo Molde):**
     - **Nunca gere capas iguais para artigos diferentes** (é proibido repetir o mesmo layout de "3 caixas empilhadas" em todos os artigos).
     - Leia e entenda o contexto técnico específico do artigo e construa uma composição visual 2D única em `#121318` / `#1E293B` que represente o artefato real do artigo:
       * *Artigos de Arquitetura/Conhecimento:* Árvore de diretórios do Git + grafo SVG de nós conectados.
       * *Artigos de Engenharia Ágil/Produto:* Diagrama de corte (fatia vertical INVEST vs. camadas horizontais SMART) + mini-board Kanban.
       * *Artigos de UI/UX:* Bento Grid 2x2 exibindo wireframes reais dos 4 estados (`Default`, `Loading`, `Error`, `Empty`).
       * *Artigos de Frontend/Testes Visuais:* Comparação Split-Screen de código (`.html` vs `.tsx`) + matriz de comparação de pixels (`0.2%`) + log de terminal.
       * *Artigos de CI/CD & DevOps:* Trilha horizontal dos Quality Gates + simulação do comentário do bot na PR + painel de métricas DORA.
     - Diferencie também a textura de fundo (`dots` vs `grid`) e a barra de acento superior conforme a cor semântica da categoria (`#3B82F6`, `#10B981`, `#F59E0B`).
3. **Sem Repetição no Corpo do Markdown (`posts/*.md`):**
   * O arquivo gerado em `public/articles/<slug>/cover-<slug>.png` é referenciado **unicamente** no campo `cover` do frontmatter YAML (para alimentar os cards da Home e o preview Open Graph no LinkedIn).
   * **Nunca** adicione `![Banner...](...)` no início do corpo do Markdown, garantindo que na página do artigo (`/posts/[slug]`) o leitor vá direto do `ArticleTldr` para a Introdução e para o primeiro diagrama técnico.

---

## ⚙️ Execução Determinística

Para gerar a capa de um artigo via Playwright:

```bash
node .agents/skills/a-article-assets/scripts/generate-cover.mjs
```
