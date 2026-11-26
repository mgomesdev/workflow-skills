---
name: a-ado-task-assign
description: >-
  Átomo de alocação e ativação de Tasks no Azure Boards via MCP (wit_work_item_write). Atribui a Task (#<TASK_ID>) ao desenvolvedor padrão (System.AssignedTo) e altera seu estado operacional para Doing (System.State = 'Doing') de forma determinística.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (wit_work_item_write) autenticado com permissão de atualização de Work Items.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: development
---

# Atom: `a-ado-task-assign` (Task Assignee & State Activator)

Átomo cirúrgico e independente responsável exclusivamente por alocar a Subtask SMART (`#<TASK_ID>`) no Azure Boards para o desenvolvedor padrão e mudar seu estado para `Doing`.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha `<PROJECT_NAME>` e `<ASSIGNEE>` (e-mail ou identidade do desenvolvedor padrão) a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Project Name:** `<PROJECT_NAME>` (extraído do `AGENTS.md` / SSoT do workspace)
* **Assignee Padrão:** `<ASSIGNEE>` (extraído da SSoT do workspace ou `git config user.email`)
* **Tool Utilizada:** `wit_work_item_write` (`action: "update"`)

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * ID da Task (`<TASK_ID>`).
* **Output Determinístico:**
  * Work Item `#<TASK_ID>` atualizado no Azure Boards com `System.AssignedTo = <ASSIGNEE>` e `System.State = "Doing"`.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** valida a planning do card pai (delegado a `a-ado-board-gate`).
  * **NÃO** audita drift de contexto (delegado a `a-ado-context-audit`).
  * **NÃO** cria sub-branch nem faz git checkout (delegado a `a-ado-branch-setup`).

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Resolução dos Parâmetros do Workspace:**
   * Obter `<PROJECT_NAME>` e `<ASSIGNEE>` no `AGENTS.md` ou Wiki SSoT (`knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).
2. **Atualização do Work Item via MCP (`wit_work_item_write`):**
   * Executar:
     ```json
     call_mcp_tool(
       ServerName="azure-devops",
       ToolName="wit_work_item_write",
       Arguments={
         "action": "update",
         "project": "<PROJECT_NAME>",
         "id": <TASK_ID>,
         "updates": [
           {"op": "add", "path": "/fields/System.AssignedTo", "value": "<ASSIGNEE>"},
           {"op": "replace", "path": "/fields/System.State", "value": "Doing"}
         ]
       }
     )
     ```
3. **Confirmação:**
   * Retornar: `Task #<TASK_ID> alocada para <ASSIGNEE> e em estado 'Doing'.`
