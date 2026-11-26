# Changelog

Todas as mudanças notáveis do repositório **`mgomesdev/workflow-skills`** são documentadas neste arquivo, seguindo [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-11-26

### ✨ Adicionado (`feat`)
- **35 Agent Skills Autorais (`25 átomos a-*` e `10 moléculas m-*`):** Publicadas em `skills/<name>/` 100% agnósticas de projeto e em conformidade estrita com a especificação [`agentskills.io`](https://agentskills.io/specification) (`skills-ref`), cobrindo todo o ciclo AI-DLC (Memória & Wiki, Planejamento INVEST/SMART, Governança Azure DevOps & Git, Telemetria & FinOps, e Curadoria Editorial).
- **Suítes de Avaliação (`evals/evals.json`):** 35/35 skills equipadas com cenários de avaliação (`expectations`) e testes de gatilho (`trigger_tests`: `should_trigger` / `should_not_trigger`).
- **Empacotamento Aberto (`agent-plugins.org` & `npx skills`):** Manifesto `plugin.json` (`1.0.0`), licença `MIT` e estrutura pronta para instalação via `npx skills add mgomesdev/workflow-skills`.

### 📚 Documentação (`docs`)
- **Diagrama Arquitetural no README:** Adicionado diagrama visual do ciclo orbital de 10 etapas (`assets/workflow-skills-architecture.png`) e catálogo completo das 35 skills no `README.md`.
- **LLM Wiki Dedicada (`knowledge/`):** Criada base de conhecimento própria (`SCHEMA.md`, `index.md`, `log.md`, `raw/` e `wiki/engineering/`) e instruções em `AGENTS.md`.

### ⚙️ Governança & Qualidade (`chore`)
- **Validador Dual & Quality Gate:** Adicionados `scripts/lint-wiki.mjs`, `scripts/validate-skills.mjs` (modos determinístico e probabilístico) e suíte de testes Vitest (`pnpm run quality-gate`).
