---
name: m-standup-curator
description: >-
  Curador agêntico orientado por LLM para narrativas de Daily Standup e Apresentações Semanais (Weekly Showcase).
  Consome o rastro recente do repositório (commits, PRs, Living Wiki e Azure Boards), aplica a Linguagem Onipresente
  Compartilhada da Wiki (diretrizes-editoriais-tom-de-voz.md e identidade-visual-agentic-curator.md), ancora a narrativa
  em uma das 29 regras do Impatient Programming e gera artefatos Source-Ready para leitura executiva ou NotebookLM.
license: MIT
compatibility: >-
  Requer Git CLI local, acesso de leitura à base de conhecimento (knowledge/ via a-wiki-auditor) e opcionalmente ao MCP azure-devops.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: molecule
  sdlc_phase: review
  uses: "a-wiki-auditor"
---

# Agentic Standup Curator (Narrativas Diárias & Showcase Semanal)

Skill autônoma orientada por LLM que transforma o histórico de desenvolvimento em **narrativas humanas diretas**. Elimina leituras frias de hashes de commit, tags ou nomes de PRs, convertendo o rastro de software em comunicação objetiva de engenharia.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Não mantenha listas locais de termos banidos, traduções ou tokens de cores neste arquivo. Antes de gerar qualquer daily ou showcase, consulte o átomo `a-wiki-auditor` e as diretrizes do workspace ativo (`AGENTS.md` e LLM Wiki):
> 1. **Tom de Voz, Linguagem Onipresente & Briefing NotebookLM:** [`knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md`](../../../knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md) (Seção 1 a 4 — 1ª pessoa *"Eu"*, Blacklist de Muletas, Dicionário de Substituição para Linguagem Natural, Regra do Efeito Prático e contrato `notebooklm_slide_brief`).
> 2. **Tokens Visuais Dark Editorial:** [`knowledge/wiki/concepts/identidade-visual-agentic-curator.md`](../../../knowledge/wiki/concepts/identidade-visual-agentic-curator.md) e `.stitch/DESIGN.md`.

---

## 🔄 Modos de Operação

### 1. ☀️ Modo Daily: Narrativa do Dia (Standup Diário)
* **Gatilho:** Início da manhã ou final da tarde para alinhamento rápido.
* **Protocolo do Agente:**
  1. Executar `git log --since="yesterday" --oneline` (ou período desejado) e verificar branches/PRs ativas no Azure Boards.
  2. Ler as últimas entradas de `knowledge/log.md` para resgatar decisões ou aprendizados práticos.
  3. Aplicar a **Linguagem Onipresente** e a **Regra do Efeito Prático** de [`diretrizes-editoriais-tom-de-voz.md`](../../../knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md) para compor a narrativa em 4 atos:
     * **Capítulo 1 - O que fechei ontem:** Texto direto destacando o que mudou na tela, na esteira ou no código.
     * **Capítulo 2 - Aprendizados práticos:** Desafios contornados ou clareza adquirida na arquitetura.
     * **Capítulo 3 - O que estou fazendo hoje:** Foco prático do dia em linguagem natural.
     * **Capítulo 4 - Impedimentos:** Se algo precisa de ajuda humana ou está bloqueado.

---

### 2. 🚀 Modo Weekly: Showcase Semanal (Apresentação & NotebookLM)
* **Gatilho:** Fechamento da semana para demonstrar as entregas.
* **Protocolo do Agente:**
  1. Coletar os marcos entregues nos últimos 7 dias via Git e `knowledge/log.md`.
  2. Consultar o catálogo das 29 regras do Impatient Programming em [`.agents/skills/m-standup-curator/references/imp-rules.md`](./references/imp-rules.md) e selecionar o **Fio Condutor da Semana**.
  3. Ler os tokens de cores e tipografia em [`knowledge/wiki/concepts/identidade-visual-agentic-curator.md`](../../../knowledge/wiki/concepts/identidade-visual-agentic-curator.md) e a estrutura `notebooklm_slide_brief` na Seção 4 de [`knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md`](../../../knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md).
  4. Gerar o documento Markdown estruturado como fonte primária (**Source-Ready**) para ingestão direta no **NotebookLM**.

---

## 📋 Template de Apresentação Semanal (Source-Ready)

```markdown
---
id: weekly-showcase-YYYY-WW
title: "Weekly Engineering Showcase — Semana WW/YYYY"
author: "<AUTHOR_NAME>"
status: "Ready for Presentation & NotebookLM"
target_tool: "NotebookLM / Slide Deck"
impatient_programming_rule:
  number: <NUMERO>
  name: "<NOME_DA_REGRA>"
  quote: "<FRASE_DE_IMPACTO>"
notebooklm_slide_brief:
  deck_purpose: "Alinhamento executivo conciso (5 a 6 slides)."
  presentation_style: "Direto ao ponto, fatos e impacto real, sem enrolação."
  slide_structure:
    slide_1: "Capa: Título, Semana e Regra Impatient Programming que guiou as entregas."
    slide_2: "O Fio Condutor: A regra do IMP aplicada na prática e por que ela economizou tempo."
    slide_3: "Entrega de Produto: A tela/funcionalidade nova e o que o usuário faz agora que não fazia antes."
    slide_4: "Engenharia e Esteira: Automações de CI/CD e sensores que eliminaram trabalho manual."
    slide_5: "Lição Prática: O aprendizado real da semana e a decisão de arquitetura tomada."
    slide_6: "Próximos Passos: O que será destravado na próxima semana."
---

# 🚀 Weekly Engineering Showcase: Semana WW/YYYY

## ⚡ O Fio Condutor da Semana: Regra #<NUMERO> (<NOME_DA_REGRA>)
* **A Ideia Central:** *"<FRASE_DE_IMPACTO>"*
* **Na Prática:** <Reflexão em 1ª pessoa ("Eu") de como apliquei essa regra na semana.>

## 🎬 Entregas da Semana (O Que Mudou na Prática)
* <O que mudou na tela/componente, o que parou de quebrar e quantos minutos manuais foram poupados.>

## 🧠 Aprendizados Práticos e Trade-offs
* <Principais decisões de arquitetura e trade-offs registrados na Living Wiki.>

## 🔭 Próximos Passos
* <Foco técnico da próxima semana.>
```
