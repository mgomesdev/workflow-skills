---
name: a-ado-pr-threads
description: >-
  Átomo de leitura, triagem, resposta e resolução de threads de comentários em Pull Requests do Azure DevOps via MCP (repo_pull_request_thread e repo_pull_request_thread_write). Filtra eventos automáticos de sistema (commentType: 3 / RefUpdate), interpreta apontamentos humanos com suporte a Conventional Comments (issue:, todo:, suggestion:, nitpick:, praise:), publica respostas técnicas rastreáveis (reply) e atualiza o status da thread (Fixed, Closed, WontFix, ByDesign). Acione sob demanda quando o usuário pedir para ler, responder ou resolver comentários de uma PR.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (repo_pull_request_thread e repo_pull_request_thread_write) autenticado com permissão de leitura e escrita em Pull Requests.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: review
---

# Atom: `a-ado-pr-threads` (PR Review Threads Reader, Responder & Resolver via MCP)

Átomo cirúrgico e independente responsável por inspecionar as threads de revisão de uma Pull Request ativa no Azure DevOps, separar comentários humanos de eventos automáticos de push, responder a apontamentos de Code Review e atualizar o status de cada thread (`Active` ➔ `Fixed` / `Closed`).

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha `<PROJECT_NAME>` e `<REPOSITORY_NAME>` a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Tools Utilizadas:** `repo_pull_request_thread` e `repo_pull_request_thread_write`
* **Parâmetros:** `<PROJECT_NAME>` e `<REPOSITORY_NAME>` resolvidos via `AGENTS.md` / SSoT do workspace.
* **Classificação e Status de Threads:** `commentType: 1` (comentário humano/agente) vs `commentType: 3` (evento de sistema `RefUpdate`), e status `Active` (`1`), `Fixed` (`2`), `WontFix` (`3`), `Closed` (`4`), `ByDesign` (`5`), `Pending` (`6`).

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * `pullRequestId` (ex.: `1` — ou deduzido automaticamente da branch ativa via `repo_pull_request`).
  * Modo de operação solicitado pelo usuário:
    1. **Leitura / Triagem (`read`):** Listar todos os comentários humanos ativos com arquivo/linha (`threadContext`) e classificação *Conventional Comments*.
    2. **Resposta e Resolução (`resolve`):** Publicar `reply` explicando a correção/resposta (com hash do commit quando aplicável) e atualizar o `status` da thread para `Fixed` ou `Closed`.
* **Output Determinístico:**
  * Relatório estruturado das threads humanas (`threadId`, autor, arquivo:linha, conteúdo, status atual) e/ou confirmação das respostas e mudanças de status aplicadas via MCP.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** faz `git commit` nem `git push` sozinho (se uma thread exigir alteração de código, o agente edita o código, aciona `m-ado-commit-push` e só então usa `a-ado-pr-threads` para responder com o hash do commit e marcar `Fixed`).
  * **NÃO** altera a descrição principal da PR (papel do `a-ado-pr-open`) nem a descrição do Work Item (papel do `a-ado-task-sync`).

---

## ⚙️ Protocolo de Execução Passo a Passo

### Fase 1: Leitura e Triagem Inteligente (`repo_pull_request_thread`)
1. **Buscar todas as threads da PR:**
   * Consultar Wiki SSoT §2.1.C e executar chamada **Listagem de Threads** via `call_mcp_tool(ServerName="azure-devops", ToolName="repo_pull_request_thread", Arguments={"action": "list", "project": "<Project Name SSoT §2.1.A>", "repositoryId": "<Repository Name SSoT §2.1.A>", "pullRequestId": <PR_ID>, "fullResponse": true})`.
2. **Filtrar ruído de sistema:**
   * Descartar qualquer thread onde `isDeleted == true` ou onde todos os comentários sejam `commentType == 3` (`CodeReviewThreadType == "RefUpdate"`).
3. **Extrair contexto cirúrgico de cada thread humana (`commentType == 1`):**
   * `threadId`: `thread.id`
   * `status`: `thread.status` (`1 = Active`, `2 = Fixed`, `4 = Closed`, etc.)
   * **Localização no Código (`threadContext`):**
     * Se `thread.threadContext != null`: extrair `filePath`, `rightFileStart.line` e `rightFileEnd.line` (comentário *inline* em arquivo específico).
     * Se `thread.threadContext == null`: classificar como **Comentário Geral da PR**.
   * **Semântica (*Conventional Comments*):** Identificar prefixos `issue:`, `todo:`, `suggestion:`, `nitpick:`, `question:` ou `praise:` para priorizar correções bloqueantes.

### Fase 1.5: Varredura e Correção Transversal em Todos os Arquivos da PR (Obrigatório)
Quando um comentário humano apontar um erro de padrão de código, arquitetura ou convenção da Wiki (ex.: uso de ternário em `className`, string hardcoded fora do `i18n`, constante/subcomponente dentro do render ou acima do componente principal, seletor fora do Page Object):
1. **Não corrija apenas a linha comentada:** liste todos os arquivos modificados na PR (`git diff --name-only origin/<targetBranch>...HEAD`).
2. **Auditoria transversal:** inspecione todos os arquivos tocados na PR em busca do mesmo antipadrão e corrija todas as ocorrências em lote antes de rodar o quality gate, commitar e responder às threads.

### Fase 2: Resposta e Resolução (`repo_pull_request_thread_write`)
Quando solicitado para responder ou resolver uma thread (`threadId`):
1. **Publicar Resposta na Thread (`action: "reply"`):**
   * Consultar Wiki SSoT §2.1.C e executar resposta via `call_mcp_tool(ServerName="azure-devops", ToolName="repo_pull_request_thread_write", Arguments={"action": "reply", "project": "<Project Name SSoT §2.1.A>", "repositoryId": "<Repository Name SSoT §2.1.A>", "pullRequestId": <PR_ID>, "threadId": <THREAD_ID>, "content": "<resposta técnica objetiva + commit hash se houve fix>"})`.
2. **Atualizar Status da Thread (`action: "update_status"`):**
   * Se houve ajuste de código/documentação: definir `status: "Fixed"`.
   * Se era apenas pergunta, teste ou `praise:`: definir `status: "Closed"`.
   * Consultar Wiki SSoT §2.1.C/D e executar atualização de status via `call_mcp_tool(ServerName="azure-devops", ToolName="repo_pull_request_thread_write", Arguments={"action": "update_status", "project": "<Project Name SSoT §2.1.A>", "repositoryId": "<Repository Name SSoT §2.1.A>", "pullRequestId": <PR_ID>, "threadId": <THREAD_ID>, "status": "Fixed" | "Closed"})`.
3. **Retorno ao Usuário:**
   * Apresentar tabela resumida com `Thread #ID`, `Arquivo/Escopo`, `Resposta enviada` e `Novo Status`.
