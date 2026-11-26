---
name: m-telemetry-triage
description: >-
  Molécula de orquestração completa de triagem de telemetria e alimentação contínua do Backlog (Outer Loop). Compila Sentry, Vercel e GA4, avalia a Matriz de Risco (Baixo, Médio, Alto) com IA e cria os cards INVEST/SMART no Azure Boards via MCP, operável sob demanda ou via /schedule.
license: MIT
compatibility: >-
  Orquestra a molécula m-telemetry-digest e os átomos a-telemetry-risk e a-ado-item-create (MCP azure-devops, sentry_sentry, vercel e GA4 Data API).
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: molecule
  sdlc_phase: planning
  uses: "m-telemetry-digest, a-telemetry-risk, a-ado-item-create"
---

# Molecule: `m-telemetry-triage` (Outer Loop Telemetry-to-Backlog Orchestrator)

Molécula principal do ciclo de **Outer Loop** responsável por fechar o ciclo de vida do software (**Launch ➔ Measure ➔ Steer**). Coleta evidências empíricas reais de produção (erros, infraestrutura e sinais HEART de comportamento de uso), cruza com inteligência analítica para classificar riscos e popula autonomamente o Backlog do Azure Boards com cards INVEST e SMART preenchidos.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Esta molécula é agnóstica de projeto. Delega a resolução de `<PROJECT_NAME>`, credenciais de telemetria e contrato de risco ([`matriz-risco-governanca.md`](../../../knowledge/wiki/engineering/matriz-risco-governanca.md)) à molécula `m-telemetry-digest` e aos átomos `a-telemetry-risk` e `a-ado-item-create`.

---

## 🏛️ Fluxo de Orquestração da Molécula

```mermaid
flowchart TD
    TRIAGE["🧬 m-telemetry-triage\n(Disparo manual ou /schedule semanal)"]
    DIGEST["1. 🧬 m-telemetry-digest\n(Consome Sentry + Vercel + GA4)"]
    RISK["2. ⚛️ a-telemetry-risk\n(Cruza dados reais, calcula Matriz de Risco\ne monta templates INVEST/SMART)"]
    BOARD["3. ⚛️ a-ado-item-create\n(Valida duplicidade e cria cards no Backlog via MCP)"]
    SUMMARY["Relatório Executivo para o Desenvolvedor"]

    TRIAGE --> DIGEST
    DIGEST --> RISK
    RISK --> BOARD
    BOARD --> SUMMARY

    style TRIAGE fill:#0A0A0C,stroke:#F59E0B,stroke-width:2px,color:#F8FAFC
    style DIGEST fill:#121318,stroke:#10B981,stroke-width:2px,color:#F8FAFC
    style RISK fill:#121318,stroke:#3B82F6,stroke-width:2px,color:#F8FAFC
    style BOARD fill:#121318,stroke:#3B82F6,stroke-width:2px,color:#F8FAFC
    style SUMMARY fill:#0A0A0C,stroke:#10B981,color:#F8FAFC
```

---

## ⏰ Configuração Recomendada de Automação (`/schedule`)

Para manter o backlog continuamente atualizado com base no uso real dos leitores sem sobrecarga operacional:

* **Cadência Oficial:** Semanal (toda segunda-feira às 08:00 BRT / `0 11 * * 1` UTC).
* **Comando do Antigravity:**
  ```text
  /schedule cron="0 11 * * 1" prompt="Execute a molécula m-telemetry-triage para auditar a telemetria dos últimos 7 dias e alimentar o Backlog com base em dados reais."
  ```
* **Regra de Ouro Antirruído:** A IA descarta flutuações pontuais de tráfego e só cria cards para:
  1. Exceções técnicas com $\ge 2$ ocorrências ou afetação de usuários reais.
  2. Quedas comprovadas em conversões HEART (ex.: rolagem alta sem clique em CTAs estratégicos).
  3. Falhas ou lentidão de deploys/runtime.

---

## 🎯 Contrato da Molécula

* **Input Esperado:**
  * `period`: Janela temporal (padrão: `7d`).
* **Output Determinístico:**
  * Diagnóstico analítico unificado apresentado ao desenvolvedor.
  * Novos cartões criados diretamente no **TOPO da coluna `Backlog`** do Azure Boards (via cálculo do menor `StackRank`), tipados estritamente na taxonomia herdada do Conventional Commits (`feat`, `refactor`, `perf`, `fix`, `chore`, etc.) com tags de risco (`risk:low`, `risk:medium`, `risk:high`).
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** move cards para `Doing` ou `Developing` (itens nascem no `Backlog`).
  * **NÃO** executa código de implementação das features propostas.
