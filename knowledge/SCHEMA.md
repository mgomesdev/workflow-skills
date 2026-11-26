---
id: schema
title: "LLM Wiki Schema — Diretrizes de Governança do workflow-skills"
category: "governance"
type: "Agent Manual"
status: "Approved"
last_updated: "2026-11-26"
summary: "Contrato de regras, convenções de frontmatter e protocolos de Ingest, Query e Lint para agentes de IA mantenedores da Wiki do repositório workflow-skills (Padrão Andrej Karpathy)."
tags: [schema, governance, llm-wiki, karpathy, agent-protocol, workflow-skills]
---

# LLM Wiki Schema — Manual de Operações da IA (`workflow-skills`)

> Este documento define a especificação arquitetural da **LLM Wiki** do repositório **`mgomesdev/workflow-skills`**, seguindo o padrão proposto por **Andrej Karpathy**.  
> Todo agente de IA atuando neste repositório deve seguir estritamente as regras aqui definidas antes de criar, evoluir ou publicar qualquer skill.

---

## 🏛️ 1. Princípios Fundamentais

1. **A Wiki é a Fonte Única da Verdade (SSoT):** Regras de autoria, padrões `agentskills.io`, contratos de `evals/evals.json` e diretrizes de segurança pública são compilados uma vez em `knowledge/` e mantidos atualizados.
2. **Separação de Papéis:**
   - **O Humano (Curador):** Define a direção estratégica, aprova novas skills/evoluções e valida o comportamento em produção.
   - **O Agente de IA (Mantenedor):** Executa leitura cirúrgica via `index.md`, implementa/atualiza skills e `evals/evals.json`, roda os sensores determinísticos e probabilísticos (`pnpm run quality-gate`) e registra decisões em `log.md`.
3. **Imutabilidade do `raw/`:** Fontes brutas sob `knowledge/raw/` são imutáveis. O agente apenas lê de `raw/`, nunca altera insumos históricos originais.

---

## 📂 2. Topologia de Diretórios

```text
knowledge/
├── SCHEMA.md         ➜ Este manual de governança (regras do agente).
├── index.md          ➜ Catálogo semântico (link + resumo executivo de 1 linha).
├── log.md            ➜ Histórico cronológico append-only das operações.
│
├── raw/              ➜ [CAMADA 1: RAW SOURCES - IMUTÁVEIS]
│   └── YYYY-MM-DD-*  ➜ Decisões fundacionais, referências e insumos brutos.
│
└── wiki/             ➜ [CAMADA 2: LIVING WIKI - GERIDA PELA IA]
    └── engineering/  ➜ Arquitetura de skills, governança de evals e publicação.
```

---

## 🏷️ 3. Padrão de Metadados (Frontmatter YAML)

Todas as páginas sob `knowledge/wiki/` DEVEM conter o seguinte cabeçalho:

```yaml
---
id: slug-identificador-unico
title: "Título Descritivo da Página"
category: "engineering | concept | governance | catalog"
status: "Draft | Reviewed | Approved"
last_updated: "YYYY-MM-DD"
summary: "Resumo executivo de 1 a 2 linhas."
tags: [tag1, tag2]
---
```

---

## 🔄 4. Protocolos Operacionais (Ingest, Query & Lint)

1. **Query (Consulta de Baixo Token):** Leia `knowledge/index.md` primeiro para rotear sua busca e abra apenas as páginas relevantes.
2. **Ingest / Auto-Learn:** Toda nova decisão arquitetural ou correção de padrão de skill deve ser sintetizada na página correspondente em `knowledge/wiki/`, catalogada em `knowledge/index.md` e registrada no topo de `knowledge/log.md`.
3. **Lint Determinístico:** Execute `pnpm run lint:wiki` e `pnpm run validate:skills` antes de qualquer commit ou push.
