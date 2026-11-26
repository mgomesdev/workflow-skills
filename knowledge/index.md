---
id: index
title: "Wiki Index — Catálogo Semântico do workflow-skills"
category: "catalog"
type: "Content Index"
status: "Approved"
last_updated: "2026-11-26"
summary: "Catálogo funcional da LLM Wiki do repositório workflow-skills: lista estruturada de todas as páginas de governança, fontes brutas e engenharia de skills."
tags: [index, catalog, navigation, llm-wiki, workflow-skills]
---

# Wiki Index (Catálogo Semântico — `workflow-skills`)

> **Função para Agentes de IA:** Leia este índice primeiro para rotear qualquer tarefa de criação, refatoração, avaliação ou publicação de skills neste repositório.

---

## 📜 Governança
* **[`SCHEMA`](./SCHEMA.md)** — Manual de operações do agente: regras de frontmatter, imutabilidade do `raw/` e protocolos de Ingest, Query e Lint.
* **[`log`](./log.md)** — Histórico cronológico append-only de evoluções e auditorias do repositório.

---

## 🗄️ Raw Sources (Camada 1 — Fontes Brutas Imutáveis)
* **[`raw/2026-11-26-fundacao-workflow-skills-marketplace`](./raw/2026-11-26-fundacao-workflow-skills-marketplace.md)** — Registro fundacional da extração das 35 skills autorais (`25 a-*` e `10 m-*`) para repositório independente no padrão `agentskills.io`, `agent-plugins.org` e `vercel-labs/skills`.

---

## 🛠️ Engineering (Camada 2 — Arquitetura, Evals & Publicação)
* **[`wiki/engineering/arquitetura-skills-atomicas`](./wiki/engineering/arquitetura-skills-atomicas.md)** — Taxonomia em camadas (Átomos `a-*` e Moléculas `m-*`), contrato de frontmatter `agentskills.io` (`skills-ref`), parametrização agnóstica e checklist obrigatório de segurança pública.
* **[`wiki/engineering/governanca-evals-e-publicacao`](./wiki/engineering/governanca-evals-e-publicacao.md)** — Contrato de `evals/evals.json` (`expectations` + `trigger_tests`), validador dual (`deterministic` + `probabilistic`), manifesto `plugin.json` (`agent-plugins.org`) e distribuição via `npx skills add mgomesdev/workflow-skills`.
