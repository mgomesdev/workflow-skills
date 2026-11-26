---
id: engineering-arquitetura-skills-atomicas
title: "Arquitetura de Skills Atômicas e Componíveis (Atoms & Molecules)"
category: "engineering"
type: "Engineering Architecture Standard"
status: "Approved"
sources: ["raw/2026-11-26-fundacao-workflow-skills-marketplace"]
last_updated: "2026-11-26"
summary: "Especificação canônica de autoria de Agent Skills em camadas (Átomos a-* e Moléculas m-*), conformidade agentskills.io (skills-ref), parametrização agnóstica e checklist de segurança pública."
tags: [engineering, agent-skills, atomic-architecture, agentskills, security, skills-ref]
---

# Arquitetura de Skills Atômicas e Componíveis (`workflow-skills`)

* **Fonte Primária:** [`raw/2026-11-26-fundacao-workflow-skills-marketplace`](../../raw/2026-11-26-fundacao-workflow-skills-marketplace.md)
* **Conexão Direta:** [`wiki/engineering/governanca-evals-e-publicacao`](./governanca-evals-e-publicacao.md)

---

## 🏛️ 1. Taxonomia em 2 Camadas

```text
1. ÁTOMOS (a-*)     ➔ Operação unitária de responsabilidade única (SRP).
                      Declara fronteira estrita do que NÃO faz.
2. MOLÉCULAS (m-*)  ➔ Orquestração composta que encadeia 2+ átomos em sequência determinística.
                      Declara explicitamente suas dependências em metadata.uses.
```

* **Convenção de diretórios:** Toda skill reside em `skills/<skill-name>/` contendo obrigatoriamente:
  * `SKILL.md` (especificação e protocolo operacional)
  * `evals/evals.json` (casos de avaliação e testes de gatilho)
  * Pastas opcionais padronizadas pela spec: `scripts/`, `references/`, `assets/`.

---

## 📐 2. Contrato Estrito de Frontmatter (`agentskills.io` / `skills-ref`)

Na raiz do YAML frontmatter de todo `skills/<name>/SKILL.md`, são permitidas **exclusivamente** as chaves oficiais da especificação `agentskills.io`:

| Chave Raiz | Obrigatória | Regras |
| :--- | :---: | :--- |
| `name` | Sim | Máx. 64 caracteres, regex `^[a-z0-9]+(-[a-z0-9]+)*$`, **idêntico ao nome do diretório**. |
| `description` | Sim | Máx. 1024 caracteres, não vazia; descreve **o que faz** e **quando acionar**. |
| `license` | Recomendada | Padrão `MIT`. |
| `compatibility` | Recomendada | Máx. 500 caracteres declarando pré-requisitos (Node.js, Git CLI, servidores MCP). |
| `metadata` | Sim | Mapa estritamente **string-para-string** (`Record<string, string>`) contendo `author`, `version`, `layer` (`atom` \| `molecule`), `sdlc_phase` e `uses` (lista separada por vírgulas para moléculas). |
| `allowed-tools` | Opcional | Lista de ferramentas pré-aprovadas conforme spec. |

> [!CAUTION]
> **Proibição de chaves customizadas na raiz:** Nunca coloque `layer`, `sdlc_phase` ou `uses` na raiz do frontmatter YAML. Eles pertencem estritamente a `metadata:`.

---

## 🛡️ 3. Regras de Agnosticismo e Checklist de Segurança Pública

Como este repositório é **público**, toda criação ou edição de skill deve respeitar:

1. **Zero Hardcoding de Projeto:** Nunca gravar nomes de projetos privados, GUIDs de repositórios/projetos, e-mails pessoais, Team IDs ou Project IDs literais. Utilize placeholders semânticos (`<PROJECT_NAME>`, `<REPO_NAME>`, `<DEFAULT_ASSIGNEE>`, `<SENTRY_ORG_SLUG>`) instruindo o agente a resolvê-los a partir do `AGENTS.md` ou da Wiki do workspace consumidor.
2. **Zero Segredos ou Artefatos Locais:** Proibido versionar `.env*`, tokens, chaves privadas, bancos `.db` ou caches de execução.
3. **Fronteira Estrita (SRP):** Toda skill deve explicitar o que **NÃO** faz para evitar sobreposição de responsabilidades e conflitos de ativação entre skills irmãs.
