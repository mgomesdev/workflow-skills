---
name: a-telemetry-sentry
description: >-
  Átomo de consulta e extração de telemetria de erros via Sentry MCP. Consulta issues de produção, taxas de exceções e stack traces recentes com Zero Discovery Overhead, gerando um snapshot determinístico para a esteira de Outer Loop.
license: MIT
compatibility: >-
  Requer servidor MCP sentry_sentry (search_issues / get_issue_details) autenticado ou variável de ambiente SENTRY_AUTH_TOKEN.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: planning
---

# Atom: `a-telemetry-sentry` (Sentry Issues & Exceptions Ingestor)

Átomo especializado com **Responsabilidade Única (SRP)** responsável exclusivamente por consultar a API/MCP do **Sentry** em ambiente de produção (`production`), extrair anomalias não resolvidas, volumes de eventos e detalhes técnicos (stack trace, navegadores afetados e rotas) sem discovery manual.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<PROJECT_NAME>` e `<SENTRY_ORG>` a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md`, `.env` ou Wiki SSoT). Caso `<SENTRY_ORG>` não esteja declarado separadamente, utilize `<PROJECT_NAME>` como slug padrão.

* **MCP Server:** `sentry_sentry`
* **Organization Slug:** `<SENTRY_ORG>` (padrão: `<PROJECT_NAME>` do `AGENTS.md`)
* **Project Slug:** `<PROJECT_NAME>` (extraído do `AGENTS.md` / SSoT do workspace)
* **Ambiente Alvo:** `environment: "production"`
* **Query Padrão:** `is:unresolved issue.priority:[high, medium] level:[error, fatal]`
* **Janela Temporal:** Últimos 7 dias (ou período sob demanda)

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * `period`: Janela temporal de consulta (ex.: `7d` ou `24h` — default: `7d`).
  * `limit`: Quantidade máxima de issues retornadas (default: `10`).
* **Output Determinístico (Snapshot Sentry):**
  * Tabela ou payload Markdown estruturado contendo:
    * `id`: ID da Issue no Sentry
    * `title`: Mensagem ou título da exceção
    * `culprit`: Arquivo ou rota causadora (ex.: `src/app/posts/[slug]/page.tsx`)
    * `count`: Volume de ocorrências no período
    * `userCount`: Usuários impactados
    * `firstSeen` / `lastSeen`: Timestamps da primeira e última ocorrência
    * `permalink`: Link direto para o painel do Sentry
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** consulta Vercel ou GA4 (delegado a `a-telemetry-vercel` e `a-telemetry-ga4`).
  * **NÃO** calcula matriz de risco nem formata cards para o board (delegado a `a-telemetry-risk`).
  * **NÃO** cria work items no Azure DevOps.

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Checagem de Credenciais & Conectividade:**
   * Verificar disponibilidade do MCP `sentry` ou variável `SENTRY_AUTH_TOKEN` no `.env`.
   * Caso não haja credencial autenticada, emitir relatório de alerta informando a falta do token para revisão do desenvolvedor.
2. **Execução da Consulta:**
   * Listar issues não resolvidas em ambiente `production` ordenadas por frequência (`sort: "freq"`).
3. **Formatação do Snapshot Sentry:**
   * Consolidar os dados brutos no bloco padrão:
     ```markdown
     ### Snapshot Sentry (Produção - Últimos 7d)
     - Total de Issues Não Resolvidas: <N>
     - Issues Críticas/Erros:
       1. [<ID>] <Título do Erro> | Eventos: <Count> | Usuários: <Users> | Rota: <Culprit>
     ```
4. **Retorno:** Entregar o bloco formatado para consumo humano ou composição na molécula `m-telemetry-digest`.
