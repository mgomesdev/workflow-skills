---
name: a-brief-curator
description: >-
  Átomo de estudo técnico e pré-voo em pair programming. Mapeia e retorna de forma resumida e clicável todas as referências externas (docs oficiais com URL direta) e internas (arquivos do projeto e Living Wiki com link exato de arquivo/linha file:///...#L...) necessárias para implementar uma feature ou Task, detalhando: O que é, Para que serve, Onde será aplicado e Como validar/estudar. Permite ao desenvolvedor entender criticamente o que será feito antes de aceitar código da IA.
license: MIT
compatibility: >-
  Requer acesso de leitura à codebase local (package.json, src/, knowledge/) e opcionalmente o servidor MCP azure-devops (wit_work_item) quando acionado por ID de Work Item.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: discovery
---

# Atom: `a-brief-curator` (Tech Briefing, Reference Mapper & Pair Study Guide)

Átomo consultivo e educacional projetado para fortalecer o **pair programming humano-IA**, garantindo que o desenvolvedor **nunca aceite código cegamente**. 

Antes de iniciar ou aceitar uma implementação, este átomo analisa o escopo da task/feature, inspeciona a codebase e a Living Wiki, e entrega um **Guia de Estudo e Validação Técnica** estruturado, com **links clicáveis diretos para documentações oficiais e linhas exatas do código local**.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Este átomo é agnóstico de projeto. Obtenha `<PROJECT_NAME>` (para consultas opcionais de Work Item no MCP `azure-devops`) e `<WORKSPACE_ROOT>` a partir do diretório de trabalho ativo e das instruções em `AGENTS.md` / `CLAUDE.md`.

* **Fontes Locais:** `package.json` (versões exatas pinadas), `src/`, `knowledge/wiki/` e `node_modules/next/dist/docs/` (quando aplicável).
* **Tool MCP Opcional:** `wit_work_item` (`ServerName: "azure-devops"`, `project: "<PROJECT_NAME>"`) quando o input for um `#<TASK_ID>` ou `#<US_ID>`.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Gatilho / Quando Acionar:**
  * Ao planejar uma nova Feature ou Subtask SMART (`#<TASK_ID>`).
  * Quando o desenvolvedor pedir para *"explicar o que será usado"*, *"listar as referências"*, *"me passar o material de estudo antes de codar"* ou rodar o brief técnico de uma task.
* **Input Aceito:**
  * ID de um Work Item do Azure Boards (`#<TASK_ID>` ou `#<US_ID>`).
  * Ou descrição textual livre do escopo da feature a ser desenvolvida.
* **Output Determinístico:**
  * Relatório em Markdown contendo todas as referências externas e internas necessárias, formatadas no padrão de 4 perguntas fundamentais + links diretos e clicáveis.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** altera arquivos de código da feature nem executa commits Git.
  * **NÃO** altera o estado ou descrição de Work Items no Azure Boards.

---

## 📋 Estrutura Canônica Obrigatória do Briefing

Para cada tecnologia, biblioteca, função, utilitário, componente ou padrão envolvido, o átomo DEVE estruturar o retorno exatamente neste formato:

```markdown
### [Nome do Recurso / Biblioteca / Padrão]
* 🔗 **Referência / Documentação:** [Nome Oficial](URL_OFICIAL_EXTERNA ou file:///CAMINHO_ABSOLUTO#LXX-LYY)
* 📌 **O que é:** Definição objetiva em 1 ou 2 frases sem jargões desnecessários.
* 🎯 **Para que serve:** O problema concreto que resolve e a vantagem de usá-lo neste cenário.
* 📍 **Onde será aplicado:** Caminho do arquivo (`file:///...#LXX`) e papel específico que terá na feature.
* 🔍 **Como validar / Ponto de atenção:** O que o desenvolvedor deve inspecionar no diff do código para garantir que a IA utilizou a API correta, seguiu a arquitetura do projeto e não alucinou código ou versões depreciadas.
```

---

## 🛠️ Regras de Resolução de Links e Linhas

### 1. Referências Internas (Codebase Local e Living Wiki)
* **Formato do Link:** SEMPRE formato GitHub/Markdown com protocolo `file:///` e ancoragem de linhas (ex.: `[utils.ts#L7-L12](file:///<WORKSPACE_ROOT>/src/lib/utils.ts#L7-L12)`).
* **Inspeção Real prévia:** O agente DEVE rodar `grep`, `search_code` ou `read_file` antes de emitir a resposta para extrair o número de linha **exato e real** onde o símbolo está definido ou onde a alteração irá ocorrer.
* **Living Wiki (SSOT):** Sempre referenciar a página e a seção correspondente em `knowledge/wiki/` (ex.: diretrizes de frontend, stack técnica ou fluxo de board).

### 2. Referências Externas (Bibliotecas, Frameworks e RFCs)
* **Documentação Version-Matched:** Fornecer o link HTTP(S) direto para a página exata da documentação oficial (não apenas a home da lib).
* **Next.js 16+ Local Docs:** Quando se tratar de APIs internas ou novidades do Next.js instaladas no projeto, referenciar tanto o link oficial quanto o arquivo local em `node_modules/next/dist/docs/` (ex.: `[docs locais](file:///<WORKSPACE_ROOT>/node_modules/next/dist/docs/...)`).
* **Pinning de Versão:** Confirmar no `package.json` a versão exata pinada da dependência para fornecer a documentação correspondente à versão do projeto (evitando guias de versões legadas ou futuras incompatíveis).

---

## ⚙️ Protocolo de Execução Passo a Passo

1. **Leitura e Delimitação do Escopo:**
   * Se fornecido um Work Item `#<TASK_ID>`, consultar os detalhes do card no Azure DevOps via MCP (`wit_work_item`).
   * Se fornecido texto livre, extrair os componentes, regras de negócio e integrações necessárias.

2. **Mapeamento e Varredura da Codebase (Grep / Read):**
   * Buscar componentes correlatos em `src/components/`, rotas em `src/app/`, hooks, stores e utilitários em `src/lib/`.
   * Identificar as linhas exatas onde a nova implementação será conectada ou quais funções existentes serão reutilizadas.

3. **Mapeamento de Dependências e APIs:**
   * Conferir dependências em `package.json`.
   * Mapear APIs nativas ou de libs de terceiros necessárias (ex.: React Hooks, Next.js APIs, Lucide Icons, Shadcn UI, Zod, etc.).

4. **Síntese e Apresentação do Guia:**
   * Gerar o relatório formatado dividindo em:
     * **🌐 Referências Externas (Docs Oficiais, APIs & Bibliotecas)**
     * **🏛️ Referências Internas (Arquivos do Projeto, Utilitários & Living Wiki)**
     * **💡 Perguntas Críticas para o Desenvolvedor Fazer à IA** (provocações técnicas para estimular a validação crítica do código durante o pair programming).
