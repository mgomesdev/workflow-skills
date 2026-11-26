---
name: a-telemetry-ga4
description: >-
  Átomo de consulta e extração de métricas de produto e comportamento de uso via Google Analytics 4 (GA4 Data API). Extrai sinais HEART (visualizações, scroll depth, downloads de CV e engajamento) de produção.
license: MIT
compatibility: >-
  Requer acesso à Google Analytics Data API v1beta com credenciais de ambiente (GA4_PROPERTY_ID e GOOGLE_APPLICATION_CREDENTIALS ou token de serviço).
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: planning
---

# Atom: `a-telemetry-ga4` (GA4 Product Analytics & HEART Metrics Ingestor)

Átomo especializado com **Responsabilidade Única (SRP)** responsável exclusivamente por consultar a **Google Analytics Data API (`v1beta:runReport`)**, extraindo métricas de comportamento de uso real dos visitantes e leitores em produção, mapeando os eventos da taxonomia oficial (`src/lib/telemetry.ts`).

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha `GA4_PROPERTY_ID` e as credenciais de serviço a partir das variáveis de ambiente (`.env` / `.env.local`) e consulte a taxonomia de eventos na codebase ativa (`src/lib/telemetry.ts` ou especificação HEART na Wiki).

* **API Alvo:** Google Analytics Data API (`analyticsdata.googleapis.com/v1beta`)
* **Endpoint:** `properties/{GA4_PROPERTY_ID}:runReport`
* **Eventos Canônicos Inspecionados (`src/lib/telemetry.ts`):**
  * `page_view`: Rotas mais lidas e acessadas
  * `download_cv_click`: Taxa de conversão da persona Recrutador (`mariana-recrutadora`)
  * `article_card_click`: Artigos com maior CTR no feed
  * `article_scroll_depth`: Profundidade de leitura (25%, 50%, 75%, 100%)
  * `article_code_copy`: Engajamento técnico da persona Líder Técnico (`carlos-lider-tecnico`)
  * `article_share_click`: Viralidade e compartilhamento (LinkedIn / Link)
* **Janela Temporal:** Últimos 7 dias (ou período sob demanda)

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * `period`: Janela temporal (default: `7d`).
  * `propertyId`: ID da propriedade no GA4 (extraído de `GA4_PROPERTY_ID`).
* **Output Determinístico (Snapshot GA4):**
  * Tabela ou payload Markdown estruturado contendo:
    * `totalUsers` / `activeUsers`: Volume total de leitores no período
    * `pageViewsByRoute`: Top rotas/artigos mais visualizados
    * `cvDownloads`: Contagem de cliques em download de currículo
    * `averageScrollDepth`: Média de retenção e profundidade de leitura nos artigos
    * `codeCopies`: Quantidade de códigos copiados
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** consulta Sentry ou Vercel (delegado a `a-telemetry-sentry` e `a-telemetry-vercel`).
  * **NÃO** calcula matriz de risco nem formata cards para o board (delegado a `a-telemetry-risk`).
  * **NÃO** cria work items no Azure DevOps.

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Checagem de Credenciais:**
   * Verificar disponibilidade de credenciais (`GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS` ou token de serviço no `.env`).
   * Em ausência, reportar contrato de credencial pendente.
2. **Execução do Relatório de Engajamento:**
   * Executar request contra a Data API com as dimensões (`eventName`, `pagePath`) e métricas (`eventCount`, `totalUsers`).
3. **Formatação do Snapshot GA4:**
   * Consolidar os dados brutos no bloco padrão:
     ```markdown
     ### Snapshot GA4 (Comportamento de Uso - Últimos 7d)
     - Usuários Ativos: <N>
     - Top Artigos Lidos:
       1. /posts/<slug> (<Views> views, <Média Scroll>% scroll)
     - Conversão de Objetivos HEART:
       * Downloads de CV: <Count>
       * Códigos Copiados: <Count>
       * Compartilhamentos LinkedIn: <Count>
     ```
4. **Retorno:** Entregar o bloco formatado para consumo humano ou composição na molécula `m-telemetry-digest`.
