---
name: a-ado-us-summary
description: >-
  Átomo de publicação automática de comentário de resumo executivo no Card Principal (User Story / Issue INVEST #<US_ID>) no Azure Boards via MCP (wit_work_item_comment_write). Registra de forma concisa e sem detalhes excessivos o que foi entregue na Subtask SMART (#<TASK_ID>) e o link da PR correspondente. Pode ser acionado sob demanda ou encadeado automaticamente ao abrir uma Pull Request via a-ado-pr-open.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (wit_work_item_comment_write) autenticado e opcionalmente o utilitário local a-telemetry-agentsview (usage.mjs).
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: review
  uses: "a-telemetry-agentsview"
---

# Atom: `a-ado-us-summary` (Parent INVEST Card Executive Summary Commenter)

Átomo cirúrgico e independente responsável por publicar um **comentário de resumo executivo** diretamente na aba *Discussion* do **Card Principal INVEST (`#<US_ID>`)** no Azure Boards sempre que uma Subtask SMART (`#<TASK_ID>`) tem sua entrega submetida em Pull Request ou concluída.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<PROJECT_NAME>` a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Tool de Escrita de Comentário:** `wit_work_item_comment_write` (`action: "add"`, `project: "<PROJECT_NAME>"`, `workItemId: <US_ID>`, `format: "Markdown"`, `text: "<conteúdo>"`)
  * ⚠️ **Atenção ao Payload:** O argumento para o corpo do comentário é estritamente **`text`** (o schema MCP rejeita `comment`).
* **Parâmetros:** `<PROJECT_NAME>` resolvido via `AGENTS.md` / SSoT do workspace.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * ID do Card Principal INVEST (`<US_ID>`, ex.: `19`).
  * ID e código da Subtask SMART (`<TASK_ID>`, ex.: `21` / `[TASK-02]`).
  * ID da Pull Request aberta (`<PR_ID>`, ex.: `2`).
  * 3 a 4 *bullet points* de alto nível (sem detalhes técnicos granulares de implementação) resumindo os marcos entregues na sessão.
* **Output Determinístico:**
  * Comentário formatado em Markdown adicionado à discussão do Card Principal (`#<US_ID>`) via `wit_work_item_comment_write`.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** altera a descrição principal (`System.Description`) do card INVEST.
  * **NÃO** faz commits nem altera arquivos no Git.

---

## 📝 Template Canônico do Comentário Executivo (Conciso)

```markdown
### 📋 Resumo Executivo — Subtask #<TASK_ID> (`[TASK-0X]` · PR #<PR_ID>)

Entregas consolidadas nesta subtask para a branch `feat/us-<US_ID>`:

* **<Pilar 1 (ex.: Protótipo / Design)>:** <Resumo de 1 linha sem detalhes de baixo nível>.
* **<Pilar 2 (ex.: Código / Automação)>:** <Resumo de 1 linha sem detalhes de baixo nível>.
* **<Pilar 3 (ex.: Code Wiki / Governança)>:** <Resumo de 1 linha sem detalhes de baixo nível>.

**Telemetria FinOps (AgentsView):** **~$<COST_USD> USD** · `<TOTAL_TOKENS>` tokens totais (`<INPUT_TOKENS>` in / `<CACHE_READ_TOKENS>` cache / `<OUTPUT_TOKENS>` out · peak ctx `<PEAK_CTX>` · `<SUBAGENTS>` subagentes · modelo: `<MODEL>`).
**Status no Board:** Card principal `#<US_ID>` em `Developing` (`<X>/<TOTAL>` subtasks encaminhadas).
```

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Identificação do Card Pai (`<US_ID>`):**
   * Obter `<US_ID>` a partir do nome da branch ativa (`feat/us-<US_ID>-task-<TASK_ID>`) ou do campo `System.Parent` da Task.
2. **Síntese Executiva & Telemetria FinOps (Sem Ruído Técnico):**
   * Redigir no máximo 3 a 4 tópicos curtos focados no **valor entregue** (o *quê* foi resolvido), evitando listar nomes de variáveis, diffs de linhas ou comandos de terminal.
   * Executar o átomo `a-telemetry-agentsview` via `pnpm run usage:pr -- --session antigravity:<SESSION_ID> --oneliner` (ou `node .agents/skills/a-telemetry-agentsview/scripts/usage.mjs --session antigravity:<SESSION_ID> --oneliner`) para obter a linha resumida de consumo de tokens e custo estimado da entrega (com fallback automático `n/a` caso indisponível).
3. **Publicação via MCP (`wit_work_item_comment_write`):**
   * Consultar Wiki SSoT §2.1.C e executar chamada **Comentário de Resumo Executivo** via `call_mcp_tool(ServerName="azure-devops", ToolName="wit_work_item_comment_write", Arguments={"action": "add", "project": "<Project Name SSoT §2.1.A>", "workItemId": <US_ID>, "format": "Markdown", "text": "<conteúdo markdown>"})`.
4. **Confirmação ao Usuário:**
   * Retornar o ID do comentário criado no card `#<US_ID>`.
