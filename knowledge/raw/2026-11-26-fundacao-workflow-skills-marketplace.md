---
id: raw-fundacao-workflow-skills-marketplace
title: "Fundação do Marketplace Público workflow-skills (Extração & Desacoplamento)"
category: "raw"
type: "Immutable Source"
status: "Immutable"
last_updated: "2026-11-26"
summary: "Registro imutável da decisão arquitetural de desacoplar as 35 skills autorais em um repositório público próprio compatível com agentskills.io, agent-plugins.org e npx skills."
tags: [raw, foundation, agentskills, agent-plugins, vercel-skills, marketplace]
---

# Fundação do Repositório `mgomesdev/workflow-skills`

* **Data:** 2026-11-26
* **Origem:** Card #115 / Tasks #175 e #176 do ecossistema *The Agentic Curator*.
* **Referências Canônicas Adotadas:**
  1. [Agent Skills Specification (`agentskills.io`)](https://agentskills.io/specification) e [`agentskills/skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref)
  2. [Evaluating Skill Performance (`agentskills.io/skill-creation/evaluating-skills`)](https://agentskills.io/skill-creation/evaluating-skills#designing-test-cases)
  3. [Anthropic `skill-creator` (`anthropics/skills`)](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
  4. [Agent Plugins Specification (`agent-plugins.org`)](https://agent-plugins.org/)
  5. [Vercel Labs Skills CLI (`vercel-labs/skills`)](https://github.com/vercel-labs/skills)

## Decisões Arquiteturais Fundacionais

1. **Separação Produtor vs. Consumidor:** O repositório `mgomesdev/workflow-skills` passa a ser o **único produtor e fonte da verdade (SSoT)** das 35 skills autorais (`25 átomos a-*` e `10 moléculas m-*`). Projetos consumidores (como `personal-branding`) apenas instalam e atualizam o pacote via `npx skills add mgomesdev/workflow-skills` (rastreado em `skills-lock.json`).
2. **Agnosticismo Estrito:** Nenhuma skill publicada pode conter identificadores privados, GUIDs, tokens, e-mails pessoais ou nomes de projetos acoplados. Todo parâmetro específico de projeto deve ser resolvido dinamicamente a partir do `AGENTS.md` ou da Wiki do workspace consumidor.
3. **Qualidade Verificável (Eval-Driven):** 100% das skills devem passar na validação determinística (`skills-ref` + Zod) e manter suíte `evals/evals.json` com `expectations` verificáveis e `trigger_tests` (`should_trigger` e `should_not_trigger`).
4. **Manutenção Agêntica Dedicada:** O repositório possui sua própria `knowledge/` (LLM Wiki) e `AGENTS.md` para que agentes de IA possam criar, refatorar, auditar e evoluir skills de forma autônoma e isolada.
