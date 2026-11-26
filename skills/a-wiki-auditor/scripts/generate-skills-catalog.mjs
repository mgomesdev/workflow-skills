#!/usr/bin/env node

/**
 * generate-skills-catalog.mjs
 * 
 * Gerador Determinístico do Catálogo de Skills da LLM Wiki (knowledge/wiki/engineering/catalogo-skills.md).
 * Varre todos os diretórios de .agents/skills/, extrai frontmatter canônico (layer, sdlc_phase, uses, source)
 * e compila o catálogo oficial estruturado por camadas (Atoms, Molecules, Workflows e Externals).
 * 
 * Regra: Este arquivo gera a página com o marcador de geração automatizada.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SKILLS_DIR = path.resolve(".agents/skills");
const OUTPUT_FILE = path.resolve("knowledge/wiki/engineering/catalogo-skills.md");

const SDLC_PHASE_LABELS = {
  discovery: "Discovery & Ideation",
  refinement: "Refinement & Spec",
  planning: "Planning & Architecture",
  design: "UX & Design System",
  development: "Development & Coding",
  review: "Code Review & PR",
  release: "Release & Deployment",
  editorial: "Editorial & Content",
};

export function collectSkills() {
  const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort();

  const skills = [];

  for (const dirName of dirs) {
    const skillPath = path.join(SKILLS_DIR, dirName, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      continue;
    }

    const fileContent = fs.readFileSync(skillPath, "utf-8");
    const parsed = matter(fileContent);
    const data = parsed.data || {};
    const meta = data.metadata && typeof data.metadata === "object" ? data.metadata : {};

    const rawUses = meta.uses ?? data.uses;
    const uses = Array.isArray(rawUses)
      ? rawUses
      : typeof rawUses === "string" && rawUses.trim().length > 0
        ? rawUses.split(",").map((u) => u.trim()).filter(Boolean)
        : [];

    skills.push({
      id: dirName,
      name: data.name || dirName,
      layer: meta.layer || data.layer || "unclassified",
      sdlc_phase: meta.sdlc_phase || data.sdlc_phase || "general",
      source: meta.source || data.source || null,
      uses,
      description: (data.description || "").replace(/\n+/g, " ").trim(),
      relativePath: `.agents/skills/${dirName}/SKILL.md`,
    });
  }

  return skills;
}

export function generateCatalogMarkdown(skills) {
  const atoms = skills.filter((s) => s.layer === "atom");
  const molecules = skills.filter((s) => s.layer === "molecule");
  const workflows = skills.filter((s) => s.layer === "workflow");
  const externals = skills.filter((s) => s.layer === "external");
  const unclassified = skills.filter((s) => !["atom", "molecule", "workflow", "external"].includes(s.layer));

  // Cálculo de cobertura e órfãs
  const total = skills.length;
  const classified = total - unclassified.length;
  const coveragePercent = total > 0 ? ((classified / total) * 100).toFixed(1) : "0.0";

  // Identificar órfãs: átomos autorais que não são consumidos por nenhuma molécula ou workflow
  const allUsed = new Set();
  for (const m of [...molecules, ...workflows]) {
    for (const u of m.uses) {
      allUsed.add(u);
    }
  }

  // Átomos que são standalone/invocados sob demanda ou parte de moléculas
  const standaloneAtoms = atoms.filter((a) => !allUsed.has(a.id));

  const formatUses = (uses) => {
    if (!uses || uses.length === 0) return "—";
    return uses.map((u) => `\`${u}\``).join("<br>");
  };

  const formatPhase = (phase) => SDLC_PHASE_LABELS[phase] || phase;

  const content = `---
id: engineering-catalogo-skills
title: "Catálogo Vivo de Agent Skills (Átomos, Moléculas e Workflows)"
category: "engineering"
type: "Systemic Skill Catalog & SSoT"
status: "Approved"
sources: ["raw/2026-10-14-operacao-invest-smart-agil", "raw/2026-10-19-arquitetura-prototipacao-google-stitch-code-wiki"]
last_updated: "2026-11-06"
summary: "Catálogo funcional da Living Wiki mapeando 100% das Agent Skills (.agents/skills/) em 3 camadas de abstração (Átomos, Moléculas, Workflows) e Skills Externas, com rastreabilidade de dependências e cobertura do SDLC."
tags: [engineering, agent-skills, catalog, atomic-architecture, workflows, automation, karpathy-wiki]
---

# Catálogo Vivo de Agent Skills (.agents/skills/)

<!-- AUTO-GENERATED-FILE: NÃO EDITE MANUALMENTE. Gerado via 'pnpm run catalog:skills' -->

> **Fonte Única da Verdade para Agentes & Desenvolvedor:** Este catálogo persiste a visão sistêmica e a taxonomia oficial de todas as capacidades de automação disponíveis no repositório. Elimina a necessidade de memorização cognitiva e orienta o roteamento cirúrgico de tarefas ao longo de todo o **SDLC (AI-DLC)**.

---

## 📊 Painel de Observabilidade do Catálogo

| Métrica | Valor | Meta | Status |
| :--- | :---: | :---: | :---: |
| **Total de Skills Catalogadas** | **${total}** | 100% dos diretórios | ✅ Completo |
| **Cobertura de Classificação** | **${coveragePercent}%** | 100% | ${coveragePercent === "100.0" ? "✅ Nominal" : "⚠️ Incompleto"} |
| **Átomos Especializados (\`a-*\`)** | **${atoms.length}** | — | ⚛️ Ativos |
| **Moléculas de Orquestração (\`m-*\`)** | **${molecules.length}** | — | 🧬 Compostas |
| **Workflows de Etapa SDLC** | **${workflows.length}** | — | 🌐 Operacionais |
| **Skills Externas / Vendors** | **${externals.length}** | — | 📦 Integradas |

---

## 🏛️ 1. Taxonomia Oficial em Camadas

\`\`\`
1. ÁTOMOS (a-*)       ➔ Operação unitária, responsabilidade única, não encadeia outra skill.
2. MOLÉCULAS (m-*)   ➔ Orquestração composta de 2+ átomos em sequência determinística.
3. WORKFLOWS           ➔ Integração de moléculas e átomos para resolver de ponta a ponta uma etapa independente do SDLC.
4. EXTERNAS            ➔ Capacidades de terceiros (Google Stitch, Vercel, Shadcn, Remotion), imutáveis no corpo.
\`\`\`

---

## 🧬 2. Moléculas de Orquestração Composta (\`m-*\`)

Moléculas encadeiam átomos especializados de forma determinística para viabilizar fluxos coesos sem duplicar lógica operacional.

| Molécula | Fase SDLC | Átomos Compostos (\`uses\`) | Descrição e Escopo |
| :--- | :--- | :--- | :--- |
${molecules.map((m) => `| [\`${m.name}\`](../../../${m.relativePath}) | \`${formatPhase(m.sdlc_phase)}\` | ${formatUses(m.uses)} | ${m.description} |`).join("\n")}

---

## ⚛️ 3. Átomos Operacionais Homologados (\`a-*\`)

Unidades fundamentais de automação. Cada átomo executa estritamente uma única operação com entrada e saída bem delimitadas.

| Átomo | Fase SDLC | Chamadas / MCP | Descrição |
| :--- | :--- | :--- | :--- |
${atoms.map((a) => `| [\`${a.name}\`](../../../${a.relativePath}) | \`${formatPhase(a.sdlc_phase)}\` | ${a.uses && a.uses.length > 0 ? formatUses(a.uses) : "Unitário"} | ${a.description} |`).join("\n")}

---

## 🌐 4. Workflows e Orquestradores End-to-End

${workflows.length > 0 ? `
| Workflow | Fase SDLC | Dependências | Descrição |
| :--- | :--- | :--- | :--- |
${workflows.map((w) => `| [\`${w.name}\`](../../../${w.relativePath}) | \`${formatPhase(w.sdlc_phase)}\` | ${formatUses(w.uses)} | ${w.description} |`).join("\n")}
` : `*Nenhum workflow macro consolidado ainda. Os fluxos de ponta a ponta são operados pela composição das moléculas acima.*`}

---

## 📦 5. Skills Externas Homologadas (Vendors & Frameworks)

Ferramentas importadas de terceiros mantidas como ativos do workspace, com frontmatter padronizado sem alteração no corpo original.

| Skill Externa | Origem (\`source\`) | Fase SDLC | Descrição |
| :--- | :---: | :--- | :--- |
${externals.map((e) => `| [\`${e.name}\`](../../../${e.relativePath}) | \`${e.source || "vendor"}\` | \`${formatPhase(e.sdlc_phase)}\` | ${e.description} |`).join("\n")}

---

## 🔄 6. Ciclo de Governança do Catálogo

1. **Adição de Nova Skill:** Toda nova skill criada em \`.agents/skills/\` deve declarar obrigatoriamente \`layer\`, \`sdlc_phase\` e \`uses\` (se molécula).
2. **Regeneração Determinística:** Execute \`pnpm run catalog:skills\` para recalcular e atualizar esta página.
3. **Auditoria no Quality Gate:** O script \`pnpm run lint:wiki\` valida continuamente a existência de todas as skills e a paridade deste catálogo.
`;

  return { content, total, classified, unclassified, atoms, molecules, workflows, externals, standaloneAtoms };
}

// Execução direta via CLI
if (process.argv[1] && process.argv[1].endsWith("generate-skills-catalog.mjs")) {
  console.log("🔍 Varrendo .agents/skills/ e compilando Catálogo Vivo...");
  const skills = collectSkills();
  const { content, total, atoms, molecules, workflows, externals, unclassified } = generateCatalogMarkdown(skills);

  if (unclassified.length > 0) {
    console.warn(`⚠️ Aviso: ${unclassified.length} skill(s) sem classificação 'layer':`, unclassified.map((u) => u.id));
  }

  fs.writeFileSync(OUTPUT_FILE, content, "utf-8");
  console.log(`✅ Catálogo gerado com sucesso em: ${OUTPUT_FILE}`);
  console.log(`📊 Total: ${total} skills (${atoms.length} átomos, ${molecules.length} moléculas, ${workflows.length} workflows, ${externals.length} externas)`);
}
