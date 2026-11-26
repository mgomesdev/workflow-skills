---
name: a-article-reviewer
description: >-
  Átomo de análise crítica e auditoria editorial para artigos técnicos. Inspeciona o conteúdo em busca de decisões de engenharia que passaram batidas (arquitetura, observabilidade, conformidade), avalia o nível de poluição visual, sugere a adição ou remoção de imagens e artefatos reais de código, e aponta discrepâncias entre texto e diagramas.
license: MIT
compatibility: >-
  Requer acesso de leitura aos artigos em Markdown (posts/*.md), ativos do repositório e diretrizes editoriais da LLM Wiki.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: editorial
---

# Article Reviewer (Átomo de Crítica Editorial e Diagnóstico Visual)

Átomo responsável por realizar uma **auditoria crítica e analítica** em artigos técnicos antes da publicação ou durante a esteira de curadoria. Atua como um revisor técnico sênior de conteúdo, apontando com precisão o que passou batido, o equilíbrio visual e a completude da engenharia relatada.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Antes de rodar a análise, este átomo consulta as diretrizes editoriais e visuais na documentação do workspace ativo (`AGENTS.md`, `.stitch/DESIGN.md` ou páginas da LLM Wiki):
> - [`knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md`](../../../knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md): Regras de tom de voz (1ª pessoa "Eu"), substituições de linguagem natural, critérios estritos de imagens no corpo e proibição de contagens rígidas.
> - [`knowledge/wiki/concepts/identidade-visual-agentic-curator.md`](../../../knowledge/wiki/concepts/identidade-visual-agentic-curator.md): Especificação dos diagramas no formato Sketch / Blueprint Dark e paleta oficial.

---

## 🧭 Eixos de Diagnóstico

Ao analisar um artigo (`posts/*.md`), o átomo inspeciona obrigatoriamente 4 eixos:

### 1. Completude de Engenharia (O que passou batido?)
- O artigo cumpre rigorosamente a promessa do título e do `tldr`?
- Há decisões de ciclo de vida que ficaram sem explicação (ex.: telemetria, cookies, tratamento de erros, testes, deploy)?
- Itens citados em rodapés, tabelas ou listas técnicas (como frameworks, stacks ou ferramentas) foram de fato contextualizados no corpo do texto?

### 2. Densidade, Equilíbrio e Poluição Visual
- **Nível de Poluição Visual:** Há sobrecarga de blocos visuais empilhados (ex.: dois diagramas ou duas imagens consecutivas sem reflexão textual intermediária)?
- **Autenticidade de Imagens:** As imagens presentes são artefatos reais de engenharia (como Brand Boards em código, telas do sistema em `public/articles/<slug>/`, relatórios reais) ou ilustrações conceituais genéricas de IA? Se forem genéricas, ordenar remoção.
- **Sugestão de Ativos Faltantes:** Há alguma explicação de design, arquitetura ou marca que ficaria muito mais clara e autêntica se ilustrada com um print ou arquivo do repositório (ex.: `brand/`, componentes reais)?

### 3. Coerência de Contratos e Diagramas
- **Padrão Gráfico:** Todos os blocos `mermaid` adotam a diretiva de inicialização do tema e o padrão artesanal Sketch Dark (`stroke-dasharray`, classes semânticas `sketchNode`, `sketchGate`, `sketchCloud`, `sketchPostit`)?
- **Harmonia Numérica:** Há discrepâncias entre o que o texto afirma (ex.: "estruturado em 4 etapas") e a quantidade de nós ou seções reais desenhadas?

### 4. Linguagem, Abstração e Desintoxicação de IA
- Há termos corporativos da Blacklist (Seção 3.1) ou muletas sintéticas de IA remanescentes (*"ruído"*, *"síntese"*, *"incidentes severos"*)?
- Há vazamento de identificadores internos do repositório (números de cards `#138`, `PR #66`, portas `3100-3600`, siglas `SMART` soltas ou nomes de arquivos na prosa geral) que um leitor externo não entenderia?
- Há menção a alguma feature ou ideia que não existe de fato no repositório?
- O relato mantém a 1ª pessoa autoral ("Eu") e a postura de engenheiro sênior (arquiteto, revisor e aprovador)?

---

## 📋 Formato de Saída Obrigatório

A resposta do átomo deve ser direta, construtiva e estruturada exatamente nestas 3 seções:

```markdown
### 🔴 O que remover ou enxugar
- [Apontamento claro com citação do trecho ou elemento visual desnecessário/poluído]

### 🟡 O que passou batido e vale adicionar
- [Decisões de engenharia, conceitos esquecidos, privacidade ou conexões de produto]

### 🟢 Diagnóstico Visual e Sugestões de Imagens
- **Equilíbrio visual:** [Avaliação da densidade texto vs. diagramas/imagens]
- **Imagens recomendadas:** [Arquivos ou artefatos específicos do repositório recomendados para inclusão ou remoção]
- **Status dos diagramas:** [Conformidade com o padrão Sketch / Blueprint Dark]
```
