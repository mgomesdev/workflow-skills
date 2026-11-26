# format-card-m1 (Estrutura Universal INVEST — Bill Wake)

## Input esperado
Output estruturado do `refiner-po-idea`:
- Headline (Role + Ação + Contexto)
- [V] Valuable: Por quê, personas, valor de negócio, observabilidade (métricas)
- [I] Independent: Dependências e autonomia de entrega
- [N] Negotiable: Figma/Protótipo vivo, perguntas abertas, ambiguidades com dono
- [E] Estimable: Regras firmes que delimitam escopo para viabilizar estimativa
- [S] Small: Esqueleto (MVP vertical) vs. intensificações futuras
- [T] Testable: Cenários de confirmação (Dado/Quando/Então)

## Output gerado

```markdown
══════════════════════════════════════════════════════════════════════════
[HEADLINE]: [Role/Persona] [Ação] [Contexto]
Ex: [Perfil de Usuário] [executa ação de valor] para [resolver dor / atingir objetivo]
══════════════════════════════════════════════════════════════════════════

[V] VALIOSO (Valuable)
--------------------------------------------------------------------------
• Por quê:
  [Dor real que resolve · Para quem · Consequência negativa se não resolver]
• Dores por Persona / Stakeholder:
  - [Persona 1]: [Dor específica enfrentada]
  - [Persona 2]: [Dor específica enfrentada]
• Classificação de Valor:
  [ ] Receita  [ ] Custo  [ ] Serviço  [ ] Regulação  [ ] Reputação  [ ] Opção  [ ] Informação
• Observabilidade & Sinais de Sucesso (Outcome):
  - Adoção: [Volume de uso / novos usuários interagindo com a feature]
  - Engajamento: [Frequência / profundidade de uso / tempo na tarefa]
  - Sucesso de Conversão: [Taxa de conclusão da ação de valor / eventos disparados]
  - Performance / Confiabilidade: [Métricas de estabilidade e tempo de resposta]

[I] INDEPENDENTE (Independent)
--------------------------------------------------------------------------
• Dependências & Acoplamento:
  - Design/UX: [Dependência de protótipo/telas — Bloqueante ou Contornável]
  - Backend/Infra: [Dependência de serviços/APIs externas — Bloqueante ou Contornável]
• Autonomia de Entrega:
  [Declaração de como esta história entrega uma fatia vertical completa de forma desacoplada]

[N] NEGOCIÁVEL (Negotiable)
--------------------------------------------------------------------------
• Protótipo & Experiência:
  → Protótipo de referência: [Link do Figma/Wireframe] (Layout maleável a trade-offs de engenharia)
• Em Aberto (Para discussão no Refinamento):
  - UX/UI: [Questões de interação, hierarquia e componentes visuais]
  - Frontend: [Viabilidade técnica, estados de tela e animações]
  - Backend/Engenharia: [Contratos de dados, schemas e viabilidade técnica]
  - PO: [Trade-offs de negócio, limites e regras de exceção]
• Ambiguidades com Dono:
  A1 — [Descrição da incerteza] — para: [Papel responsável por decidir]
  A2 — [Descrição da incerteza] — para: [Papel responsável por decidir]

[E] ESTIMÁVEL (Estimable)
--------------------------------------------------------------------------
• Regras Firmes (O que delimita o escopo e viabiliza a estimativa técnica sem adivinhação):
  - [Regra inegociável 1]
  - [Regra inegociável 2]
  - [Restrição mandatória de negócio, técnica ou de segurança]

[S] SMALL / PEQUENO (Small)
--------------------------------------------------------------------------
• Esqueleto (MVP - Menor entrega com valor real vertical):
  - [Entrega essencial de interface navegável]
  - [Entrega essencial de lógica e dados funcionais]
  - [Telemetria básica de observabilidade]
• Próximas Intensificações (Fora desta iteração):
  - [Funcionalidade avançada / automação / sofisticação 1]
  - [Funcionalidade avançada / automação / sofisticação 2]

[T] TESTÁVEL (Testable)
--------------------------------------------------------------------------
• Cenários de Confirmação:
  1. Dado que [contexto inicial], quando [ação principal do usuário], então [resultado observável esperado].
  2. Dado que [contexto de exceção ou erro], quando [ação], então [comportamento esperado do sistema].
  3. Dado que [contexto alternativo], quando [ação], então [resultado verificável].
══════════════════════════════════════════════════════════════════════════
```

## Regras de aplicação
- Os blocos [V], [I], [N], [E], [S], [T] são canônicos e obrigatórios.
- Seção [V] sempre contém o bloco de Observabilidade pós-lançamento.
- Seção [N] garante que o protótipo permaneça vivo e aberto à conversa técnica.
- Seção [S] delimita a fronteira entre o Esqueleto da iteração atual e os próximos ciclos.
