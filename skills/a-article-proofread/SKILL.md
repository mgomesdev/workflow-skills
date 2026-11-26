---
name: a-article-proofread
description: >-
  Átomo de revisão linguística, gramatical e de formatação para artigos e posts técnicos em Markdown. Corrige pontuação, concordância, ortografia e digitação preservando rigorosamente o conteúdo, estilo e tom de voz original do autor.
license: MIT
compatibility: >-
  Agnóstico de plataforma; opera sobre arquivos de conteúdo e artigos técnicos em Markdown (.md).
metadata:
  author: mgomesdev
  version: "1.0.0"
  layer: atom
  sdlc_phase: editorial
---

# Article Proofread (Átomo de Revisão Linguística e Formatação)

Átomo focado estritamente em **qualidade gramatical, correção ortográfica e consistência de formatação Markdown**, sem interferir na mensagem, na opinião ou na voz autoral do autor.

---

## 🎯 Contrato do Átomo (Single Responsibility)

* **Input Esperado:**
  * Arquivo ou trecho em Markdown (`.md`) de artigo técnico ou post para revisão linguística.
* **Escopo e Responsabilidade:**
  * Corrigir desvios de português (ortografia, concordância nominal e verbal, regência, crase e acentuação).
  * Ajustar pontuação (atenção crítica a vírgulas separando sujeito de predicado ou truncamento indevido de períodos).
  * Corrigir inconsistências pontuais de formatação Markdown (espaçamentos de listas, fechamento de tags de código, links e títulos).
  * **Regra de Ouro:** **Não reescrever trechos por preferência estilística.** Preservar a essência, termos técnicos, neologismos intencionais e a estrutura de raciocínio redigida pelo autor.
* **Fronteira Estrita (O que NÃO faz):**
  * **NÃO** altera o tom de voz autoral nem reescreve parágrafos por estilo (delegado a `a-article-voice`).
  * **NÃO** altera diagramas Mermaid nem gera imagens de capa (delegado a `a-article-diagrams` e `a-article-assets`).

---

## 🧭 Diretrizes de Execução

1. **Leitura Atenta:** Analisar o arquivo `.md` indicado procurando erros gramaticais e truncamentos.
2. **Edição Pontual e Cirúrgica:** Substituir apenas os termos ou pontuações que estejam gramaticalmente incorretos.
3. **Preservação de Terminologias:** Não traduzir termos técnicos consagrados da área de desenvolvimento (ex.: *skeleton loader*, *prompt*, *retry*, *empty state*, *Vibe Design*, etc.).
4. **Relatório Claro:** Ao concluir, listar para o autor exatamente quais linhas foram corrigidas e o motivo de cada ajuste.
