---
name: a-ado-item-create
description: >-
  Átomo de criação automatizada de Work Items no Azure Boards via MCP (wit_work_item_write). Cria cards de qualquer tipo canônico do projeto (feat, fix, refactor, perf, docs, style, test, chore, Task) no topo do Backlog com validação prévia de duplicidade (WIQL via wit_query) e preenchimento canônico em Markdown.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (wit_query e wit_work_item_write) autenticado com permissão de leitura e criação de Work Items.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: planning
---

# Atom: `a-ado-item-create` (Azure Boards Work Item Creator, Prioritizer & Deduplicator)

Átomo cirúrgico com **Responsabilidade Única (SRP)** responsável exclusivamente por criar novos Work Items tipados estritamente na taxonomia do projeto/Conventional Commits (`feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore` no padrão INVEST M1 ou `Task` no padrão SMART) no Azure Boards via MCP, garantindo prevenção de duplicidade e **posicionamento determinístico no topo do Backlog** via cálculo de `Microsoft.VSTS.Common.StackRank`.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<PROJECT_NAME>`, `<AREA_PATH>` e `<ITERATION_PATH>` a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`). Caso Area/Iteration Path não sejam especificados separadamente, utilize `<PROJECT_NAME>` como valor padrão.

* **MCP Server:** `azure-devops`
* **Project:** `<PROJECT_NAME>` (extraído do `AGENTS.md` / SSoT do workspace)
* **Tools Utilizadas:** `wit_query` (`action: "wiql"` para checagem de duplicidade e obtenção do menor `StackRank`) e `wit_work_item_write` (`action: "create"`)
* **Área Padrão:** `<PROJECT_NAME>`
* **Iteração Padrão:** `<PROJECT_NAME>`
* **Taxonomia Canônica de Tipos de Work Item:**
  * O projeto possui tipos customizados que herdam de User Story/feat e correspondem exatamente aos tipos do **Conventional Commits**:
    * `feat`: Nova funcionalidade (SemVer MINOR).
    * `fix`: Correção de bug em produção (SemVer PATCH).
    * `refactor`: Refatoração interna de código ou arquitetura sem alteração de comportamento.
    * `perf`: Melhoria de performance, Core Web Vitals ou tempo de resposta.
    * `docs`: Atualizações de documentação, Living Wiki ou guias técnicos.
    * `style`: Ajustes puramente visuais, cosméticos ou de formatação.
    * `test`: Adição ou melhoria de suítes de testes.
    * `chore`: Configurações de ferramentas, builds, dependências ou rotinas operacionais.
    * `Task`: Subtarefa técnica filha SMART ligada a um card pai.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * `title`: Título semântico via Conventional Commits (ex.: `perf(images): ...`, `refactor(analytics): ...`, `feat(conversion): ...` ou `fix(layout): ...`).
  * `workItemType`: Tipo exato do Work Item compatível com o prefixo Conventional Commits (`feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore` ou `Task`).
  * `description`: Corpo em Markdown no formato canônico (`format-card-m1.md` ou `task-smart.md`).
  * `tags`: Lista de tags (ex.: `outer-loop; telemetry; risk:medium`).
* **Output Determinístico:**
  * Work Item criado no topo do Backlog do Azure Boards com ID numérico, URL direta e `StackRank` priorizado.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** consulta ferramentas de telemetria (delegado aos átomos `a-telemetry-*`).
  * **NÃO** calcula matriz de risco (delegado a `a-telemetry-risk`).
  * **NÃO** altera branches Git nem cria PRs.

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Prevenção de Duplicidade (WIQL Check):**
   * Consultar via `wit_query` (`project: "<PROJECT_NAME>"`):
     ```sql
     SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '<PROJECT_NAME>' AND [System.Title] = '<title>' AND [System.State] <> 'Removed'
     ```
   * Se já existir item idêntico não removido, abortar criação e retornar ID existente.
2. **Cálculo de Posicionamento no Topo do Backlog (StackRank):**
   * No Azure DevOps, o Backlog organiza os itens por `Microsoft.VSTS.Common.StackRank` em ordem crescente (menor valor = topo da lista). Itens criados sem esse campo vão automaticamente para o final da fila.
   * Consultar o menor StackRank ativo via `wit_query`:
     ```sql
     SELECT [System.Id], [Microsoft.VSTS.Common.StackRank] FROM WorkItems WHERE [System.TeamProject] = '<PROJECT_NAME>' AND [Microsoft.VSTS.Common.StackRank] > 0 ORDER BY [Microsoft.VSTS.Common.StackRank] ASC
     ```
   * Calcular o novo rank do topo:
     * Se houver itens: `topRank = minRank - 1000` (ou `minRank / 2` caso `minRank <= 1000`).
     * Se não houver itens: `topRank = 1000`.
3. **Criação do Item (`wit_work_item_write`):**
   * Executar `wit_work_item_write` com `action: "create"` e `project: "<PROJECT_NAME>"` passando:
     * `workItemType`: Tipo exato do Conventional Commits (`feat`, `refactor`, `perf`, `fix`, etc.).
     * `fields`:
       * `System.Title`: `<title>`
       * `System.Description`: `<description>` (format: `Markdown` se suportado, senão texto puro)
       * `System.Tags`: `<tags>`
       * `System.AreaPath`: `<PROJECT_NAME>`
       * `System.IterationPath`: `<PROJECT_NAME>`
       * `Microsoft.VSTS.Common.StackRank`: `<topRank>` (valor numérico como string)
4. **Confirmação:**
   * Retornar: `Card #<ID> (<workItemType>) criado com sucesso no TOPO do Backlog do Azure Boards (StackRank: <topRank>).`
