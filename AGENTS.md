# Instruções Gerais do Agente (`mgomesdev/workflow-skills` — SSOT & Governança)

Este repositório é a **Fonte Única da Verdade (SSoT)** e o produtor público das **35 Agent Skills** (`25 átomos a-*` e `10 moléculas m-*`) distribuídas no padrão **`agentskills.io`**, **`agent-plugins.org`** e **`npx skills add mgomesdev/workflow-skills`**.

---

## 🏛️ 1. Princípio Mandatório de Consulta à LLM Wiki (`knowledge/`)

Antes de criar, refatorar, auditar ou publicar qualquer skill neste repositório, o agente DEVE consultar a LLM Wiki em `knowledge/`:

1. **Governança & Manual da IA:** Consulte [`knowledge/SCHEMA.md`](./knowledge/SCHEMA.md) e roteie sua leitura pelo catálogo [`knowledge/index.md`](./knowledge/index.md).
2. **Arquitetura de Skills & Segurança Pública:** Consulte [`knowledge/wiki/engineering/arquitetura-skills-atomicas.md`](./knowledge/wiki/engineering/arquitetura-skills-atomicas.md).
   - **Taxonomia:** Átomos (`a-*`) têm responsabilidade única (SRP) e declaram fronteira estrita do que NÃO fazem; Moléculas (`m-*`) orquestram 2+ átomos e declaram dependências em `metadata.uses`.
   - **Frontmatter Estrito (`agentskills.io` / `skills-ref`):** Apenas `name`, `description`, `license`, `compatibility`, `metadata` (mapa string-para-string) e `allowed-tools` são permitidos na raiz do YAML.
   - **Zero Hardcoding & Segurança Pública:** Este repositório é **público**. É estritamente proibido commitar identificadores de projetos privados, GUIDs reais, e-mails pessoais, tokens ou arquivos `.env*`.
3. **Evals & Publicação:** Consulte [`knowledge/wiki/engineering/governanca-evals-e-publicacao.md`](./knowledge/wiki/engineering/governanca-evals-e-publicacao.md).
   - Toda skill em `skills/<name>/` DEVE conter `evals/evals.json` com mínimo de 2 cenários (`expectations`) e `trigger_tests` (`should_trigger` e `should_not_trigger`).
   - Ao gerar diagramas/banners PNG para o `README.md` via Design-as-Code, inspecionar visualmente o PNG (`read_file`) antes de commitar. Quando o curador pedir revisão incremental ("uma por uma"), alterar estritamente 1 skill por ciclo.
4. **Regra de Dependências Pinadas:** No `package.json`, todas as dependências devem utilizar versões exatas e pinadas (proibido `^` ou `~`).

---

## ⚙️ 2. Quality Gate Obrigatório (Antes de Qualquer Commit / Push)

Toda alteração em `skills/`, `scripts/` ou `knowledge/` deve passar 100% nos sensores determinísticos e probabilísticos:

```bash
pnpm run quality-gate
```

Comandos individuais disponíveis:
- `pnpm run lint:wiki` — Valida frontmatter YAML (Zod), links internos e páginas órfãs em `knowledge/`.
- `pnpm run validate:skills:deterministic` — Valida conformidade `agentskills.io` (`skills-ref`), dependências `metadata.uses` e schema Zod de `evals/evals.json`.
- `pnpm run validate:skills:probabilistic` — Executa a suíte de `expectations` e `trigger_tests` das skills.
- `pnpm run test:unit` — Executa os testes unitários dos validadores com Vitest.

---

## 🚫 3. Proibição de Fragmentação em `/rules`

Não crie arquivos de regras soltos fora de `knowledge/`. Qualquer nova diretriz, decisão arquitetural ou aprendizado deve ser sintetizado em `knowledge/wiki/`, catalogado em `knowledge/index.md` e registrado no topo de `knowledge/log.md`.
