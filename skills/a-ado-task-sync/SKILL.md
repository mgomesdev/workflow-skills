---
name: a-ado-task-sync
description: >-
  Átomo de sincronização de Work Items (Tasks e User Stories) no Azure Boards via MCP (wit_work_item e wit_work_item_write). Atualiza a descrição SMART da task e seu estado (To Do, Doing, Done) para refletir decisões arquiteturais reais tomadas durante a implementação, mantendo 100% de paridade entre código, Code Wiki e backlog. Acione sob demanda quando o usuário pedir para sincronizar ou atualizar a task no ADO.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (wit_work_item e wit_work_item_write) autenticado com permissão de leitura e atualização de Work Items.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: development
---

# Atom: `a-ado-task-sync` (Work Item Description & State Synchronizer)

Átomo cirúrgico e independente responsável por manter o card da **Task (`#<TASK_ID>`)** (e opcionalmente o card pai `#<US_ID>`) no Azure Boards 100% sincronizado com o que foi efetivamente construído, decidido ou refinado na sessão de desenvolvimento.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<PROJECT_NAME>` a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Tools Utilizadas:** `wit_work_item` (`action: "get"`) e `wit_work_item_write` (`action: "update"`)
* **Parâmetros:** `<PROJECT_NAME>` resolvido via `AGENTS.md` / SSoT do workspace.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * ID do Work Item (`<TASK_ID>`, ex.: `20`).
  * Decisões tomadas na sessão (ex.: ajustes de tokens, mudança de biblioteca/fonte, número da PR aberta, novo estado `Doing` ou `Done`).
* **Output Determinístico:**
  * `System.Description` atualizado em formato Markdown preservando a estrutura canônica **SMART** (`S, M, A, R, T` + `🔗 REÚSO & REFERÊNCIAS DE DOCUMENTAÇÃO`).
  * `System.State` atualizado quando aplicável (`To Do`, `Doing`, `Done`).
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** executa comandos Git (`commit` / `push`).
  * **NÃO** cria ou altera Pull Requests no Git.

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Leitura do Estado Atual (`wit_work_item`):**
   * Consultar Wiki SSoT §2.1.C e executar chamada **Leitura de Work Item** via `call_mcp_tool(ServerName="azure-devops", ToolName="wit_work_item", Arguments={"action": "get", "project": "<Project Name SSoT §2.1.A>", "id": <TASK_ID>, "expand": "All"})`.
2. **Detecção de Drift (Planejado vs. Realizado):**
   * Comparar os blocos **S, M, A, R, T** do card com os artefatos reais gerados no repositório e na Code Wiki:
     * *Tokens, caminhos de arquivos ou nomes de tecnologias mudaram?* (ex.: `Inter` substituída por `Outfit` + `Geist`).
     * *Algum sub-item foi postergado ou antecipado para outra task irmã?* (registrar nota explícita de rastreabilidade).
     * *Já existe PR aberta para a sub-branch?* (incluir referência `PR #<ID>` no bloco **T (Temporal)**).
3. **Atualização Cirúrgica no Azure Boards (`wit_work_item_write`):**
   * Consultar Wiki SSoT §2.1.C e executar chamada **Atualização de Work Item** via `call_mcp_tool(ServerName="azure-devops", ToolName="wit_work_item_write", Arguments={"action": "update", "project": "<Project Name SSoT §2.1.A>", "id": <TASK_ID>, "updates": [...]})` atualizando `/fields/System.Description` (e `/fields/System.State` se solicitado).
   * Garantir que `/multilineFieldsFormat/System.Description` permaneça em Markdown.
4. **Confirmação ao Usuário:**
   * Apresentar um resumo enxuto do que foi sincronizado no card `#<TASK_ID>` (campos atualizados, estado atual e revisão `rev`).
