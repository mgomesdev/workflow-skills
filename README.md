# workflow-skills

Coleção de **35 Agent Skills componíveis** (**25 Átomos `a-*`** e **10 Moléculas `m-*`**) que automatizam meu fluxo pessoal de engenharia de software com agentes de IA - da memória persistente em Markdown e planejamento ágil (INVEST/SMART) até execução paralela em Git Worktrees, governança de Pull Requests no Azure DevOps, FinOps de tokens, triagem de telemetria em produção e curadoria editorial.

Todas as skills seguem a especificação aberta do [**Agent Skills (`agentskills.io`)**](https://agentskills.io) e o empacotamento [**Agent Plugins (`agent-plugins.org`)**](https://agent-plugins.org), são **100% agnósticas de projeto** e contam com validação estrutural (`skills-ref`) e suítes de avaliação (`evals/evals.json`).

🔗 **Mapa visual das 10 etapas do fluxo:** [matheusgomesdev.com.br/workflow](https://matheusgomesdev.com.br/workflow)

---

## 🚀 Instalação Rápida (`npx skills`)

Compatível com **Claude Code, Antigravity, Cursor, GitHub Copilot, Codex, Windsurf** e qualquer agente compatível com a CLI [`skills`](https://github.com/vercel-labs/skills):

```bash
# Listar todas as skills disponíveis no repositório
npx skills add mgomesdev/workflow-skills --list

# Instalar todas as skills no projeto atual
npx skills add mgomesdev/workflow-skills

# Instalar apenas uma skill específica (ex.: refinamento ágil INVEST/SMART)
npx skills add mgomesdev/workflow-skills --skill m-invest-smart

# Instalar múltiplas skills selecionadas
npx skills add mgomesdev/workflow-skills --skill a-wiki-auditor --skill a-brief-curator
```

---

## 🏛️ Arquitetura: Átomos e Moléculas

Em vez de prompts monolíticos que quebram quando uma etapa intermediária muda, divido as automações em duas camadas inspiradas em Atomic Design:

```text
1. ÁTOMOS (a-*)     ➔ Operação unitária de responsabilidade única (ex.: commitar, abrir PR, auditar Wiki).
                      Não encadeia outras skills e declara fronteira estrita do que NÃO faz.

2. MOLÉCULAS (m-*)  ➔ Orquestração composta que encadeia 2 ou mais átomos em sequência determinística
                      para resolver uma etapa completa do ciclo de desenvolvimento.
```

---

## 🗂️ Catálogo Completo (35 Skills)

### 1. Memória Persistente & Planejamento Ágil (`agile-knowledge`)

| Skill | Camada | Etapa do Workflow | O que faz |
| :--- | :---: | :--- | :--- |
| **`a-wiki-auditor`** | ⚛️ Átomo | `01 · Memória` | Consulta de baixo token via `index.md`, auditoria semântica (contradições e lacunas) e validação estrutural de LLM Wiki no padrão Andrej Karpathy (`SCHEMA.md`, frontmatter e links). |
| **`a-brief-curator`** | ⚛️ Átomo | `01/02 · Estudo` | Pré-voo de pair programming: mapeia referências externas (docs oficiais) e internas (`arquivo:linha`) explicando *o que é, para que serve, onde aplicar e como validar* antes de gerar código. |
| **`m-invest-smart`** | 🧬 Molécula | `02 · Especificação` | Conduz a criação, refinamento e quebra técnica de features seguindo os **3 Cs** (Ron Jeffries), **INVEST** (Bill Wake) para histórias, **SMART** para tasks técnicas e métricas **HEART**. |

---

### 2. Governança Azure DevOps, Git & Execução Autônoma (`ado-governance`)

| Skill | Camada | Etapa do Workflow | O que faz |
| :--- | :---: | :--- | :--- |
| **`a-ado-board-gate`** | ⚛️ Átomo | `06 · Execução` | Trava de pré-voo no Azure Boards via MCP: verifica se a história pai possui tasks SMART planejadas e move o card para `Developing` (`Doing`) antes de permitir escrita de código. |
| **`a-ado-context-audit`** | ⚛️ Átomo | `02/06 · Contexto` | Confronta o escopo planejado da task com o log recente da Wiki e a árvore real do código para detectar itens já implementados e evitar retrabalho (*context drift*). |
| **`a-ado-item-create`** | ⚛️ Átomo | `02/09 · Backlog` | Cria Work Items tipados pela taxonomia Conventional Commits (`feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore`, `Task`) no topo do Backlog com checagem anti-duplicidade via WIQL. |
| **`a-ado-task-assign`** | ⚛️ Átomo | `06 · Execução` | Atribui a task ao desenvolvedor configurado e atualiza seu estado operacional para `Doing` no Azure Boards. |
| **`a-ado-branch-setup`** | ⚛️ Átomo | `05 · Isolamento` | Valida working tree limpa, cria a sub-branch remota (`feat/us-<US>-task-<TASK>`), vincula o `ArtifactLink` no Work Item via MCP e faz checkout local com tracking. |
| **`a-ado-git-commit`** | ⚛️ Átomo | `06 · Execução` | Realiza stage seletivo e cria commit semântico (*Conventional Commits* com sufixo `(#<TASK_ID>)`), bloqueando commits diretos na branch principal. |
| **`a-ado-git-push`** | ⚛️ Átomo | `06 · Execução` | Envia a branch ativa para o repositório remoto com upstream tracking (`-u`) e proteção contra push direto na `main`. |
| **`a-ado-pr-open`** | ⚛️ Átomo | `06/08 · PR & Review` | Abre ou atualiza Pull Requests em 2 níveis (`task ➔ feature branch` ou `feature branch ➔ main`) com template do repositório, atribuição de revisor e transição de coluna no board. |
| **`a-ado-pr-threads`** | ⚛️ Átomo | `06 · Code Review` | Lê, filtra eventos de sistema, responde e resolve threads de comentários em PRs com suporte a *Conventional Comments* (`issue:`, `todo:`, `suggestion:`, `nitpick:`, `praise:`). |
| **`a-ado-us-summary`** | ⚛️ Átomo | `06/07 · Resumo` | Publica comentário executivo conciso no card principal INVEST resumindo o que foi entregue na subtask, o link da PR e a telemetria de tokens. |
| **`a-ado-task-sync`** | ⚛️ Átomo | `06 · Sincronia` | Atualiza a descrição SMART e o estado do Work Item no Azure Boards para refletir decisões técnicas tomadas durante a implementação. |
| **`a-ado-release-bump`** | ⚛️ Átomo | `08 · Release` | Calcula o bump SemVer (`MAJOR`, `MINOR`, `PATCH`) a partir dos commits desde a última tag, atualiza `package.json` e gera a seção de release no `CHANGELOG.md`. |
| **`a-ado-branch-purge`** | ⚛️ Átomo | `05/08 · Limpeza` | Expurgo manual seguro de branches locais e remotas: audita via MCP se as PRs correspondentes já estão mergeadas e pede confirmação antes de deletar. |
| **`m-ado-task-start`** | 🧬 Molécula | `05/06 · Setup` | Encadeia `a-ado-board-gate`, `a-ado-context-audit`, `a-ado-task-assign` e `a-ado-branch-setup` para iniciar uma tarefa do backlog de ponta a ponta. |
| **`m-ado-commit-push`** | 🧬 Molécula | `06 · Execução` | Encadeia `a-ado-git-commit` e `a-ado-git-push` para versionar e publicar alterações em um único comando. |
| **`m-ado-autonomous-dev`** | 🧬 Molécula | `06 · Inner Loop` | Ciclo autônomo escalonado por risco em Git Worktrees (`.worktrees/`): implementação com testes, atualização da Wiki, push único, resolução de threads de preview e auto-merge para risco baixo. |
| **`m-ado-dispatcher`** | 🧬 Molécula | `05/06 · Orquestração` | Despacha subtasks SMART concorrentes em Git Worktrees isoladas com alocação dinâmica de portas locais e preservação da worktree em standby durante o Code Review. |
| **`m-ado-release`** | 🧬 Molécula | `08 · CI/CD & Release` | Valida conclusão de 100% das subtasks filhas, executa `a-ado-release-bump`, abre a PR final para a `main` via `a-ado-pr-open` e sincroniza o fechamento da história. |

---

### 3. Telemetria de Produção, FinOps de Tokens & Outer Loop (`telemetry-outer-loop`)

| Skill | Camada | Etapa do Workflow | O que faz |
| :--- | :---: | :--- | :--- |
| **`a-telemetry-agentsview`** | ⚛️ Átomo | `07 · Custos ($)` | Extrai consumo de tokens (`input`, `cache_read`, `output`, pico de contexto), rollup de subagentes e custo em USD via AgentsView (MCP/CLI) para anexar em PRs e cards. |
| **`a-telemetry-sentry`** | ⚛️ Átomo | `09 · Telemetria` | Extrai snapshot de issues ativas, taxas de exceções e stack traces recentes de produção via Sentry MCP. |
| **`a-telemetry-vercel`** | ⚛️ Átomo | `09 · Telemetria` | Inspeciona status dos deploys recentes de produção, falhas de build e logs 5xx de runtime/edge via Vercel MCP. |
| **`a-telemetry-ga4`** | ⚛️ Átomo | `09 · Telemetria` | Consulta sinais de comportamento e métricas HEART (visualizações, scroll depth, conversões em CTAs e engajamento) via Google Analytics 4 Data API. |
| **`a-telemetry-risk`** | ⚛️ Átomo | `09 · Triagem` | Cruza anomalias técnicas com volume de tráfego real, classifica na Matriz de Risco (`Baixo`, `Médio`, `Alto`) e redige a proposta de card INVEST ou SMART. |
| **`m-telemetry-digest`** | 🧬 Molécula | `09 · Telemetria` | Encadeia `a-telemetry-sentry`, `a-telemetry-vercel` e `a-telemetry-ga4` para compilar um diagnóstico unificado da saúde de produção. |
| **`m-telemetry-triage`** | 🧬 Molécula | `09 · Outer Loop` | Encadeia `m-telemetry-digest`, `a-telemetry-risk` e `a-ado-item-create` para converter anomalias de produção em cards priorizados no topo do Backlog. |

---

### 4. Esteira Editorial & Standup (`editorial-curator`)

| Skill | Camada | Etapa do Workflow | O que faz |
| :--- | :---: | :--- | :--- |
| **`a-article-reviewer`** | ⚛️ Átomo | `10 · Publicação` | Auditoria crítica de artigos técnicos: aponta decisões de engenharia omitidas, avalia poluição visual e checa consistência entre texto, código e diagramas. |
| **`a-article-proofread`** | ⚛️ Átomo | `10 · Publicação` | Revisão gramatical, ortográfica e de formatação Markdown preservando integralmente o estilo e a estrutura original do autor. |
| **`a-article-voice`** | ⚛️ Átomo | `10 · Publicação` | Lapidação de tom de voz autoral em primeira pessoa (*"eu"*), eliminando jargões artificiais e estruturando resumo executivo para publicação. |
| **`a-article-diagrams`** | ⚛️ Átomo | `10 · Publicação` | Modula diagramas Mermaid verticais por fase com paleta Dark Editorial e exemplo prático contínuo ao longo do artigo. |
| **`a-article-assets`** | ⚛️ Átomo | `10 · Publicação` | Renderiza capas `1200x630` (Open Graph) em HTML/CSS via Playwright a partir de blueprint arquitetural 2D em código. |
| **`m-article-curator`** | 🧬 Molécula | `10 · Publicação` | Orquestra sequencialmente `a-article-reviewer`, `a-article-proofread`, `a-article-voice`, `a-article-diagrams` e `a-article-assets`. |
| **`m-standup-curator`** | 🧬 Molécula | `10 · Standup` | Lê commits recentes, Pull Requests, Wiki e Backlog para gerar narrativas executivas de Daily Standup e Weekly Showcase. |

---

## ⚙️ Configuração Agnóstica de Projeto

Nenhuma skill deste repositório possui identificadores ou rotas hardcoded. Quando acionadas, elas resolvem o contexto do projeto seguindo esta ordem de precedência:

1. **Instruções do Workspace (`AGENTS.md` / `CLAUDE.md` / `knowledge/`):** Tabelas ou blocos de configuração do projeto ativo (nome do projeto no Azure DevOps/Jira/GitHub, ID do repositório, branch principal, diretório da Wiki).
2. **Variáveis de Ambiente (`.env` / `.env.local`):** Variáveis padrão para integrações de telemetria e MCP (`ADO_PROJECT`, `ADO_REPO_ID`, `GA4_PROPERTY_ID`, `SENTRY_ORG`, `SENTRY_PROJECT`).
3. **Descoberta Assistida (Fallback):** Se um parâmetro obrigatório não estiver declarado no workspace, a skill consulta os recursos via MCP ou solicita confirmação pontual ao desenvolvedor.

---

## 🧪 Qualidade, Validação (`skills-ref`) e Evals

Todas as skills seguem o ciclo de engenharia orientada a avaliações ([`agentskills.io/skill-creation/evaluating-skills`](https://agentskills.io/skill-creation/evaluating-skills)):

1. **Conformidade de Especificação (`skills-ref`):**
   * Frontmatter YAML estrito (`name`, `description`, `license`, `compatibility`, `metadata` com `layer`, `sdlc_phase` e `uses`).
   * Validação automatizada de estrutura e limites de caracteres:
     ```bash
     pnpm run validate:skills
     ```
2. **Suíte de Evals por Skill (`evals/evals.json`):**
   * Cada skill contém casos de teste realistas (`prompt`, `expected_output`, `assertions`) e testes de ativação (`trigger_tests`: `should_trigger` vs. `should_not_trigger`) para calibrar a precisão da `description` e comparar execuções `with_skill` vs. `without_skill`.

---

## 📂 Estrutura do Repositório

```text
workflow-skills/
├── plugins/                        # Bundles no padrão agent-plugins.org
│   ├── agile-knowledge/
│   │   ├── plugin.json
│   │   └── skills/
│   ├── ado-governance/
│   │   ├── plugin.json
│   │   └── skills/
│   ├── telemetry-outer-loop/
│   │   ├── plugin.json
│   │   └── skills/
│   └── editorial-curator/
│       ├── plugin.json
│       └── skills/
├── scripts/
│   ├── validate-skills.mjs         # Validador compatível com skills-ref
│   └── run-evals.mjs               # Runner de evals/evals.json
├── package.json
└── README.md
```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais detalhes.

Desenvolvido por [**Matheus Gomes**](https://matheusgomesdev.com.br) · [LinkedIn](https://www.linkedin.com/in/matheus-gomes-dev/) · [GitHub](https://github.com/mgomesdev)
