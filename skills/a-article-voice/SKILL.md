---
name: a-article-voice
description: >-
  Átomo de curadoria e lapidação de tom de voz autoral para artigos e publicações no LinkedIn. Consome a Linguagem Onipresente Compartilhada da LLM Wiki (diretrizes-editoriais-tom-de-voz.md), transpõe termos impessoais para a primeira pessoa autoral ('Eu'), garante títulos dinâmicos derivados do contexto do texto e estrutura o resumo executivo para o feed.
license: MIT
compatibility: >-
  Requer acesso de leitura e escrita aos artigos em Markdown (posts/*.md) e consulta às diretrizes editoriais da LLM Wiki.
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: editorial
---

# Article Voice Curator (Átomo de Tom de Voz Autoral)

Átomo responsável por aplicar a identidade editorial, a linguagem onipresente compartilhada e a arquitetura narrativa em artigos técnicos e posts para o LinkedIn.

---

## ⚡ Configuração & Resolução Agnóstica de Contexto (SSoT)

> **Resolução de Parâmetros do Workspace:** Nunca empilhe listas locais de palavras proibidas ou substituições neste arquivo. Antes de qualquer revisão ou escrita, consulte as diretrizes editoriais do workspace ativo (`AGENTS.md` ou [`knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md`](../../../knowledge/wiki/concepts/diretrizes-editoriais-tom-de-voz.md)), que centralizam:
> * **Seção 1 & 2:** Princípios de 1ª pessoa do singular (*"Eu"*), relato vivencial e exemplos de *O Que Evitar vs. O Que Fazer* (persona [`knowledge/wiki/entities/matheus-perfil.md`](../../../knowledge/wiki/entities/matheus-perfil.md)).
> * **Seção 3.1:** *Dicionário Canônico de Termos Banidos (Blacklist de Muletas)* e banimento do travessão longo (`—`).
> * **Seção 3.2:** *Dicionário de Substituição para Linguagem Natural (Linguagem Onipresente Compartilhada)* — tabela canônica que converte jargões sintéticos de IA para termos diretos de engenharia.
> * **Seção 3.3 & 3.4:** Vocabulário padronizado do autor (*Frontend Engineer*, *sensores determinísticos*, *arquiteto, revisor, aprovador e responsável pelo resultado*) e *A Regra de Ouro do Efeito Prático*.
> * **Seção 5:** *Arquitetura Editorial de Artigos Técnicos (Padrão NN/g + Frontend Engineering)*.

---

## 🧭 Protocolo de Execução nos Artigos (`posts/*.md`)

1. **Conformidade com a Linguagem Onipresente (Wiki Seção 3):**
   * Varrer o texto e os diagramas Mermaid barrando qualquer termo da **Seção 3.1 (Blacklist)** e aplicando todas as substituições naturais da **Seção 3.2** de `diretrizes-editoriais-tom-de-voz.md` (especialmente "Quality Gates" ➔ "Verificações em etapas", termos de "saúde da produção" e clichês como "degradar a arquitetura").
   * Eliminar métricas temporais arbitrárias e números inventados (ex.: "20 minutos", "~15s", "em poucos minutos", "0 MB", "60 linhas", "caíram a zero") conforme a Seção 3.3.
   * **Abstração para o Leitor Externo:** Remover da prosa números internos de cards/PRs (`#138`, `PR #66`), siglas internas sem contexto (`SMART`/`INVEST` ➔ usar *"subtarefas de uma história"*), nomes de ferramentas onde cabe o conceito (`Azure Boards` / `quadro` / `na fila` ➔ usar *"backlog"*) e detalhes mecânicos desnecessários (faixas de portas, resoluções, bots específicos ou explicações sobre cliques manuais no chat).
   * **Fidelidade Estrita ao Código Real:** Garantir que nenhuma ideia não implementada (ex.: *scores* ou automações hipotéticas) seja descrita como existente.
   * Assegurar que imagens incluídas no corpo do artigo sejam artefatos de engenharia reais (Brand Boards em código, diagramas técnicos ou capturas de componentes) e que estejam salvas em `public/articles/<slug>/`.
   * Verificar se menções a telemetria pós-deploy (GA4/Sentry) incluem o contexto de privacidade e consentimento do visitante (`CookieBanner`).
   * Manter a linguagem autoral na 1ª pessoa ("Eu" / "minha decisão") e evitar contagens fixas e rígidas de etapas na introdução ou títulos.
2. **Estrutura Narrativa NN/g & Títulos Derivados do Contexto (Wiki Seção 5):**
   * Utilizar como base o template [`../m-article-curator/references/article-template.md`](../m-article-curator/references/article-template.md).
   * **Sem Banner Repetido no Corpo:** O campo `cover` no frontmatter é exclusivo para o card na Home e Open Graph. Não inserir `![Banner...](...)` nem `## H2` repetindo o título no início do Markdown.
   * **Pirâmide Invertida:** Garantir que o 1º parágrafo da Introdução antecipe a conclusão, a decisão arquitetural e os números/resultados alcançados.
   * **Títulos `##` (H2) e `###` (H3) Baseados na Compreensão do Contexto (Não Aleatórios):**
     * Nunca usar rótulos fixos de template (`## Contexto: ...`, `## Análise: ...`, `## Implementação: ...`, `## Resultados...` ou `## Conclusão`), nem prefixos fixos nos bullets do `tldr`.
     * **Ler e compreender o contexto e o objetivo específico de cada seção do texto** e, a partir desse entendimento, formular um título `##` (seção principal) ou `###` (subseção) natural e específico que antecipe a decisão, dor ou mecanismo explicado naquele bloco para o Sumário (`ArticleToc`).
   * **Raciocínio de Engenharia Sênior:** Validar a presença da comparação de alternativas (tabela comparativa), evidências empíricas e subseção explícita de trade-offs (o que ganhou vs. o que abriu mão e quando não usar).
3. **Resumo para o Feed do LinkedIn (Wiki Seção 5.2):**
   * Estruturar a chamada social com hook de impacto, 3 pontos numerados com o efeito prático direto e CTA para o artigo completo.
