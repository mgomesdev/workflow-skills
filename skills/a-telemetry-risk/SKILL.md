---
name: a-telemetry-risk
description: >-
  Átomo de inteligência analítica e avaliação de risco. Cruza anomalias técnicas com dados de uso do GA4, calcula a Matriz de Risco estrita (Baixo, Médio, Alto) e gera a proposta de card canônica preenchida no formato INVEST (história) ou SMART (tarefa/bug).
license: MIT
compatibility: >-
  Agnóstico de plataforma; opera sobre snapshots consolidados de telemetria e matriz de risco da documentação do workspace (knowledge/wiki/engineering/matriz-risco-governanca.md).
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: planning
---

# Atom: `a-telemetry-risk` (Telemetry Cross-Analysis & Risk Matrix Engine)

Átomo especializado em **Inteligência Analítica e Decisão de Engenharia** responsável por correlacionar os sinais de saúde técnica (Sentry, Vercel) com as métricas de produto (GA4), classificar os diagnósticos na **Matriz de Risco** canônica e gerar os cartões prontos no padrão canônico da LLM Wiki (`format-card-m1.md` / `task-smart.md`).

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo consome a especificação de governança por risco do workspace ativo ([`knowledge/wiki/engineering/matriz-risco-governanca.md`](../../../knowledge/wiki/engineering/matriz-risco-governanca.md)) e os templates ágeis INVEST/SMART.

## 🏛️ 1. Matriz Canônica de Governança e Risco

A classificação dita o nível de autonomia das esteiras agênticas e governança humana:

| Nível de Risco | Tag Semântica | Critérios Técnicos e de Produto | Nível de Autonomia Futura |
| :--- | :---: | :--- | :--- |
| **Baixo** | `risk:low` | Correções cosméticas de UI, links quebrados, ajustes de copy/SEO, páginas de baixo tráfego sem bloqueio de navegação. | 🤖 **Agente Autônomo de ponta a ponta** (desenvolvimento até deploy de staging/preview). |
| **Médio** | `risk:medium` | Refatoração de componentes existentes, otimização de conversão em CTAs (ex.: download de CV), erros de borda pontuais em rotas moderadas com testes. | 🤖 **Agente até abertura da PR** (requer Code Review e aprovação humana). |
| **Alto** | `risk:high` | Falhas 5xx recorrentes, quebra de contratos de layout raiz, erros bloqueantes em rotas críticas/alto tráfego, regressões de segurança ou acessibilidade. | 👥 **Pair Programming Humano + IA** em todas as fases do SDLC. |

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * `digest`: Snapshot unificado consolidado pela molécula `m-telemetry-digest`.
* **Output Determinístico (Card Proposto):**
  * Lista de itens diagnosticados estruturados contendo:
    * `title`: Título semântico via Conventional Commits (`<type>(<scope>): <descrição>`).
    * `risk`: `risk:low` | `risk:medium` | `risk:high`.
    * `type`: Tipo exato do Work Item compatível com o Conventional Commits:
      * `feat`: Nova funcionalidade ou jornada inédita (INVEST M1).
      * `refactor`: Melhoria estrutural de código ou ajuste em jornadas existentes (INVEST M1).
      * `perf`: Otimizações de performance, Core Web Vitals e tempos de resposta (INVEST M1).
      * `fix`: Correção de anomalia funcional em produção (INVEST M1 ou SMART).
      * `chore`: Ajustes de observabilidade, pipelines ou infraestrutura.
      * `Task`: Subtarefa filha SMART para correções pontuais subordinadas.
    * `body`: Markdown no formato canônico da Wiki preenchido autonomamente pela IA com evidências empíricas anexadas.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** consulta as ferramentas externas diretamente (consome o digest).
  * **NÃO** envia os cards para o Azure Boards (delegado a `a-ado-item-create`).

---

## ⚙️ Protocolo de Análise e Síntese

1. **Cruzamento de Dados:**
   * Confrontar rotas com erro no Sentry/Vercel com o tráfego medido no GA4:
     * *Erro em rota com > 30% do tráfego total?* ➔ Classificação imediata como `risk:high`.
     * *Queda em conversão de CTA (ex: CV não clicado)?* ➔ Classificação como `risk:medium` (Oportunidade / Improvement).
     * *Aviso cosmético ou rota estática isolada?* ➔ Classificação como `risk:low`.
2. **Formatação do Cartão:**
   * Se for nova oportunidade ou refinamento de jornada ➔ Usar template **INVEST M1** (`[V], [I], [N], [E], [S], [T]`).
   * Se for correção de anomalia técnica ou bug pontual ➔ Usar template **SMART** (`S, M, A, R, T`).
3. **Retorno Estruturado:**
   * Entregar as propostas de cards categorizadas para posterior gravação no Azure Boards.
