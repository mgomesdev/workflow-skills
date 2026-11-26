#!/usr/bin/env node

/**
 * Deterministic Lint for Personal Branding LLM Wiki (knowledge/)
 * Powered by gray-matter and zod.
 *
 * Validates:
 * 1. YAML frontmatter schema completeness and types in living wiki pages
 * 2. Unbroken relative and root-relative markdown links
 * 3. Orphan pages (wiki pages missing from index.md)
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { z } from "zod";

const REPO_ROOT = process.cwd();
const KNOWLEDGE_DIR = path.join(REPO_ROOT, "knowledge");
const WIKI_DIR = path.join(KNOWLEDGE_DIR, "wiki");
const INDEX_FILE = path.join(KNOWLEDGE_DIR, "index.md");
const LOG_FILE = path.join(KNOWLEDGE_DIR, "log.md");
const SCHEMA_FILE = path.join(KNOWLEDGE_DIR, "SCHEMA.md");

const WikiFrontmatterSchema = z.object({
  id: z.string().min(1, "O campo 'id' deve ser uma string não vazia"),
  title: z.string().min(1, "O campo 'title' deve ser uma string não vazia"),
  category: z.enum(
    [
      "governance",
      "catalog",
      "concept",
      "engineering",
      "entity",
      "method",
      "releases",
      "synthesis",
      "wiki",
      "raw",
    ],
    {
      errorMap: () => ({
        message:
          "Categoria inválida. Categorias permitidas: governance, catalog, concept, engineering, entity, method, releases, synthesis, wiki, raw",
      }),
    }
  ),
  status: z.enum(["Draft", "Reviewed", "Approved", "Active", "Immutable"], {
    errorMap: () => ({
      message:
        "Status inválido. Status permitidos: Draft, Reviewed, Approved, Active, Immutable",
    }),
  }),
  last_updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "O campo 'last_updated' deve seguir o formato YYYY-MM-DD",
  }),
  summary: z
    .string()
    .min(1, "O campo 'summary' deve conter um resumo executivo de 1 a 2 linhas"),
  tags: z
    .array(z.string())
    .min(1, "O campo 'tags' deve ser um array com pelo menos uma tag"),
});

const errors = [];
const warnings = [];

function collectMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function normalizeDecodedPath(targetPath) {
  try {
    return decodeURIComponent(targetPath);
  } catch {
    return targetPath;
  }
}

function resolveCandidatePath(baseDir, target) {
  const candidates = [];

  // Standard relative resolution
  const p1 = path.resolve(baseDir, target);
  candidates.push(p1);
  if (!p1.endsWith(".md")) candidates.push(`${p1}.md`);

  // Subpage in category folder:
  const baseName = path.basename(baseDir);
  const pSub = path.resolve(baseDir, baseName, target);
  candidates.push(pSub);
  if (!pSub.endsWith(".md")) candidates.push(`${pSub}.md`);

  // Sibling category subfolder:
  const pSubFolder = path.join(baseDir, target.replace(/^\.\//, ""));
  candidates.push(pSubFolder);
  if (!pSubFolder.endsWith(".md")) candidates.push(`${pSubFolder}.md`);

  // Check URL-encoded %2D replacements
  const encodedCandidates = [];
  for (const cand of candidates) {
    const dir = path.dirname(cand);
    const base = path.basename(cand);
    const encBase = base.replace(/-/g, "%2D");
    encodedCandidates.push(path.join(dir, encBase));
  }

  const allCandidates = [...candidates, ...encodedCandidates];
  for (const c of allCandidates) {
    if (fs.existsSync(c)) return true;
  }
  return false;
}

function checkLinks(filePath, content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const rawTarget = match[2].trim();

    if (
      rawTarget.startsWith("#") ||
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:")
    ) {
      continue;
    }

    const [pathPart] = rawTarget.split("#");
    if (!pathPart) continue;

    const decodedTarget = normalizeDecodedPath(pathPart);
    const dir = path.dirname(filePath);

    const exists =
      resolveCandidatePath(dir, decodedTarget) ||
      resolveCandidatePath(
        path.join(dir, path.basename(filePath, ".md")),
        decodedTarget
      ) ||
      resolveCandidatePath(KNOWLEDGE_DIR, decodedTarget) ||
      resolveCandidatePath(WIKI_DIR, decodedTarget.replace(/^\.\/wiki\//, "./"));

    if (!exists) {
      errors.push({
        file: path.relative(REPO_ROOT, filePath),
        message: `Link quebrado para: "${rawTarget}"`,
      });
    }
  }
}

console.log("🔍 Iniciando verificação de integridade da LLM Wiki (knowledge/)...");
console.log("✨ Validador estrutural equipado com gray-matter e zod.");

// 1. Verificar arquivos essenciais de governança
for (const essential of [INDEX_FILE, LOG_FILE, SCHEMA_FILE]) {
  if (!fs.existsSync(essential)) {
    errors.push({
      file: path.relative(REPO_ROOT, essential),
      message: "Arquivo essencial de governança ausente!",
    });
  }
}

// 2. Coletar páginas da living wiki
const wikiFiles = collectMarkdownFiles(WIKI_DIR);
console.log(`📄 Analisando ${wikiFiles.length} páginas sob knowledge/wiki/...`);

let indexContent = "";
if (fs.existsSync(INDEX_FILE)) {
  indexContent = fs.readFileSync(INDEX_FILE, "utf-8");
}

for (const file of wikiFiles) {
  const relPath = path.relative(REPO_ROOT, file);
  const rawFile = fs.readFileSync(file, "utf-8");

  let parsed;
  try {
    parsed = matter(rawFile);
  } catch (err) {
    errors.push({
      file: relPath,
      message: `Erro ao parsear YAML frontmatter: ${err.message}`,
    });
    continue;
  }

  const { data: frontmatter, content: markdownBody } = parsed;

  // Validação declarativa via Zod
  const schemaResult = WikiFrontmatterSchema.safeParse(frontmatter);
  if (!schemaResult.success) {
    for (const issue of schemaResult.error.issues) {
      errors.push({
        file: relPath,
        message: `[Zod] ${issue.path.join(".") || "frontmatter"}: ${issue.message}`,
      });
    }
  }

  // Checar links internos no corpo do markdown
  checkLinks(file, markdownBody);

  // Checar se a página está referenciada no index.md
  const baseName = path.basename(file, ".md");
  const decodedBase = normalizeDecodedPath(baseName).replace(/%2D/g, "-");
  if (!indexContent.includes(decodedBase) && !indexContent.includes(baseName)) {
    warnings.push({
      file: relPath,
      message: `Página potencialmente órfã: não referenciada explicitamente no knowledge/index.md`,
    });
  }
}

// Também checar links do index.md
if (fs.existsSync(INDEX_FILE)) {
  checkLinks(INDEX_FILE, indexContent);
}

// 3. Relatório Final
console.log("\n==================================================");
console.log("📊 RESULTADO DA AUDITORIA DA WIKI (gray-matter + zod):");
console.log(`- Total de páginas verificadas: ${wikiFiles.length + 3}`);
console.log(`- Erros críticos encontrados: ${errors.length}`);
console.log(`- Avisos / Páginas órfãs: ${warnings.length}`);
console.log("==================================================");

if (warnings.length > 0) {
  console.log("\n⚠️ AVISOS:");
  for (const w of warnings) {
    console.log(`  [${w.file}] ${w.message}`);
  }
}

if (errors.length > 0) {
  console.log("\n❌ ERROS ENCONTRADOS:");
  for (const e of errors) {
    console.log(`  [${e.file}] ${e.message}`);
  }
  console.log("\n❌ A auditoria da Wiki falhou com erros estruturais.\n");
  process.exit(1);
} else {
  console.log("\n✅ Integridade estrutural da LLM Wiki 100% aprovada!\n");
  process.exit(0);
}
