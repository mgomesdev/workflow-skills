---
name: a-ado-branch-setup
description: >-
  Átomo de infraestrutura Git e Azure DevOps para criação e checkout da sub-branch oficial da task (feat/us-<US_ID>-task-<TASK_ID>). Valida working tree limpa, cria a branch remota a partir de feat/us-<US_ID> via MCP (repo_create_branch), vincula o ArtifactLink ao Work Item no ADO via MCP (wit_work_item_link_write) e posiciona o repositório local com tracking configurado.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (repo_create_branch e wit_work_item_link_write) autenticado e Git CLI local com suporte a git worktree.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: development
---

# Atom: `a-ado-branch-setup` (Task Sub-Branch Remote Creator, Linker & Local Checkout)

Átomo cirúrgico e independente responsável exclusivamente pela infraestrutura Git e vínculo de rastreabilidade de branches para uma Subtask SMART (`#<TASK_ID>`): cria a sub-branch remota `feat/us-<US_ID>-task-<TASK_ID>` a partir de `feat/us-<US_ID>`, vincula o artefato de branch ao card no Azure Boards e posiciona o workspace local na branch com tracking.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha `<PROJECT_NAME>`, `<PROJECT_ID>`, `<REPOSITORY_NAME>` e `<REPOSITORY_ID>` a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Project Name / ID:** `<PROJECT_NAME>` e `<PROJECT_ID>` (resolvidos via `AGENTS.md` / SSoT do workspace)
* **Repository Name / ID:** `<REPOSITORY_NAME>` e `<REPOSITORY_ID>` (resolvidos via `AGENTS.md` / SSoT do workspace)
* **Tools Utilizadas:** `repo_create_branch` e `wit_work_item_link_write` (`action: "add_artifact_link"`, `linkType: "Branch"`)

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * `<TASK_ID>` (ID da tarefa filha) e `<US_ID>` (ID da User Story pai).
* **Output Determinístico:**
  * Sub-branch remota `feat/us-<US_ID>-task-<TASK_ID>` criada a partir de `feat/us-<US_ID>`.
  * Vínculo de artefato (`ArtifactLink / Branch`) registrado no card `#<TASK_ID>` via MCP.
  * Workspace local sincronizado (`git fetch`) e posicionado em `.worktrees/task-<TASK_ID>` na branch `feat/us-<US_ID>-task-<TASK_ID>`.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** aloca a task no desenvolvedor (delegado a `a-ado-task-assign`).
  * **NÃO** valida planejamento da User Story (delegado a `a-ado-board-gate`).
  * **NÃO** altera código da feature nem commita alterações.

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Pre-flight Check da Working Tree Local:**
   * Executar `git status --porcelain`. Se houver arquivos sujos que não pertencem à task, **PARAR** e confirmar com o desenvolvedor.
2. **Criação da Sub-Branch Remota (`repo_create_branch`):**
   * Resolver `<PROJECT_NAME>` e `<REPOSITORY_NAME>` na SSoT do workspace (`AGENTS.md` ou Wiki SSoT).
   * Executar `repo_create_branch` com `project: "<PROJECT_NAME>"`, `repositoryId: "<REPOSITORY_NAME>"`, `branchName: "feat/us-<US_ID>-task-<TASK_ID>"` e `sourceBranchName: "feat/us-<US_ID>"`.
3. **Vínculo da Branch no Azure Boards (`wit_work_item_link_write`):**
   * Executar `wit_work_item_link_write` (`action: "add_artifact_link"`, `project: "<PROJECT_NAME>"`, `projectId: "<PROJECT_ID>"`, `repositoryId: "<REPOSITORY_ID>"`, `workItemId: <TASK_ID>`, `linkType: "Branch"`, `branchName: "feat/us-<US_ID>-task-<TASK_ID>"`) vinculando a nova branch ao `#<TASK_ID>`.
4. **Sincronização e Provisionamento em `.worktrees/` na Raiz do Projeto:**
   * **Proibição de Checkout na Raiz:** Nunca execute `git checkout` no diretório raiz do projeto (que deve permanecer estritamente na branch `main`).
   * Sincronizar e criar a Git Worktree sempre dentro de `.worktrees/` na raiz do projeto:
     * `git fetch origin feat/us-<US_ID> feat/us-<US_ID>-task-<TASK_ID>`
     * `mkdir -p .worktrees && git worktree add -B feat/us-<US_ID>-task-<TASK_ID> .worktrees/task-<TASK_ID> origin/feat/us-<US_ID>-task-<TASK_ID>`
5. **Confirmação:**
   * Retornar: `Branch feat/us-<US_ID>-task-<TASK_ID> criada, vinculada ao card #<TASK_ID> e posicionada em .worktrees/task-<TASK_ID>.`
