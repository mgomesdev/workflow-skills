# format-card-m2 (Card Refinado Universal INVEST — Bill Wake)

## Input esperado
- Card M1 existente
- Decisões consolidadas no refinamento com o time multidisciplinar:
  - [V] Métricas de observabilidade e eventos de telemetria definidos
  - [I] Alinhamento de dependências e estratégia de release
  - [N] Ambiguidades resolvidas com dono e decisões de UX/UI (desktop, mobile, 4 estados)
  - [E] Contrato de dados/API, regras firmes atualizadas e riscos técnicos mapeados
  - [S] Intensidade acordada por todos (escopo do esqueleto confirmado)
  - [T] Critérios de Aceitação BDD co-escritos com mensagem exata e comportamento visual

## Output gerado

```markdown
══════════════════════════════════════════════════════════════════════════
[HEADLINE] — REFINADO em [Data]
Participantes: [PO · UX/UI · Frontend · Backend / Especialistas]
Status: Pronto para Planning · Todas as ambiguidades resolvidas
══════════════════════════════════════════════════════════════════════════

[V] VALIOSO (Valuable & Observability)
--------------------------------------------------------------------------
• Confirmação de Valor: [Impacto de negócio validado pelo time]
• Observabilidade & Eventos de Telemetria:
  - [Métrica / Sinal de Sucesso]: [Comportamento esperado pós-lançamento]
  - Evento de produto 1: `event: "[nome_do_evento]"` (disparado ao [ação/sucesso])
  - Evento de produto 2: `event: "[nome_do_evento]"` (disparado ao [ação/sucesso])

[I] INDEPENDENTE (Independent & Release Strategy)
--------------------------------------------------------------------------
• Dependências Mapeadas: [Status das dependências e mitigações acordadas]
• Estratégia de Deploy: [Deploy independente, feature flag, chaveamento ou preview]

[N] NEGOCIÁVEL — RESOLVIDO NO REFINAMENTO (Negotiable Closed)
--------------------------------------------------------------------------
• Ambiguidades Resolvidas:
  A1 "[Descrição original]" → [Decisão tomada · Quem decidiu · Por quê]
  A2 "[Descrição original]" → [Decisão tomada · Quem decidiu · Por quê]

• Decisões de Experiência & Design System:
  - Layout Desktop: [Estrutura dos blocos, grid e hierarquia]
  - Layout Mobile: [Comportamento responsivo / empilhamento / navegação]
  - Mapeamento dos 4 Estados:
    · Loading: [Skeleton loader / indicador visual de carregamento]
    · Erro: [Feedback visual em linha / mensagem de erro / ação de retry]
    · Vazio: [Placeholder visual com orientação ao usuário]
    · Sucesso / Default: [Aparência estável do componente]
  - Acessibilidade & Contraste: [Diretrizes de contraste, suporte a temas e foco]
• Protótipo / Telas:
  → [Link atualizado] — Ajustes que UX/UI fará antes do início da implementação

[E] ESTIMÁVEL — ESPECIFICAÇÃO TÉCNICA (Estimable Specifications)
--------------------------------------------------------------------------
• Regras Firmes Consolidadas:
  [Regras originais do M1 mantidas]
  + NOVO (Refinamento): [Novas regras acordadas pelo time na sessão]

• Contratos de Dados & Interfaces:
  - Schemas / Contratos (Tipagem / Validação):
    `[Definição estruturada de payloads de entrada/saída]`
  - Endpoints / Serviços:
    `[Método, rota, status codes e payloads esperados]`

• Decisões Arquiteturais & Riscos:
  - Decisões: [Modelagem, concorrência, persistência, caching]
  - Riscos Sinalizados: [Risco técnico identificado com plano de mitigação acordado]

[S] SMALL / PEQUENO — INTENSIDADE ACORDADA (Small Agreement)
--------------------------------------------------------------------------
• Escopo Desta Iteração (Esqueleto / Fatia Mínima):
  [Lista exata dos itens que entram nesta entrega — acordado por devs e PO]
• Fora Desta Iteração (Próximas Intensificações):
  [Lista explícita do que fica para iterações futuras]

[T] TESTÁVEL — CRITÉRIOS DE ACEITAÇÃO (Testable CAs)
--------------------------------------------------------------------------
CA1 — [Título do Cenário]
Dado [contexto inicial],
quando [ação do usuário ou sistema],
então [resultado observável]
→ Mensagem: "[texto exato exibido ao usuário]"
→ Visual: [estado visual do componente na tela]
→ Telemetria: `event: "[nome_do_evento]"` (se aplicável)

CA2 — [Título do Cenário]
Dado [contexto],
quando [ação],
então [resultado]
→ Mensagem: "[texto exato]"
→ Visual: [comportamento na tela]
══════════════════════════════════════════════════════════════════════════
```

## Regras de aplicação
- Substitui a Descrição do Work Item / Issue no sistema de gestão ágil.
- O bloco [T] deve ser copiado integralmente no campo de Critérios de Aceitação.
- Todo CA deve possuir Mensagem Exata e Comportamento Visual delimitados.
