---
name: a-ado-git-push
description: >-
  Átomo de operação Git para push da branch ativa (feat/us-<US_ID>-task-<TASK_ID> ou feat/us-<US_ID>) para o repositório remoto origin no Azure DevOps. Valida se a branch não é a main, estabelece o upstream tracking (-u) e retorna o status do envio remoto. Acione sob demanda quando o usuário pedir apenas para subir/enviar os commits já criados.
license: MIT
compatibility: >-
  Requer Git CLI local com remote origin configurado e autenticado para envio de branches de feature/task.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: development
---

# Atom: `a-ado-git-push` (Upstream Branch Push)

Átomo cirúrgico e independente responsável exclusivamente por enviar commits locais da branch ativa para o repositório remoto `origin` no Azure DevOps, garantindo o rastreamento de upstream (`-u origin <branch>`).

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Detecte a branch ativa via `git branch --show-current`, o remote configurado (`origin`) via `git remote` e consulte as políticas de branch nas instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/fluxo-do-board.md`).

* **Ferramenta:** Git CLI (`git branch --show-current`, `git status`, `git log`, `git push -u origin <branch>`)
* **Remote Padrão:** `origin`
* **Branches Protegidas (Bloqueio Estrito de Push Direto):** `main` e `master`

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * Branch ativa no repositório local contendo commits prontos para envio.
  * Validação de que a branch segue a hierarquia oficial (`feat/us-<US_ID>-task-<TASK_ID>` ou `feat/us-<US_ID>`).
* **Output Determinístico:**
  * Comando `git push -u origin <branch>` executado com sucesso.
  * Confirmação de sincronização e hash remoto retornado ao usuário.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** faz `git add` nem cria commits (delegado ao átomo `a-ado-git-commit`).
  * **NÃO** faz push direto para a `main` ou `master` (bloqueado por governança de Branch Policies).
  * **NÃO** abre Pull Request (delegado ao átomo `a-ado-pr-open`).

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Inspeção de Branch e Commits Pendentes:**
   * Obter a branch atual via `git branch --show-current`.
   * **Trava de Proteção:** Se a branch for `main` ou `master`, **BLOQUEAR IMEDIATAMENTE** o push direto.
   * Verificar se existem commits locais não enviados via `git status` / `git log origin/<branch>..HEAD`.
2. **Envio para o Remoto (`git push`):**
   * Executar: `git push -u origin <branch_atual>`.
3. **Retorno ao Usuário:**
   * Apresentar status da sincronização remota: **Branch**, **Status do Upstream** e **Último Commit enviado**.
