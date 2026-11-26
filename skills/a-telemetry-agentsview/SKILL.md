---
name: a-telemetry-agentsview
description: >-
  Átomo de telemetria agêntica e FinOps de tokens por entrega via AgentsView (MCP e CLI). Extrai consumo de tokens (input, cache_read, output, peak_context), rollup de subagentes e custo estimado em USD de sessões do Gemini + Antigravity (IDE e CLI), formatando tabelas padronizadas para Pull Requests e resumos executivos no Azure Boards com fallback gracioso não-bloqueante.
license: MIT
compatibility: >-
  Requer Node.js e opcionalmente o binário/servidor MCP agentsview (com fallback gracioso não-bloqueante n/a quando ausente).
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: observability
---

# Atom: `a-telemetry-agentsview` (Agentic FinOps & Token Usage Extractor)

Átomo especializado em extração, agregação e formatação de telemetria de consumo de tokens e custos em USD de entregas agênticas, integrando-se nativamente com o **AgentsView** (`agentsview.io`) e operando sobre sessões locais do **Gemini + Antigravity (IDE e CLI)**.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Detecta automaticamente as sessões vinculadas à entrega por meio dos trailers `Agent-Session: antigravity:<SESSION_ID>` no `git log` da branch ativa ou via parâmetro explícito `--session`.

* **Helper CLI Local:** `node .agents/skills/a-telemetry-agentsview/scripts/usage.mjs` (`pnpm run usage:pr`, `pnpm run usage:setup`, `pnpm run usage:daily`)
* **MCP Server Opcional:** `agentsview` (`get_session_usage`)
* **Comportamento de Resiliência:** Emite fallback não-bloqueante `n/a` (`exit 0`) caso o binário `agentsview` não esteja disponível ou a sessão retorne exit code `2`/`3`.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * Contexto da entrega: ID de sessão (`--session <id>`), nome da branch atual (`--branch <branch>`), card associado (`--card <id>`) ou trailer Git `Agent-Session: antigravity:<id>`.
  * Formato desejado: Markdown (`--format markdown`), JSON (`--format json`) ou linha executiva (`--oneliner`).
* **Output Determinístico:**
  * Tabela Markdown padronizada pronta para o corpo de Pull Requests (`feat.md` / `main.md`).
  * Linha executiva concisa para comentários de resumo no Card Pai INVEST (`a-ado-us-summary`).
  * Fallback gracioso não-bloqueante (`n/a` com `exit 0`) caso o binário/servidor não esteja disponível ou a sessão retorne exit code 2/3 (sem métricas expostas).
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** abre Pull Request nem commita arquivos (delegado a `a-ado-git-commit` e `a-ado-pr-open`).
  * **NÃO** publica comentários diretamente no Azure Boards (delegado a `a-ado-us-summary`).

---

## ⚡ Formas de Execução

### Opção 1: Via Helper Determinístico CLI
```bash
# Telemetria para Pull Request (detecta sessão via git log da branch ativa e executa `agentsview source sync` automático em exit 2)
node .agents/skills/a-telemetry-agentsview/scripts/usage.mjs pr

# Sincronizar tarifas customizadas em ~/.agentsview/config.toml (e reiniciar daemon se necessário)
pnpm run usage:setup && agentsview daemon restart

# Telemetria com sessão explícita
node .agents/skills/a-telemetry-agentsview/scripts/usage.mjs --session antigravity:<SESSION_ID>

# Linha executiva para a-ado-us-summary
node .agents/skills/a-telemetry-agentsview/scripts/usage.mjs --session antigravity:<SESSION_ID> --oneliner
```

### Opção 2: Via MCP Server `agentsview` (.mcp.json)
Quando o servidor MCP `agentsview` estiver ativo no ambiente:
* Chamar `get_session_usage(sessionId="antigravity:<SESSION_ID>")`
* Agregação e rollup nativo retornam o total de tokens e custos estimados calculados sobre o SQLite local `~/.agentsview/sessions.db`.

### Regra Operacional: Tratamento Obrigatório de Modelos `unpriced`
Sempre que `pnpm run usage:pr` reportar qualquer modelo em `unpricedModels` (`$0.0000 USD (unpriced: ...)` ou `(parcial — unpriced: ...)`):
1. Adicionar as tarifas do modelo novo (variantes `Low`, `Medium`, `High`, `XHigh` e aliases) em `DEFAULT_CUSTOM_MODEL_PRICING` no arquivo `.agents/skills/a-telemetry-agentsview/scripts/usage.mjs` (com cobertura em `usage.test.ts`).
2. Executar `pnpm run usage:setup && agentsview daemon restart` para sincronizar `~/.agentsview/config.toml` e recarregar o daemon local.
3. Reexecutar `pnpm run usage:pr` para confirmar `unpricedModels: []` e custo estimado em USD antes de abrir ou atualizar a descrição da Pull Request.
