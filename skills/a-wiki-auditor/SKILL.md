---
name: a-wiki-auditor
description: >-
  Auditor de integridade, qualidade estrutural e governança da LLM Wiki (knowledge/) segundo o padrão Andrej Karpathy e SCHEMA.md. Executa varreduras estruturais determinísticas (links órfãos, links quebrados, YAML frontmatter) via script local e conduz auditorias semânticas (contradições, afirmações desatualizadas, lacunas conceituais e sugestão de fontes). Também opera consultas de baixo token via index.md e ingestão na Wiki do Azure DevOps.
license: MIT
compatibility: >-
  Requer Node.js (gray-matter e zod) para lint estrutural local e opcionalmente o servidor MCP azure-devops (wiki e wiki_upsert_page) para sincronização remota.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: planning
---
# Wiki Integrity Auditor & Maintainer (LLM Wiki - Karpathy Pattern)

Skill responsável pela governança, integridade contínua, consulta cirúrgica e auditoria da **LLM Wiki** (`knowledge/`). Atua como o **Gerente de Conteúdo** da base de conhecimento.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Extraia `<PROJECT_NAME>` e `<WIKI_IDENTIFIER>` a partir das instruções do workspace ativo (`AGENTS.md`, `CLAUDE.md` ou Wiki SSoT como `knowledge/wiki/engineering/arquitetura-skills-atomicas.md`).

* **MCP Server:** `azure-devops`
* **Parâmetros:** `<PROJECT_NAME>` e `<WIKI_IDENTIFIER>` (resolvidos a partir do `AGENTS.md` / SSoT do workspace).
* **Branch:** `main`
* **Caminho Raiz (MCP vs Local):** A pasta `knowledge/` do repositório é mapeada como raiz `/` no MCP (ex: MCP `path="/index"`, `path="/SCHEMA"`, `path="/wiki/..."` | Local no Git: `knowledge/index.md`, `knowledge/SCHEMA.md`, `knowledge/wiki/...`).
* **Ferramenta de Leitura (MCP):** `call_mcp_tool(ServerName="azure-devops", ToolName="wiki", Arguments={"action": "...", "project": "<PROJECT_NAME>", "wikiIdentifier": "<WIKI_IDENTIFIER>", ...})`
* **Ferramenta de Escrita (MCP / Git Local):** `call_mcp_tool(ServerName="azure-devops", ToolName="wiki_upsert_page", Arguments={"project": "<PROJECT_NAME>", "wikiIdentifier": "<WIKI_IDENTIFIER>", "branch": "main", "path": "...", "content": "..."})` (ou edição direta em `knowledge/...` durante branches de desenvolvimento).

---

## 🏛️ 1. Princípios de Governança (`knowledge/SCHEMA.md`)
A Wiki segue estritamente a arquitetura de **3 camadas de Andrej Karpathy**:
```
/knowledge
├── SCHEMA            ➜ Diretrizes e governança da IA (Contrato Mestre)
├── index             ➜ Catálogo semântico (1 linha de resumo por página)
├── log               ➜ Log cronológico append-only das operações
│
├── raw/              ➜ [CAMADA 1: FONTES BRUTAS - IMUTÁVEIS]
│   └── YYYY-MM-DD-*  ➜ Transcrições literais, post-its, boards e notas originais. Apenas leitura.
│
└── wiki/             ➜ [CAMADA 2: LIVING WIKI - GERIDA PELA IA]
    ├── entities/     ➜ Perfis atômicos (matheus-perfil, carlos-lider-tecnico, mariana-recrutadora).
    ├── concepts/     ➜ Metas, métricas e governança (objetivos-de-ux, metricas-iniciais-heart, matriz-poder-interesse).
    ├── syntheses/    ➜ Hipóteses, decisões e matrizes (hipoteses-de-ux, matriz-csd, analise-moscow).
    ├── engineering/  ➜ Processos ágeis e código (fluxo-do-board, stack-tecnica, arquitetura-skills-atomicas).
    ├── methods/      ➜ Metodologias UX NN/g (discover-methods, explore-methods, test-methods, listen-methods).
    └── releases/     ➜ Histórico de releases em produção vinculadas a US e git tags.
```

### Contrato Obrigatório de YAML Frontmatter (`wiki/**`)
Toda página sob `wiki/` DEVE conter o frontmatter canônico:
```yaml
---
id: slug-identificador-unico
title: "Título Descritivo da Página"
category: "entity | concept | synthesis | engineering | method | release | catalog"
status: "Draft | Reviewed | Approved"
last_updated: "YYYY-MM-DD"
sources: ["raw/YYYY-MM-DD-nome-da-fonte"]
summary: "Resumo executivo rigoroso de 1 a 2 linhas para o index."
tags: [tag1, tag2]
---
```

---

## 🔍 2. Protocolos de Auditoria e Integridade

### A. Varredura Estrutural Determinística (Fast Lint)
Executada localmente em segundos sem consumo excessivo de tokens:
```bash
pnpm run lint:wiki
# ou: node .agents/skills/a-wiki-auditor/scripts/lint.mjs
```
**O que o script verifica:**
1. **Frontmatter:** Valida se todas as páginas em `knowledge/wiki/**/*.md` e arquivos raiz possuem os campos obrigatórios válidos.
2. **Páginas Órfãs:** Localiza arquivos existentes em `wiki/` que não foram catalogados em `knowledge/index.md`.
3. **Links Quebrados:** Analisa os links Markdown relativos (`./...` ou `../...`) e assegura que todos os arquivos de destino existem no disco.
4. **Log de Governança:** Verifica a formatação do `knowledge/log.md`.

---

### B. Auditoria Semântica Contínua (Content Manager Loop)
Acionada periodicamente (via agendador `/schedule`, automação ou solicitação explícita):
1. **Contradições:** Identificar se novas fontes brutas em `raw/` ou novos códigos criaram divergências conceituais com decisões antigas em `wiki/syntheses/` ou `wiki/engineering/`.
2. **Afirmações Desatualizadas:** Localizar dados, versões de dependências ou parâmetros que foram superados e necessitam de atualização na Living Wiki.
3. **Conceitos Faltantes:** Rastrear termos técnicos, entidades ou regras citadas reiteradamente no código ou nos textos que ainda não possuem página dedicada.
4. **Sugestão de Pesquisa & Enriquecimento:** Apontar novas perguntas a serem investigadas ou fontes externas para enriquecer o acervo.
5. **Registro de Passagem no Log:** Ao concluir uma auditoria, prepender entrada em `knowledge/log.md` no padrão:
   ```markdown
   ## [YYYY-MM-DD] lint | Auditoria de Integridade da Wiki
   - Passagem estrutural: 100% aprovada via pnpm run lint:wiki.
   - Auditoria semântica: [resumo das melhorias ou apontamentos].
   ```

---

## ⚡ 3. Protocolo de Consulta Cirúrgica (Low Token Query)
Ao buscar respostas na Wiki:
1. Ler primeiramente `knowledge/index.md` para identificar o slug exato.
2. Carregar **somente** o arquivo alvo em `knowledge/wiki/...`.
3. Nunca ler diretórios inteiros desnecessariamente.
