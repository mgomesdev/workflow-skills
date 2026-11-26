---
id: engineering-governanca-evals-e-publicacao
title: "Governança de Evals, Validador Dual e Publicação (agent-plugins.org & npx skills)"
category: "engineering"
type: "Engineering Governance Standard"
status: "Approved"
sources: ["raw/2026-11-26-fundacao-workflow-skills-marketplace"]
last_updated: "2026-11-26"
summary: "Contrato de evals/evals.json (expectations + trigger_tests), funcionamento do validador dual (deterministic + probabilistic), manifesto plugin.json e fluxo de atualização para projetos consumidores."
tags: [engineering, evals, trigger-tests, validation, agent-plugins, npx-skills, quality-gate]
---

# Governança de Evals, Validador Dual e Publicação

* **Fonte Primária:** [`raw/2026-11-26-fundacao-workflow-skills-marketplace`](../../raw/2026-11-26-fundacao-workflow-skills-marketplace.md)
* **Conexão Direta:** [`wiki/engineering/arquitetura-skills-atomicas`](./arquitetura-skills-atomicas.md)

---

## 🧪 1. Contrato de Avaliação (`skills/<name>/evals/evals.json`)

Toda skill mantida neste repositório DEVE conter `evals/evals.json` aderente ao guia [`agentskills.io/skill-creation/evaluating-skills`](https://agentskills.io/skill-creation/evaluating-skills#designing-test-cases) e ao padrão [`anthropics/skills/skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator):

* `skill_name`: idêntico ao nome do diretório e ao campo `name` do `SKILL.md`.
* `evals`: mínimo de **2 cenários** realistas (`id`, `prompt`, `expected_output` e `expectations` com asserções verificáveis).
* `trigger_tests`:
  * `should_trigger`: mínimo de 2 prompts (explícitos e implícitos) que devem ativar a skill.
  * `should_not_trigger`: mínimo de 2 prompts **semanticamente próximos**, mas pertencentes à fronteira de outra skill (para prevenir falsos positivos).

---

## ⚙️ 2. Validador Dual (`scripts/validate-skills.mjs`)

O repositório mantém dois portões automatizados:
1. **Determinístico (`pnpm run validate:skills:deterministic`):** Valida frontmatter `agentskills.io` (`skills-ref`), integridade de dependências `metadata.uses` entre moléculas e átomos, e schema Zod de `evals/evals.json`.
2. **Probabilístico (`pnpm run validate:skills:probabilistic`):** Avalia `expectations` e `trigger_tests` (via heurística local determinística em dry-run ou via LLM-as-a-Judge quando `GEMINI_API_KEY` estiver configurada).

---

## 📦 3. Empacotamento e Consumo em Projetos Externos

* **Manifesto Raiz (`plugin.json`):** Declara `"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"` e `"name": "workflow-skills"`.
* **Descoberta CLI (`vercel-labs/skills`):** O layout `skills/<name>/SKILL.md` permite descoberta imediata via:
  ```bash
  npx skills add mgomesdev/workflow-skills --list
  ```
* **Atualização em Projetos Consumidores:** Após mergear melhorias na `main` deste repositório, qualquer projeto consumidor (ex.: `personal-branding`) sincroniza as skills atualizadas executando:
  ```bash
  npx skills add mgomesdev/workflow-skills --all -y
  ```
  > **Higienização no Consumidor:** O CLI `vercel-labs/skills` pode criar diretórios auxiliares de symlink para outros agentes (ex.: `.claude/`, `agent/`). Remova pastas auxiliares indesejadas antes de commitar no projeto consumidor para manter versionados apenas `.agents/skills/` e `skills-lock.json`.

---

## 🎨 4. Documentação Visual & Revisão Incremental

1. **Inspeção Visual Obrigatória de Assets Design-as-Code (`assets/*.png`):** Ao gerar ou atualizar diagramas/banners arquiteturais para o `README.md` via Playwright (HTML/CSS + SVG), o agente DEVE inspecionar o PNG resultante (`read_file`) antes do commit/push para validar ausência de cortes de viewport, sobreposição ou quebra de cabeçalhos.
2. **Respeito Estrito ao Modo Incremental:** Quando o curador solicitar execução ou revisão incremental (*"uma por uma para eu validar antes de commitar"*), nunca pré-editar múltiplas skills em lote; tocar estritamente 1 skill por ciclo de aprovação.
