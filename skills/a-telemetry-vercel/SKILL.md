---
name: a-telemetry-vercel
description: >-
  Átomo de consulta e extração de telemetria de infraestrutura via Vercel MCP. Inspeciona o status dos deploys mais recentes de produção, métricas de edge/runtime, falhas de build e logs 5xx com Zero Discovery Overhead.
license: MIT
compatibility: >-
  Requer servidor MCP vercel autenticado ou variáveis de ambiente VERCEL_TOKEN e VERCEL_PROJECT_ID (ou arquivo local .vercel/project.json).
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: planning
---

# Atom: `a-telemetry-vercel` (Vercel Deploys & Runtime Ingestor)

Átomo especializado com **Responsabilidade Única (SRP)** responsável exclusivamente por consultar a API/MCP da **Vercel**, extrair o status dos deploys mais recentes do projeto em produção (`target: "production"`), registrar ocorrências de erros 5xx de borda/serverless e tempos de resposta anômalos.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<VERCEL_PROJECT_ID>`, `<VERCEL_TEAM_ID>` (ou `orgId`) e `<PROJECT_NAME>` a partir de `.vercel/project.json`, `.env` (`VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `VERCEL_TOKEN`) ou das instruções do workspace ativo (`AGENTS.md` / Wiki SSoT).

* **MCP Server Sugerido:** `vercel`
* **API Endpoint:** `https://api.vercel.com/v6/deployments`
* **Team / Org ID:** `<VERCEL_TEAM_ID>` (resolvido via `.vercel/project.json` ou `VERCEL_ORG_ID`)
* **Project ID:** `<VERCEL_PROJECT_ID>` (resolvido via `.vercel/project.json` ou `VERCEL_PROJECT_ID`)
* **Ambiente Alvo:** `production` (`target: "production"`)
* **Métricas Extraídas:** Estado de deploy (`READY`, `ERROR`), status code 5xx/4xx em runtime logs e Core Web Vitals de borda.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * `period`: Janela temporal de consulta (default: `7d`).
  * `limit`: Quantidade de deploys/logs analisados (default: `5`).
* **Output Determinístico (Snapshot Vercel):**
  * Tabela ou payload Markdown estruturado contendo:
    * `deploymentId`: ID do deploy em produção
    * `url`: Domínio oficial de produção (`<PRODUCTION_URL>`)
    * `state`: Estado do último deploy (`READY`, `BUILDING`, `ERROR`)
    * `created`: Data/hora do último deploy
    * `runtimeErrors5xx`: Quantidade e rotas afetadas por erros HTTP 500/504
    * `speedInsightsScore`: Visão consolidada de Web Vitals (LCP, CLS, INP) se disponível
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** consulta Sentry ou GA4 (delegado a `a-telemetry-sentry` e `a-telemetry-ga4`).
  * **NÃO** calcula matriz de risco nem formata cards para o board (delegado a `a-telemetry-risk`).
  * **NÃO** cria work items no Azure DevOps.

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Checagem de Credenciais:**
   * Verificar disponibilidade do MCP `vercel` ou variáveis `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` no `.env`.
   * Caso não configurado, reportar fallback estruturado para revisão.
2. **Consulta aos Deploys de Produção:**
   * Obter o último deploy ativo em produção e os logs de execução recentes.
3. **Formatação do Snapshot Vercel:**
   * Consolidar os dados brutos no bloco padrão:
     ```markdown
     ### Snapshot Vercel (Produção - Últimos 7d)
     - Status do Deploy Ativo: READY (URL: <PRODUCTION_URL>)
     - Falhas de Build Recentes: <N>
     - Erros de Runtime 5xx: <Count> (Rotas afetadas: /...)
     ```
4. **Retorno:** Entregar o bloco formatado para consumo humano ou composição na molécula `m-telemetry-digest`.
