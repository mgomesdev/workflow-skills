---
name: a-ado-board-gate
description: >-
  Átomo de pré-voo (Pre-Flight Gatekeeper) do Azure Boards via MCP (wit_work_item e wit_work_item_write). Verifica obrigatoriamente antes de implementar qualquer Task se a Planning da User Story pai (#<US_ID>) foi concluída (existência de Tasks filhas SMART vinculadas), audita drift de contexto entre o escopo da US/Task e o estado real da codebase/Wiki, e garante que o card pai esteja na coluna 'Developing' (System.State = 'Doing') e a Task em 'Doing'. Bloqueia a implementação caso a Planning não tenha sido feita, ou move automaticamente o card de 'To Develop'/'Planning' para 'Developing' quando a Planning já estiver completa.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (wit_work_item e wit_work_item_write) autenticado e acesso de leitura ao repositório Git local.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: development
---

# Atom: `a-ado-board-gate` (Pre-Flight Board, Planning & Context Gatekeeper)

Átomo determinístico de **governança de pré-desenvolvimento** para impedir que qualquer código ou configuração de uma Task (`#<TASK_ID>`) seja implementado enquanto o card pai (`#<US_ID>`) ainda estiver estacionado em `To Develop`, sem **Planning** concluída no Azure Boards ou com **escopo desatualizado (context drift)** em relação à codebase e à documentação do projeto.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha o nome do projeto (`<PROJECT_NAME>`), o caminho da documentação/changelog e a chave da coluna Kanban a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`). Caso o campo de extensão Kanban não esteja documentado, detecte dinamicamente a chave `WEF_*_Kanban.Column` diretamente no objeto `fields` retornado por `wit_work_item`.

* **MCP Server:** `azure-devops`
* **Project Name:** `<PROJECT_NAME>` (extraído do `AGENTS.md` / Wiki SSoT do workspace ou do campo `System.TeamProject`)
* **Tools Utilizadas:** `wit_work_item` (`action: "get"`), `wit_work_item_write` (`action: "update"`) e `repo_pull_request` (`action: "list"` para validar merge de tasks predecessoras)
* **Campo de Coluna Kanban:** Chave `WEF_*_Kanban.Column` configurada na SSoT do projeto ou inspecionada dinamicamente no payload do Work Item.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * ID da Task (`<TASK_ID>`, ex.: `175`) e/ou ID da User Story pai (`<US_ID>`, ex.: `115`).
* **Regras de Guarda (Pre-Flight Gate):**
  1. **Verificação de Planning Concluída (Hard Stop):**
     * O card pai (`#<US_ID>`) **DEVE** possuir subtarefas filhas (`System.LinkTypes.Hierarchy-Forward` / `Child`) criadas e estruturadas no padrão SMART, com títulos semânticos padronizados via **Conventional Commits**.
     * Se `relations` não contiver nenhuma task filha (ou se o card estiver em `Backlog` / `Refinament`), **BLOQUEAR IMEDIATAMENTE** o início do desenvolvimento e orientar a execução da etapa de **Planning** (`m-invest-smart`).
  2. **Auditoria de Dependências entre Tasks e Colisão de Escopo (Dependency & Wave Gate — Hard Stop):**
     * Inspecionar as relações da Task `#<TASK_ID>` e as demais subtasks irmãs vinculadas ao card pai `#<US_ID>` (`wit_work_item`):
       - **Predecessora Formal ou Declarada:** Verificar se a Task possui relação `System.LinkTypes.Dependency-Reverse` (`Predecessor`) no ADO ou declaração explícita de dependência/onda (`Depende de: #<ID>`, `Pré-requisito: #<ID>`, `Onda N`) no corpo SMART.
       - **Sobreposição de Arquivos-Alvo (Conflict Prevention):** Cruzar os arquivos/diretórios-alvo listados no bloco SMART da Task `#<TASK_ID>` com os das demais subtasks irmãs da mesma US que estejam em `Doing` (ou em `To Do` com ordem anterior na sequência da história).
     * **Condição de Bloqueio:** Se existir qualquer Task predecessora ou colidente cujo `System.State != "Done"` **OU** cuja Pull Request Nível 1 (`feat/us-<US_ID>-task-<PREDECESSOR_ID>` ➔ `feat/us-<US_ID>`) ainda esteja aberta (`status: "active"`) e não mergeada (`completed`) em `origin/feat/us-<US_ID>`, **BLOQUEAR IMEDIATAMENTE** o início da worktree (`GATE BLOCKED: Unmet Dependency on Task #<PREDECESSOR_ID>`) para evitar conflito de merge e código redundante.
  3. **Auditoria de Drift de Contexto (Context Sanity Gate):**
     * Cruza o escopo planejado da Task com o estado real de entrega registrado no histórico/changelog da documentação (ex.: `knowledge/log.md` ou `CHANGELOG.md`), nas páginas de arquitetura da Wiki e na árvore do repositório (`src/`, `public/`, `tests/`).
     * Se a task contiver itens já construídos por tarefas anteriores, identifica e segrega os itens obsoletos para que o plano reflita apenas o escopo real pendente.
  4. **Transição Obrigatória para `Developing` antes do Código:**
     * Uma Task **SÓ PODE** começar a ser implementada se o card pai (`#<US_ID>`) estiver na coluna **`Developing`** (`System.BoardColumn == "Developing"` e `System.State == "Doing"`).
     * Se a Planning já foi feita (tasks filhas existem), mas o card pai ainda estiver em `To Develop` ou `Planning`, este átomo **DEVE** movê-lo imediatamente para a coluna **`Developing`** (`System.State = "Doing"`) e colocar a Task ativa (`#<TASK_ID>`) em `System.State = "Doing"` **antes** de escrever qualquer linha de código.
* **Output Determinístico:**
  * Status do Gate: `PASSED (Ready to Implement)`, `BLOCKED (Planning Required)` ou `BLOCKED (Unmet Dependency on Task #<PREDECESSOR_ID>)`.
  * Card Pai (`#<US_ID>`) em `System.BoardColumn: "Developing"` (`System.State: "Doing"`).
  * Card da Task (`#<TASK_ID>`) em `System.State: "Doing"`.
  * Diagnóstico de Contexto: `Context: Fresh & In Sync` ou `Context Drift Detected (Items Re-scoped)`.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** cria as subtarefas da Planning (papel da molécula `m-invest-smart`).
  * **NÃO** altera código-fonte, não faz commits Git e não abre PRs.

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Inspeção do Card Pai e da Task (`wit_work_item`):**
   * Executar a chamada **Leitura de Work Item** via `call_mcp_tool(ServerName="azure-devops", ToolName="wit_work_item", Arguments={"action": "get", "project": "<PROJECT_NAME>", "id": <US_ID>, "expand": "All"})`.
   * Se apenas `<TASK_ID>` foi informado, inspecionar a Task primeiro e extrair `<US_ID>` da relação `System.LinkTypes.Hierarchy-Reverse` (`Parent`).
2. **Auditoria de Planning (Checklist de Bloqueio):**
   * Verificar se existem relações `System.LinkTypes.Hierarchy-Forward` (`Child`) no card `<US_ID>`.
   * Verificar se `<TASK_ID>` faz parte das tasks filhas planejadas.
   * **Se FALSO:** Interromper a execução (`GATE BLOCKED`) e informar ao usuário que o card precisa passar por **Planning** antes de implementar.
2.5. **Auditoria de Dependências e Colisão de Escopo (`wit_work_item` + `repo_pull_request`):**
   * Inspecionar as relações `System.LinkTypes.Dependency-Reverse` (`Predecessor`) da Task `<TASK_ID>` e ler o escopo/estado das subtasks irmãs (`Child` do `<US_ID>`).
   * Identificar se `<TASK_ID>` depende de artefatos de outra subtask irmã (`#<PREDECESSOR_ID>`) ou se toca nos mesmos arquivos-alvo de uma subtask irmã anterior/em andamento.
   * Se houver `#<PREDECESSOR_ID>`, verificar se `System.State == "Done"` e se a PR `refs/heads/feat/us-<US_ID>-task-<PREDECESSOR_ID>` já consta como `completed` (mergeada na `feat/us-<US_ID>`).
   * **Se FALSO (predecessora em `To Do`/`Doing` ou PR ainda `active`):** Interromper imediatamente (`🛑 GATE BLOCKED: Unmet Dependency on Task #<PREDECESSOR_ID>`), não mover a Task `<TASK_ID>` para `Doing` e orientar a conclusão e merge da task predecessora antes de provisionar a worktree.
3. **Auditoria de Sanidade de Contexto (Context Drift Check):**
   * Verificar no log de atividades da Wiki (ex.: `knowledge/log.md`) e no histórico Git recente os commits e entregas da User Story pai.
   * Confrontar os critérios de aceitação e descrição da task com o código real do repositório.
   * Se houver itens obsoletos ou já concluídos, sinalizar explicitamente antes de iniciar.
4. **Sincronização de Coluna Kanban (`Developing`) e Estado (`Doing`):**
   * Verificar `fields["System.BoardColumn"]` e `fields["System.State"]` do card pai `<US_ID>`.
   * Se `System.BoardColumn` for `"To Develop"` ou `"Planning"` (ou `System.State` for `"To Do"`):
     * Identificar a chave de extensão Kanban `WEF_*_Kanban.Column` presente em `fields` (ou definida na SSoT do workspace).
     * Executar `wit_work_item_write` (`action: "update"`) no `<US_ID>` com:
       * `{"op": "test", "path": "/rev", "value": <rev_atual>}`
       * `{"op": "replace", "path": "/fields/System.State", "value": "Doing"}`
       * `{"op": "replace", "path": "/fields/<WEF_*_Kanban.Column>", "value": "Developing"}`
   * Verificar `System.State` da Task `<TASK_ID>`: se estiver em `"To Do"`, atualizar para `"Doing"` via `wit_work_item_write`.
5. **Liberação do Gate:**
   * Confirmar no chat: `✅ Gate Passing: US #<US_ID> em 'Developing' (Planning verificada com N tasks) | Task #<TASK_ID> em 'Doing' | Contexto validado com a codebase. Iniciando implementação.`
