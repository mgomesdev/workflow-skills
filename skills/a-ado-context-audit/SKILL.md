---
name: a-ado-context-audit
description: >-
  Átomo de governança de contexto para tarefas do Azure Boards. Inspeciona o escopo planejado da Task (#<TASK_ID>) e confronta com o histórico recente de entregas no activity log da Wiki (knowledge/log.md) e na árvore real da codebase, identificando itens já construídos ou obsoletos para prevenir retrabalho e context drift.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (wit_work_item) autenticado e acesso de leitura ao repositório Git local e à documentação/Wiki.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: planning
---

# Atom: `a-ado-context-audit` (Task Context Drift & Sanity Auditor)

Átomo cirúrgico e independente responsável exclusivamente por auditar se o escopo técnico descrito no card da Task (`#<TASK_ID>`) ou na User Story pai (`#<US_ID>`) não está defasado em relação ao que já foi implementado em tarefas irmãs anteriores ou registrado na LLM Wiki.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<PROJECT_NAME>` e os caminhos de documentação/activity log (`knowledge/log.md`, `CHANGELOG.md`, `knowledge/wiki/`) a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Project Name:** `<PROJECT_NAME>` (extraído do `AGENTS.md` / SSoT do workspace)
* **Tool Utilizada (Leitura):** `wit_work_item` (`action: "get"`, `project: "<PROJECT_NAME>"`, `id: <TASK_ID>`, `expand: "All"`)
* **Fontes Locais de Auditoria:** Activity log da Wiki (`knowledge/log.md` / `CHANGELOG.md`), páginas da Wiki (`knowledge/wiki/`), histórico Git (`git log`) e árvore real da codebase (`src/`, `public/`, `tests/`, `.agents/`).

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * ID da Task (`<TASK_ID>`) e/ou ID da User Story pai (`<US_ID>`).
  * Descrição e critérios de aceite da tarefa a ser executada.
* **Output Determinístico:**
  * Diagnóstico de sanidade:
    * `Context: Fresh & In Sync` (nenhuma discrepância encontrada).
    * `Context Drift Detected (Items Re-scoped)` (lista explícita de itens já atendidos e do escopo real pendente).
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** move colunas nem altera campos de Work Item no Azure Boards (delegado a `a-ado-task-sync`).
  * **NÃO** cria branches nem faz checkout (delegado a `a-ado-branch-setup`).
  * **NÃO** aloca a task no desenvolvedor (delegado a `a-ado-task-assign`).

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Leitura do Escopo da Task (`wit_work_item`):**
   * Consultar o card `#<TASK_ID>` via `wit_work_item` (`project: "<PROJECT_NAME>"`, `expand: "All"`) para ler a descrição e os critérios de aceitação SMART (e extrair `<US_ID>` se ainda não informado).
2. **Varredura no Activity Log da Wiki (`knowledge/log.md`) e Git Log:**
   * Verificar entregas e commits recentes relacionados à mesma User Story pai (`#<US_ID>`).
3. **Cruzamento com a Codebase:**
   * Verificar se arquivos, componentes, testes, scripts ou rotas descritas na task já existem em `src/`, `public/`, `tests/`, `.agents/` ou `knowledge/wiki/`.
4. **Relatório de Diagnóstico:**
   * Emitir `Context: Fresh & In Sync` quando todo o escopo planejado ainda está pendente, ou `Context Drift Detected (Items Re-scoped)` segregando explicitamente os itens já implementados dos itens que restam implementar.
