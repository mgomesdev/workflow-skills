---
name: a-ado-release-bump
description: >-
  Átomo de cálculo de versionamento semântico (SemVer) e geração automatizada de CHANGELOG a partir de Conventional Commits para releases de User Stories INVEST (PR Nível 2 ➔ main) e Cards Standalone diretos para a main. Localiza a última Git Tag, classifica os commits da branch (feat -> minor, fix/refactor/perf -> patch, BREAKING -> major), atualiza package.json e prepende a seção de release no CHANGELOG.md antes da submissão da PR.
license: MIT
compatibility: >-
  Requer servidor MCP azure-devops (wit_work_item), Git CLI local e Node.js com package.json e CHANGELOG.md na raiz do repositório.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: release
---

# Atom: `a-ado-release-bump` (SemVer Calculator, Changelog Generator & Release Prepper)

Átomo cirúrgico responsável por automatizar o cálculo de **Versionamento Semântico (SemVer)** e a redação padronizada do **`CHANGELOG.md`** ao preparar o fechamento de uma **User Story INVEST** (`feat/us-<US_ID>` ➔ `main`) ou de um **Card Standalone sem subtasks filhas** (`<type>/card-<ID>` ➔ `main`), eliminando totalmente a redação manual de releases e garantindo 100% de conformidade com Conventional Commits e as Branch Policies do Azure DevOps.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha `<PROJECT_NAME>` e as regras de SemVer a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md` e `knowledge/wiki/engineering/fluxo-do-board.md`).

* **MCP Server:** `azure-devops`
* **Tools MCP Utilizadas:** `wit_work_item` (`action: "get"`, `project: "<PROJECT_NAME>"`, `id: <US_ID>`)
* **Parâmetros:** `<PROJECT_NAME>` resolvido via `AGENTS.md` / SSoT do workspace.
* **Arquivos Alvo:**
  * `package.json` — Atualização do campo `"version"`.
  * `CHANGELOG.md` — Prepend do bloco oficial da release no formato Keep a Changelog.
* **Regras de Bump SemVer:**
  * Mapeamento determinístico de commits convencionais para SemVer (`feat` ➔ Minor, `fix/perf/refactor` ➔ Patch, `BREAKING CHANGE/!` ➔ Major).

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * ID do Card INVEST ou Standalone (`<US_ID>` ou `<CARD_ID>`, ex.: `74`, `83` ou `138`).
  * Branch ativa apontando para a `main` (`feat/us-<US_ID>` ou `<type>/card-<CARD_ID>`).
* **Output Determinístico:**
  1. Identificação da última tag Git estável (`vX.Y.Z`).
  2. Cálculo preciso da `<NEXT_VERSION>` e do tipo de bump (`minor` | `patch` | `major`).
  3. Atualização atômica de `package.json` com a nova versão.
  4. Inserção do novo bloco estruturado no topo de `CHANGELOG.md`.
  5. Commit semântico local: `chore(release): bump v<NEXT_VERSION> e changelog (#<ID>)`.
  6. Push para a branch remota (ou integrado ao push único de `m-ado-autonomous-dev` em cards standalone).
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** abre a Pull Request (papel do `a-ado-pr-open`).
  * **NÃO** cria a Git Tag remota (papel da esteira pós-deploy do `azure-pipelines.yml` após merge na `main`).

---

## ⚙️ Protocolo de Execução Passo a Passo

### 1. Inspeção do Histórico Git & Última Tag
* Executar no terminal:
  ```bash
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
  echo "Última tag encontrada: $LAST_TAG"
  ```
* Listar os commits entre a última tag e a branch atual:
  ```bash
  git log "${LAST_TAG}..HEAD" --oneline
  ```

### 2. Leitura da User Story no Azure Boards (`wit_work_item`)
* Obter detalhes da US `#<US_ID>` via MCP `wit_work_item`:
  - `System.Title`: Título canônico da história.
  - `System.Description`: Extrair o resumo do bloco `[V] VALIOSO` e os Critérios de Aceitação.
  - Subtasks filhas concluídas: Mapear títulos e IDs das tarefas entregues.

### 3. Cálculo Determinístico de SemVer
* Ler versão atual de `package.json`:
  ```bash
  CURRENT_VERSION=$(node -p "require('./package.json').version")
  ```
* Analisar a lista de commits convencionais desde `$LAST_TAG`:
  - Se contiver `BREAKING CHANGE` ou `!:` ➔ Major (`semver.inc(current, 'major')`).
  - Senão, se contiver `feat` / `feat(` ➔ Minor (`semver.inc(current, 'minor')`).
  - Senão ➔ Patch (`semver.inc(current, 'patch')`).

### 4. Atualização de `package.json`
* Atualizar o campo `"version"` em `package.json` para `$NEXT_VERSION`.

### 5. Atualização Estruturada do `CHANGELOG.md` (Com Subtítulos Dinâmicos Baseados no Contexto)
* **Regra de Títulos:** Apenas a linha de cabeçalho da versão (`## [<NEXT_VERSION>] - <YYYY-MM-DD> - <TITULO_DA_US> (US #<US_ID>)`) é determinística e fixa para compatibilidade com SemVer / Keep a Changelog.
* **Proibição de Subtítulos Fixos:** Nunca use subtítulos engessados como `### 🚀 Valor de Negócio & Produto ([V])`, `### ✨ Novidades & Funcionalidades` ou `### 🛡️ Engenharia, Testes & Qualidade`. Leia o contexto real da entrega e gere subtítulos `###` naturais que descrevam especificamente o que mudou na release (sem travessão longo `—`, usando hífen `-`).
* Inserir imediatamente abaixo de `---` (após o cabeçalho introdutório do `CHANGELOG.md`):
  ```markdown
  ## [<NEXT_VERSION>] - <YYYY-MM-DD> - <TITULO_DA_US> (US #<US_ID>)

  ### <Subtítulo H3 Dinâmico Derivado do Problema Resolvido / Efeito Prático na Release>
  <Resumo direto em linguagem natural do que mudou na prática para o usuário ou para a arquitetura>

  ### <Subtítulo H3 Dinâmico Derivado das Entregas Técnicas / Componentes ou Automações>
  - <Lista consolidada das entregas técnicas reais com arquivos e efeito prático>

  ### <Subtítulo H3 Dinâmico Derivado dos Sensores Determinísticos e Rastreabilidade ADO>
  - <Testes unitários, regressão visual, build e lint validados>
  - **User Story INVEST:** [#<US_ID> - <TITULO>](https://dev.azure.com/<ORG>/<PROJECT>/_workitems/edit/<US_ID>)
  - **Subtasks SMART Entregues:** #<ID_1>, #<ID_2>...

  ---
  ```

### 6. Commit & Push da Release Prepper
* Executar:
  ```bash
  git add package.json CHANGELOG.md
  git commit -m "chore(release): bump v${NEXT_VERSION} e changelog (#${US_ID})"
  git push origin "feat/us-${US_ID}"
  ```

### 7. Retorno ao Orquestrador
* Informar a `<NEXT_VERSION>` e o status da preparação para que o átomo `a-ado-pr-open` prossiga com a abertura da Pull Request Nível 2.
