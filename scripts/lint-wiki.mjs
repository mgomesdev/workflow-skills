#!/usr/bin/env node

/**
 * scripts/lint-wiki.mjs
 *
 * Validador estrutural determinístico da LLM Wiki (knowledge/) do repositório workflow-skills.
 * Verifica frontmatter YAML (Zod), links internos e páginas órfãs em relação a knowledge/index.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import { z } from 'zod';

const REPO_ROOT = process.cwd();
const KNOWLEDGE_DIR = path.join(REPO_ROOT, 'knowledge');
const WIKI_DIR = path.join(KNOWLEDGE_DIR, 'wiki');
const INDEX_FILE = path.join(KNOWLEDGE_DIR, 'index.md');
const LOG_FILE = path.join(KNOWLEDGE_DIR, 'log.md');
const SCHEMA_FILE = path.join(KNOWLEDGE_DIR, 'SCHEMA.md');

const WikiFrontmatterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(['governance', 'catalog', 'concept', 'engineering', 'entity', 'method', 'synthesis', 'raw']),
  status: z.enum(['Draft', 'Reviewed', 'Approved', 'Active', 'Immutable']),
  last_updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(1),
  tags: z.array(z.string()).min(1),
});

const errors = [];
const warnings = [];

function collectMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) results.push(fullPath);
  }
  return results;
}

function checkLinks(filePath, content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawTarget = match[2].trim();
    if (
      rawTarget.startsWith('#') ||
      rawTarget.startsWith('http://') ||
      rawTarget.startsWith('https://') ||
      rawTarget.startsWith('mailto:')
    ) {
      continue;
    }
    const [pathPart] = rawTarget.split('#');
    if (!pathPart) continue;
    const baseDir = path.dirname(filePath);
    const candidate = path.resolve(baseDir, pathPart);
    if (!fs.existsSync(candidate) && !fs.existsSync(`${candidate}.md`)) {
      errors.push({
        file: path.relative(REPO_ROOT, filePath),
        message: `Link quebrado para: "${rawTarget}"`,
      });
    }
  }
}

for (const essential of [INDEX_FILE, LOG_FILE, SCHEMA_FILE]) {
  if (!fs.existsSync(essential)) {
    errors.push({ file: path.relative(REPO_ROOT, essential), message: 'Arquivo essencial de governança ausente!' });
  }
}

const indexContent = fs.existsSync(INDEX_FILE) ? fs.readFileSync(INDEX_FILE, 'utf-8') : '';
const wikiFiles = collectMarkdownFiles(WIKI_DIR);

for (const file of wikiFiles) {
  const relPath = path.relative(REPO_ROOT, file);
  const parsed = matter(fs.readFileSync(file, 'utf-8'));
  const result = WikiFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push({ file: relPath, message: `[Zod] ${issue.path.join('.') || 'frontmatter'}: ${issue.message}` });
    }
  }
  checkLinks(file, parsed.content);
  const baseName = path.basename(file, '.md');
  if (!indexContent.includes(baseName)) {
    warnings.push({ file: relPath, message: 'Página potencialmente órfã: não referenciada no knowledge/index.md' });
  }
}

if (fs.existsSync(INDEX_FILE)) {
  checkLinks(INDEX_FILE, indexContent);
}

console.log(`📊 [Wiki Lint] Páginas verificadas: ${wikiFiles.length + 3} | Erros: ${errors.length} | Avisos: ${warnings.length}`);
for (const w of warnings) console.warn(`  ⚠️ [${w.file}] ${w.message}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`  ❌ [${e.file}] ${e.message}`);
  process.exit(1);
}
console.log('✅ Integridade estrutural da LLM Wiki 100% aprovada!');
