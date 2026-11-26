---
name: a-ado-git-commit
description: >-
  Átomo de operação Git para stage seletivo e commit semântico (Conventional Commits com sufixo (#<TASK_ID>)) na branch ativa (feat/us-<US_ID>-task-<TASK_ID> ou feat/us-<US_ID>). Valida se a branch não é a main, adiciona arquivos pertinentes ao stage e cria o commit com rastreabilidade ao Work Item. Acione sob demanda quando o usuário pedir apenas para commitar as alterações locais.
license: MIT
compatibility: >-
  Requer Git CLI local em repositório versionado seguindo Conventional Commits v1.0.0 e branches de feature/task.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: development
---

# Atom: `a-ado-git-commit` (Selective Stage & Semantic Commit)

Átomo cirúrgico e independente responsável exclusivamente por organizar o stage (`git add`) e criar o commit semântico local no padrão **Conventional Commits** referenciando a Task (`#<TASK_ID>`) ou a User Story (`#<US_ID>`).

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<TASK_ID>` e `<US_ID>` diretamente do nome da branch Git ativa (`feat/us-<US_ID>-task-<TASK_ID>`, `feat/us-<US_ID>` ou `<type>/card-<ID>`) e consulte as convenções de commit nas instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/fluxo-do-board.md`).

* **Ferramenta:** Git CLI (`git status`, `git branch --show-current`, `git add`, `git commit`)
* **Branches Bloqueadas para Commit Direto:** `main` e `master`
* **Formato Canônico:** `<type>(<scope>): <descrição em minúsculas> (#<TASK_ID>)` + trailer opcional de telemetria `Agent-Session: antigravity:<SESSION_ID>`

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * Arquivos modificados no workspace local.
  * Contexto da Task atual (`<TASK_ID>`) ou da User Story pai (`<US_ID>`), extraídos automaticamente do nome da branch ativa (`feat/us-<US_ID>-task-<TASK_ID>` ou `feat/us-<US_ID>`).
* **Output Determinístico:**
  * Arquivos relevantes adicionados ao stage (`git add`).
  * Commit local criado no padrão Conventional Commits: `<type>(<scope>): <description> (#<TASK_ID>)`.
  * Hash do commit e mensagem gerada retornados ao usuário.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** faz `git push` para o repositório remoto (delegado ao átomo `a-ado-git-push` ou à molécula `m-ado-commit-push`).
  * **NÃO** abre Pull Request (delegado ao átomo `a-ado-pr-open`).
  * **NÃO** altera campos de Work Items no Azure Boards (delegado ao átomo `a-ado-task-sync`).

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Inspeção de Branch e Status (`Pre-flight Check`):**
   * Ler a branch atual (`git branch --show-current` / `git status -s`).
   * Validar se a branch segue a convenção oficial (`feat/us-<US_ID>-task-<TASK_ID>` ou `feat/us-<US_ID>`). **Nunca fazer commit direto na `main` ou `master`**.
2. **Stage Cirúrgico (`git add`):**
   * Listar os arquivos modificados/criados pertinentes ao escopo da task (ex.: `.stitch/`, `src/`, `knowledge/`, `.agents/`, `scripts/`).
   * Ignorar arquivos temporários, symlinks locais (`node_modules`), credenciais (`.env*`) ou artefatos fora de escopo.
3. **Commit Semântico (`git commit`):**
   * Consultar a especificação canônica de tipos (Conventional Commits v1.0.0: `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore`).
   * Formatar a mensagem no padrão canônico e anexar o trailer `Agent-Session: antigravity:<SESSION_ID>` (usando o `Conversation ID` ativo da sessão) para rastreabilidade determinística de FinOps e consumo de tokens:
     `<type>(<scope>): <descrição em minúsculas> (#<TASK_ID>)`
     *(Exemplo: `git commit -m "feat(automation): implementar molecule de release (#141)" -m "Agent-Session: antigravity:<SESSION_ID>"`)*
4. **Retorno ao Usuário:**
   * Reportar: **Commit Hash**, **Mensagem (com trailer `Agent-Session`)** e **Lista de arquivos commitados localmente**.
