---
name: a-article-diagrams
description: >-
  Átomo de arquitetura visual e diagramação para artigos técnicos. Modula diagramas Mermaid verticais por fase consumindo a paleta oficial Dark Mode da LLM Wiki (identidade-visual-agentic-curator.md) e ancora um exemplo prático contínuo na narrativa visual do post.
license: MIT
compatibility: >-
  Requer suporte a blocos de código Mermaid (flowchart TB/TD e sequenceDiagram) e consulta às diretrizes visuais da LLM Wiki ou Design System do workspace.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: editorial
---

# Article Diagram Modularizer (Átomo de Modularização Visual e Mermaid)

Átomo responsável por transformar fluxogramas complexos ou monolíticos em **diagramas Mermaid verticais e modulares por fase**, alinhados ao tema Dark Mode e integrados ao problema prático do artigo.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Não duplique listas de cores ou de vocabulário localmente. Consulte os tokens visuais e diretrizes editoriais no Design System e na documentação do workspace ativo (`.stitch/DESIGN.md`, `AGENTS.md` ou páginas da LLM Wiki):
> 1. **Paleta e Tokens de Diagramas:** [`knowledge/wiki/concepts/identidade-visual-agentic-curator.md`](../../../knowledge/wiki/concepts/identidade-visual-agentic-curator.md) (Seção 2 — *Paleta Canônica de Cores* e Seção 5 — *Padrão Gráfico para Diagramas*) e `.stitch/DESIGN.md`.
> 2. **Linguagem Natural nos Nós do Diagrama:** [`knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md`](../../../knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md) (Seções 3.1 e 3.2) — os textos dentro dos nós e subgraphs também devem respeitar a Linguagem Onipresente Compartilhada (sem termos sintéticos de IA).

---

## 🛠️ Regras de Estruturação

1. **Fim do Monolito Visual:** Em vez de 1 diagrama gigante no início do artigo, quebrar em diagramas focados que acompanham cada etapa da implementação.
2. **Exemplo Prático Contínuo:** Garantir que o diagrama represente o cenário concreto real do artigo, evoluindo os nós ao longo da narrativa.
3. **Estética "Sketch / Blueprint Dark" (Sem Cara de IA):**
   - Aplicar a diretiva `%%{init: {'theme': 'base', 'themeVariables': {...}}}%%` com fonte manual/orgânica (`Caveat, "Comic Sans MS", "Fira Code", cursive`).
   - Usar formas variadas e orgânicas: `([ pílulas ])` para terminais, `{{ hexágonos }}` para gates e decisões, `[( cilindros )]` para branches protegidas/storage, e post-its escuros `[" post-it "]`.
   - Adicionar textura manual com `stroke-dasharray` em caixas e conexões (`stroke-dasharray: 4 4`, `2 2`, etc.).
   - Utilizar as classes semânticas da Wiki (`sketchNode`, `sketchPostit`, `sketchGate`, `sketchCloud`, `sketchStorage`, `sketchNote`).
4. **Orientação e Responsividade (Layout-First):**
   - Sempre priorizar `flowchart TB` ou `flowchart TD` para contêineres de leitura estreita (`max-w-[65ch]`), evitando compressão de SVG no mobile.
5. **Sintaxe Segura:**
   - Proteger nós com aspas duplas quando houver caracteres especiais: `id["Texto (Info)"]`.
   - Utilizar diagramas suportados: `flowchart TB`, `flowchart TD` ou `sequenceDiagram`.
