# As 29 Regras do Impatient Programming (impatientprogramming.org)
> Modernização do Extreme Programming (XP) para a era dos agentes de código (Obie Fernandez).

---

## 1. Planejamento (Planning)
1. **Regra 1 — Get your story straight (Alinhe sua história antes de começar):**
   * *Filosofia:* Antes de qualquer linha de código, o time e os agentes precisam concordar com clareza sobre qual dor está sendo resolvida e como o sucesso será medido.
   * *Storytelling:* "Começamos alinhando a intenção: clareza antes de velocidade."

2. **Regra 2 — Call your shot every week (Defina sua tacada semanal):**
   * *Filosofia:* Escolha uma entrega vertical demonstrável por semana. Use a subida do morro (*Hill Chart*) para transformar incertezas em certezas.
   * *Storytelling:* "Toda semana entregamos algo que as pessoas possam ver e tocar."

3. **Regra 3 — Every green merge is a release (Todo merge verde já é uma entrega):**
   * *Filosofia:* Sem esperar semanas por pacotes gigantes. Se passou em todos os testes e sensores, já vai para produção.
   * *Storytelling:* "Pequenos passos contínuos trazem mais segurança que grandes saltos."

4. **Regra 4 — No timeboxes. Weekly showcase (Sem caixas de tempo rígidas. Apresentação semanal):**
   * *Filosofia:* O que importa é o software funcionando na mão de quem usa, compartilhado toda semana em uma demonstração viva.
   * *Storytelling:* "Demonstramos valor real e software vivo, sem teatro de status."

5. **Regra 5 — The One Question starts each feature (A Pergunta Única que inicia tudo):**
   * *Filosofia:* *"O que ainda precisamos aprender antes de construir isso?"* Resolva o desconhecido antes de codificar.
   * *Storytelling:* "Aprender vem antes de construir; a curiosidade protege nosso tempo."

---

## 2. Gestão & Atenção (Managing)
6. **Regra 6 — Work in the open, with your agents (Trabalhe às claras, junto aos seus agentes):**
   * *Filosofia:* Mantenha o contexto, as memórias e decisões arquivadas em uma base viva e compartilhada.
   * *Storytelling:* "Nada fica perdido na cabeça de uma pessoa ou na sessão efêmera de uma máquina."

7. **Regra 7 — Set a sustainable attention budget (Orçamento sustentável de atenção humana):**
   * *Filosofia:* A atenção humana é o recurso mais escasso. Automatize burocracias e proteja seus rituais de descanso.
   * *Storytelling:* "Protegemos nossa energia mental para as decisões que realmente importam."

8. **Regra 8 — Agents brief the team every day (Agentes resumem o dia para o time):**
   * *Filosofia:* A máquina sintetiza o rastro técnico do dia anterior e conta a história da evolução para o alinhamento diário.
   * *Storytelling:* "Deixamos a telemetria com as máquinas e usamos a daily para alinhar visão e propósito."

9. **Regra 9 — Throughput measured and labeled honestly (Transparência real sobre o que é entrega):**
   * *Filosofia:* Ajustes de design ou refatorações em andamento não são bugs; são polimentos naturais da criação.
   * *Storytelling:* "Honestidade com o processo: lapidação faz parte da arte, não é defeito."

10. **Regra 10 — Move attention around (Alterne os holofotes de atenção):**
    * *Filosofia:* Não deixe partes do sistema esquecidas. Cuide da casa como um todo.
    * *Storytelling:* "Cuidado holístico: segurança, design e código limpo recebem carinho constante."

11. **Regra 11 — Fix IMP when it breaks (Ajuste o método quando a realidade mudar):**
    * *Filosofia:* O processo serve às pessoas e ao produto, nunca o contrário.
    * *Storytelling:* "Nossa forma de trabalhar é viva e evolui com os nossos aprendizados."

---

## 3. Design & Arquitetura (Designing)
12. **Regra 12 — Simplicity: breathe in, breathe out (Simplicidade: inspirar e expirar):**
    * *Filosofia:* Crie o que é necessário (inspire) e, na mesma sequência, limpe o excesso e simplifique (expire).
    * *Storytelling:* "Criar sem medo e podar com generosidade para manter o produto leve."

13. **Regra 13 — Write the Contract (Escreva o Contrato com clareza):**
    * *Filosofia:* Defina regras explícitas e limites inegociáveis para o comportamento do sistema.
    * *Storytelling:* "Acordos claros evitam surpresas no futuro."

14. **Regra 14 — Use artifacts for design sessions (Use artefatos vivos nas discussões):**
    * *Filosofia:* Converse sobre protótipos visuais, telas reais e diagramas, não sobre suposições abstratas.
    * *Storytelling:* "Uma tela viva vale mais que mil reuniões conceituais."

15. **Regra 15 — Spikes are cheap, run several in parallel (Explorações são baratas, experimente caminhos):**
    * *Filosofia:* Com agentes, explorar duas ou três ideias concorrentes leva minutos. Teste antes de escolher.
    * *Storytelling:* "Experimentamos alternativas antes de casar com uma solução."

16. **Regra 16 — Experiment on what to build. Boil the lake (Explore todos os estados e detalhes):**
    * *Filosofia:* Cuide da experiência padrão, do carregamento, do estado vazio e de quando algo falha.
    * *Storytelling:* "Cuidado minucioso em cada detalhe, do sorriso ao momento de erro."

17. **Regra 17 — Keep it regenerable (Mantenha o sistema regenerável):**
    * *Filosofia:* Quando as regras e o design são claros, qualquer parte pode ser recriada do zero com perfeição.
    * *Storytelling:* "Não temos apego ao código; temos apego à intenção e à qualidade do que entregamos."

---

## 4. Construção & Código (Coding)
18. **Regra 18 — Put solution in front of the customer (Coloque a solução diante do cliente):**
    * *Filosofia:* Protótipos reais e links navegáveis superam qualquer documento de requisitos.
    * *Storytelling:* "O melhor feedback vem de ver alguém usando de verdade."

19. **Regra 19 — Standards are enforced by machines (Regras de estilo são guardadas por robôs):**
    * *Filosofia:* Deixe a máquina checar pontuação, tipagem e estilo para que os humanos discutam valor e usabilidade.
    * *Storytelling:* "Zero discussões estéreis sobre formatação; foco total no usuário."

20. **Regra 20 — Agree on the Contract, make it executable (Faça o contrato ser testado de verdade):**
    * *Filosofia:* Toda promessa feita ao usuário deve ser acompanhada por uma verificação constante.
    * *Storytelling:* "Se prometemos um comportamento, garantimos que ele permaneça de pé."

21. **Regra 21 — All production code is pair programmed, with an Agent (Programação em par com IA):**
    * *Filosofia:* O humano atua como curador e estrategista; o agente acelera a materialização com precisão.
    * *Storytelling:* "Inteligência humana ditando o rumo e inteligência de máquina acelerando os passos."

22. **Regra 22 — Retired (Trunk-based serialization):**
    * *Filosofia:* Esteiras automáticas organizam a fila de integração com segurança.

23. **Regra 23 — Integrate continuously (Integração sem acúmulo):**
    * *Filosofia:* Junte as novidades ao produto final o tempo todo, sem deixar pilhas de trabalho esquecidas.
    * *Storytelling:* "Ritmo suave e contínuo, sem avalanches de última hora."

24. **Regra 24 — Guardrails fire on every change (Guard rails sempre ativos):**
    * *Filosofia:* Sensores de qualidade que nunca dormem e garantem que nada quebre a experiência.
    * *Storytelling:* "Um escudo de segurança invisível protegendo cada avanço."

25. **Regra 25 — Collective ownership, agents included (Cuidado compartilhado por todos):**
    * *Filosofia:* Todos têm liberdade e responsabilidade sobre todo o ecossistema.
    * *Storytelling:* "Todos cuidam do todo com carinho e zelo."

---

## 5. Confirmação & Qualidade (Testing)
26. **Regra 26 — Every test must prove it's worth keeping (Todo teste precisa provar seu valor):**
    * *Filosofia:* Elimine verificações redundantes que só servem para burocratizar o processo.
    * *Storytelling:* "Apenas verificações que realmente protegem o usuário final."

27. **Regra 27 — Green merges itself (O que está perfeito avança com naturalidade):**
    * *Filosofia:* Se os sensores de segurança estão satisfeitos e o risco é mínimo, a esteira flui sem burocracia.
    * *Storytelling:* "Fluidez para o que é simples e atenção dedicada para o que é crítico."

28. **Regra 28 — When a bug is found, the Contract was missing something (Bugs revelam lições não escritas):**
    * *Filosofia:* Cada erro é uma oportunidade de enriquecer a história e blindar o produto para sempre.
    * *Storytelling:* "Erros não geram frustração; geram aprendizado imortalizado no sistema."

29. **Regra 29 — Contract must be met and coverage published (Transparência cristalina de entrega):**
    * *Filosofia:* Visibilidade total sobre o que foi prometido e o que está funcionando.
    * *Storytelling:* "Confiança construída com transparência e resultados verificáveis."
