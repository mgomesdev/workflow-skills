---
name: a-ado-pr-open
description: >-
  Átomo de criação e atualização de Pull Requests no Azure DevOps via MCP (repo_pull_request_write) com governança de coluna no Azure Boards (wit_work_item_write), atribuição automática de revisor (update_reviewers) e disparo automático do resumo executivo no card pai INVEST (a-ado-us-summary / wit_work_item_comment_write). Na PR Nível 1 (Subtask SMART: feat/us-<ID>-task-<TASK_ID> ➔ feat/us-<ID>), usa o template feat.md e mantém o card pai na coluna 'Developing'. Na PR Nível 2 (Card Principal INVEST: feat/us-<ID> ➔ main, aberta somente após todas as subtasks serem aprovadas), usa o template main.md e move o card pai para 'Code Review' / 'Pending'.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (repo_pull_request_write, repo_pull_request, wit_work_item_write, wit_work_item_comment_write) ou REST API v7.0 autenticada via PAT e templates em .azuredevops/pull_request_template/branches/.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: review
  uses: "a-ado-us-summary, a-telemetry-agentsview"
---

# Atom: `a-ado-pr-open` (2-Tier Pull Request Creator, Reviewer Assigner & US Summary Trigger)

Átomo cirúrgico responsável por abrir (ou atualizar) Pull Requests no repositório do Azure DevOps utilizando a ferramenta MCP `repo_pull_request_write`, consumindo os templates nativos em `.azuredevops/` como **Fonte Única da Verdade (SSoT)**, atribuindo automaticamente o Curador como revisor da PR, sincronizando a coluna do Azure Boards conforme o nível da PR e acionando o átomo **`a-ado-us-summary`** para registrar o resumo executivo no card pai INVEST (`#<US_ID>`).

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha `<PROJECT_NAME>`, `<REPOSITORY_NAME>`, `<REVIEWER_GUID>` e a chave da coluna Kanban (`WEF_*_Kanban.Column`) a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Tools Utilizadas:** `repo_pull_request_write`, `repo_pull_request`, `wit_work_item_write`, `wit_work_item_comment_write`
* **Parâmetros e Identificadores:** `<PROJECT_NAME>`, `<REPOSITORY_NAME>` e `<REVIEWER_GUID>` resolvidos via `AGENTS.md` / SSoT do workspace.
* **Campo de Coluna Kanban:** Chave `WEF_*_Kanban.Column` configurada na SSoT do workspace ou detectada dinamicamente no payload do Work Item.
* **Templates Oficiais & Regras de Coluna por Nível (SSoT):**
  1. **PR Nível 1 — Subtask SMART (`feat/us-<ID>-task-<TASK_ID>` ➔ `feat/us-<ID>`):**
     * **Template:** `.azuredevops/pull_request_template/branches/feat.md`
     * **Coluna do Card Pai (`#<US_ID>`):** Permanece obrigatoriamente em **`Developing`** (`System.State = "Doing"`). **NÃO** move para `Code Review`.
  2. **PR Nível 2 — Card Principal INVEST (`feat/us-<ID>` ➔ `main`):**
     * **Pré-requisito:** Todas as subtasks SMART filhas (`#<TASK_ID>`) já foram aprovadas e mergeadas na `feat/us-<ID>`.
     * **Template:** `.azuredevops/pull_request_template/branches/main.md`
     * **Coluna do Card Pai (`#<US_ID>`):** Move para **`Code Review`** / **`Pending`** (aguardando revisão final / merge na `main`).

---

## 🎯 Contrato do Átomo (Single Responsibility & Composição)

* **Input Esperado:**
  * Branch de origem (`sourceRefName`, ex.: `refs/heads/feat/us-19-task-21` ou `refs/heads/feat/us-19`).
  * Branch de destino (`targetRefName`, deduzida automaticamente pela hierarquia).
  * IDs dos Work Items vinculados (`<TASK_ID> <US_ID>`).
* **Output Determinístico:**
  1. Pull Request criada (ou atualizada) via MCP preenchida com o template `.azuredevops/` correspondente.
  2. Revisor padrão (GUID conforme Wiki SSoT §2.1.A) adicionado à PR via `update_reviewers`.
  3. **Governança de Coluna:** Card Pai (`#<US_ID>`) mantido em **`Developing`** (se PR Nível 1 - SMART) ou movido para **`Code Review` / `Pending`** (se PR Nível 2 - INVEST ➔ `main`).
  4. **Acionamento Automático do `a-ado-us-summary`:** Quando uma nova PR é criada, publica automaticamente o comentário de resumo executivo conciso na discussão do Card Pai INVEST (`#<US_ID>`).
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** executa `git commit` nem `git push` (delegado a `m-ado-commit-push`).
  * **NÃO** reescreve a descrição narrativa SMART do Work Item no Azure Boards (delegado a `a-ado-task-sync`).

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Dedução da Hierarquia de Branches e Seleção do Template SSoT:**
   * **Caso Nível 1 — Subtask SMART (`feat/us-<US_ID>-task-<TASK_ID>`):**
     * `sourceRefName`: `refs/heads/feat/us-<US_ID>-task-<TASK_ID>`
     * `targetRefName`: `refs/heads/feat/us-<US_ID>`
     * `workItems`: `"<TASK_ID> <US_ID>"`
     * **Ler arquivo local:** `.azuredevops/pull_request_template/branches/feat.md`
   * **Caso Nível 2 — Card Principal INVEST (`feat/us-<US_ID>`):**
     * Verificar via `wit_work_item` que todas as subtasks filhas da US `#<US_ID>` foram aprovadas/concluídas.
     * **Acionar Pre-Release Hook (`a-ado-release-bump`):** Invocar o átomo [`.agents/skills/a-ado-release-bump/SKILL.md`](../a-ado-release-bump/SKILL.md) para analisar os Conventional Commits desde a última Git Tag, calcular a `<NEXT_VERSION>`, atualizar `package.json`, prepender o bloco no `CHANGELOG.md`, commitar (`chore(release): bump v<NEXT_VERSION> e changelog (#<US_ID>)`) e subir para a branch remota antes de abrir a PR.
     * `sourceRefName`: `refs/heads/feat/us-<US_ID>`
     * `targetRefName`: `refs/heads/main`
     * `workItems`: `"<US_ID>"` (e tasks filhas)
     * **Ler arquivo local:** `.azuredevops/pull_request_template/branches/main.md`
2. **Preenchimento do Template Oficial & Coleta de Telemetria FinOps (Máx. 4.000 caracteres):**
   * Definir o título da PR seguindo estritamente a taxonomia **Conventional Commits** (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`):
     - PR Nível 1: `<type>(<scope>): <descrição da task> (#<TASK_ID>)`
     - PR Nível 2: `<type>(<scope>): <descrição da história INVEST> (#<US_ID>)`
   * **Coleta Determinística de Consumo de Tokens e Custo (AgentsView):**
     - Executar `pnpm run usage:pr -- --session antigravity:<SESSION_ID>` (ou `pnpm run usage:pr -- --branch <source_branch> --base origin/<target_branch>`) para extrair a tabela Markdown de telemetria (`Input Tokens`, `Cache Read Input Tokens`, `Output Tokens`, `Peak Context Window`, `Subagentes Incluídos` e `Custo Estimado USD`).
     - Se a tabela retornada por `pnpm run usage:pr` indicar modelos `unpriced` (`unpricedModels` não vazio), atualizar primeiro `DEFAULT_CUSTOM_MODEL_PRICING` em `.agents/skills/a-telemetry-agentsview/scripts/usage.mjs`, rodar `pnpm run usage:setup && agentsview daemon restart` e regerar a tabela antes de submeter a PR (garantindo que a descrição final respeite o limite máximo de 4.000 caracteres do MCP `repo_pull_request_write`).
     - Caso `agentsview` não esteja disponível ou a sessão retorne `exit code 2/3`, o utilitário emite automaticamente o fallback não-bloqueante `n/a` (`exit 0`).
   * Substituir todos os placeholders (`#<TASK_ID>`, `#<US_ID>`, `CA<X>`, listas da Tríade IA-DLC, checkboxes dos sensores validados e a tabela da seção `## 💰 Telemetria Agêntica & Consumo de Tokens (AgentsView)`) mantendo intactos os títulos e seções do template `.azuredevops/`.
3. **Criação / Atualização da PR (`repo_pull_request_write` — `action: "create" | "update"`):**
   * Consultar Wiki SSoT §2.1.C e executar chamada **Criação de Pull Request** via `call_mcp_tool(ServerName="azure-devops", ToolName="repo_pull_request_write", Arguments={"action": "create", "project": "<Project Name SSoT §2.1.A>", "repositoryId": "<Repository Name SSoT §2.1.A>", "sourceRefName": "...", "targetRefName": "...", "title": "...", "description": "...", "workItems": "<TASK_ID> <US_ID>"})` — o parâmetro `workItems` (IDs separados por espaço) é **obrigatório** na criação para já vincular automaticamente a Task e a US à PR.
4. **Atribuição Automática de Revisor (`repo_pull_request_write` — `action: "update_reviewers"`):**
   * Consultar Wiki SSoT §2.1.C e executar chamada **Atribuição de Revisor** via `call_mcp_tool(ServerName="azure-devops", ToolName="repo_pull_request_write", Arguments={"action": "update_reviewers", "project": "<Project Name SSoT §2.1.A>", "repositoryId": "<Repository Name SSoT §2.1.A>", "pullRequestId": <PR_ID>, "reviewerAction": "add", "reviewerIds": ["<Revisor GUID SSoT §2.1.A>"]})`.
5. **Governança de Coluna no Azure Boards conforme o Nível da PR (`wit_work_item_write`):**
   * **Se Nível 1 (Subtask SMART ➔ `feat/us-<US_ID>`):** Garantir que o card pai (`#<US_ID>`) **permaneça na aba `Developing`**.
   * **Se Nível 2 (Card Principal INVEST ➔ `main`):** Mover o card pai (`#<US_ID>`) para a coluna **`Code Review`** com `System.State = "Pending"` (para tipos que aceitam `"Pending"`). **Exceção `chore`:** cards do tipo `chore` no Azure Boards aceitam apenas `To Do | Doing | Done`; nesses casos, atualizar somente o campo Kanban `WEF_*_Kanban.Column` para `"Code Review"`, mantendo `System.State = "Doing"` para evitar HTTP 400.
6. **Gatilho Automático do Átomo `a-ado-us-summary` (`wit_work_item_comment_write`):**
   * Ao criar a PR, acionar imediatamente o protocolo de [`.agents/skills/a-ado-us-summary/SKILL.md`](../a-ado-us-summary/SKILL.md), publicando na discussão do Card Pai (`#<US_ID>`) um comentário de resumo executivo conciso (3-4 bullets sem detalhes granulares) referenciando a `PR #<PR_ID>` e a `Task #<TASK_ID>`.
7. **Retorno ao Usuário:**
   * Apresentar o **ID da PR**, **Nível (`Nível 1 - SMART` ou `Nível 2 - INVEST`)**, **Revisor atribuído (conforme Wiki SSoT §2.1.A)**, **Comentário publicado na US `#<US_ID>`**, **Coluna do Card Pai** e o **Link direto**.

---

## 💡 Protocolo de Resiliência (Fallback REST API)

Quando as ferramentas MCP do servidor `azure-devops` não estiverem disponíveis ou ativas no ambiente de execução (ex.: container isolado ou runtime sem discovery MCP configurado), execute as operações consumindo a **REST API v7.0 do Azure DevOps** via Node.js nativo utilizando as credenciais definidas em `.env.local` (`AZURE_DEVOPS_ORG_URL` e `AZURE_DEVOPS_AUTH_TOKEN` com Basic Auth base64 `:<PAT>`):

1. **Criação da Pull Request:**
   - `POST https://dev.azure.com/<ORG>/<PROJECT>/_apis/git/repositories/<REPO>/pullrequests?api-version=7.0` (Consultar Wiki SSoT §2.1.A para obter `<PROJECT>` e `<REPO>`)
   - Headers: `Authorization: Basic :<PAT>`, `Content-Type: application/json`
   - Payload: `{ sourceRefName, targetRefName, title, description, workItemRefs: [{ id: "<TASK_ID>" }, { id: "<US_ID>" }] }`
2. **Atribuição Automática de Revisor:**
   - `PUT https://dev.azure.com/<ORG>/<PROJECT>/_apis/git/repositories/<REPO>/pullrequests/<PR_ID>/reviewers/<REVIEWER_GUID>?api-version=7.0` (Consultar Wiki SSoT §2.1.A para obter `<REVIEWER_GUID>`)
   - Payload: `{ vote: 0, isRequired: true }`
3. **Vínculo do ArtifactLink da PR no Card Pai (`#<US_ID>`):**
   - `PATCH https://dev.azure.com/<ORG>/<PROJECT>/_apis/wit/workitems/<US_ID>?api-version=7.0`
   - Header: `Content-Type: application/json-patch+json`
   - Payload: `[{ op: "add", path: "/relations/-", value: { rel: "ArtifactLink", url: "vstfs:///Git/PullRequestId/<PROJ_ID>%2F<REPO_ID>%2F<PR_ID>", attributes: { name: "Pull Request" } } }]`
4. **Governança de Coluna Kanban:**
   - `PATCH https://dev.azure.com/<ORG>/<PROJECT>/_apis/wit/workitems/<US_ID>?api-version=7.0`
   - Payload: `[{ op: "add", path: "<chave WEF descrita na Wiki SSoT §2.1.B>", value: "Code Review" }]`
5. **Publicação do Resumo Executivo na Discussão:**
   - `POST https://dev.azure.com/<ORG>/<PROJECT>/_apis/wit/workitems/<US_ID>/comments?api-version=7.0-preview.3`
   - Payload: `{ text: "<comentário executivo>" }`
