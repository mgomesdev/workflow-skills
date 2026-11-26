/**
 * scripts/validate-skills/deterministic-validator.mjs
 *
 * Responsabilidade Única (SRP): Validação estática determinística do SKILL.md
 * segundo agentskills.io (skills-ref), resolução de dependências (uses),
 * paridade com catalogo-skills.md e validação de schema Zod para evals/evals.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { isAuthoredSkill } from './diff-detector.mjs';

export const ALLOWED_ROOT_KEYS = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
]);

export const SKILL_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const VALID_LAYERS = ['atom', 'molecule', 'workflow', 'external'];

export const EvalsFileSchema = z.object({
  skill_name: z
    .string()
    .min(1, 'skill_name é obrigatório')
    .max(64, 'skill_name deve ter no máximo 64 caracteres')
    .regex(SKILL_NAME_REGEX, 'skill_name deve ser kebab-case alfanumérico minúsculo'),
  evals: z
    .array(
      z.object({
        id: z.number().int().positive('O id do cenário deve ser um inteiro positivo'),
        prompt: z.string().min(10, 'O prompt do cenário deve ter pelo menos 10 caracteres'),
        expected_output: z
          .string()
          .min(10, 'expected_output deve descrever claramente o resultado esperado'),
        expectations: z
          .array(z.string().min(5, 'Cada expectation deve ser uma afirmação verificável'))
          .min(1, 'Cada cenário deve ter pelo menos 1 expectation'),
      })
    )
    .min(2, 'A suíte evals deve conter pelo menos 2 cenários de teste'),
  trigger_tests: z.object({
    should_trigger: z
      .array(z.string().min(3, 'Prompt de should_trigger muito curto'))
      .min(2, 'trigger_tests.should_trigger deve conter pelo menos 2 prompts'),
    should_not_trigger: z
      .array(z.string().min(3, 'Prompt de should_not_trigger muito curto'))
      .min(2, 'trigger_tests.should_not_trigger deve conter pelo menos 2 prompts'),
  }),
});

export const parseUsesList = (rawUses) => {
  if (Array.isArray(rawUses)) {
    return rawUses.map((u) => String(u).trim()).filter(Boolean);
  }
  if (typeof rawUses === 'string' && rawUses.trim().length > 0) {
    return rawUses
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
  }
  return [];
};

const validateAuthoredRootKeys = (data, relSkillMd, errors) => {
  for (const key of Object.keys(data)) {
    if (!ALLOWED_ROOT_KEYS.has(key)) {
      errors.push({
        file: relSkillMd,
        message: `Chave raiz '${key}' não permitida pela especificação agentskills.io (skills-ref). Mova campos customizados para 'metadata'.`,
      });
    }
  }
};

const validateAuthoredIdentity = (skillName, data, relSkillMd, errors) => {
  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ file: relSkillMd, message: "Campo obrigatório 'name' ausente no frontmatter" });
    return;
  }
  if (data.name !== skillName) {
    errors.push({
      file: relSkillMd,
      message: `Campo 'name' ('${data.name}') deve ser idêntico ao nome do diretório ('${skillName}')`,
    });
  }
  if (data.name.length > 64 || !SKILL_NAME_REGEX.test(data.name)) {
    errors.push({
      file: relSkillMd,
      message: `Campo 'name' ('${data.name}') viola o padrão skills-ref (máx. 64 chars, kebab-case minúsculo)`,
    });
  }
};

const validateAuthoredFields = (data, relSkillMd, errors) => {
  if (typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push({ file: relSkillMd, message: "Campo obrigatório 'description' ausente ou vazio" });
  } else if (data.description.length > 1024) {
    errors.push({
      file: relSkillMd,
      message: `Campo 'description' excede 1024 caracteres (${data.description.length})`,
    });
  }

  if (data.compatibility !== undefined) {
    if (typeof data.compatibility !== 'string' || data.compatibility.trim().length === 0) {
      errors.push({
        file: relSkillMd,
        message: "Campo 'compatibility' deve ser uma string não vazia quando presente",
      });
    } else if (data.compatibility.length > 500) {
      errors.push({
        file: relSkillMd,
        message: `Campo 'compatibility' excede 500 caracteres (${data.compatibility.length})`,
      });
    }
  }
};

const validateAuthoredMetadataMap = (data, relSkillMd, errors) => {
  if (!data.metadata || typeof data.metadata !== 'object' || Array.isArray(data.metadata)) {
    errors.push({
      file: relSkillMd,
      message:
        "Campo 'metadata' obrigatório nas skills autorais (contendo layer, sdlc_phase, author, version)",
    });
    return;
  }
  for (const [mKey, mVal] of Object.entries(data.metadata)) {
    if (typeof mVal !== 'string') {
      errors.push({
        file: relSkillMd,
        message: `Campo 'metadata.${mKey}' deve ser uma string conforme especificação agentskills.io (recebido: ${typeof mVal})`,
      });
    }
  }
};

const validateLayerAndDependencies = (data, meta, existingSkills, relSkillMd, errors, warnings) => {
  const layer = meta.layer || data.layer;
  const sdlcPhase = meta.sdlc_phase || data.sdlc_phase;
  const usesList = parseUsesList(meta.uses ?? data.uses);

  if (!layer) {
    errors.push({
      file: relSkillMd,
      message: "Campo 'layer' ausente (defina em metadata.layer: atom | molecule | workflow | external)",
    });
  } else if (!VALID_LAYERS.includes(layer)) {
    errors.push({
      file: relSkillMd,
      message: `Valor inválido para 'layer': '${layer}'. Válidos: ${VALID_LAYERS.join(', ')}`,
    });
  }

  if (!sdlcPhase) {
    warnings.push({ file: relSkillMd, message: "Campo 'sdlc_phase' ausente no frontmatter" });
  }

  if (!['molecule', 'workflow'].includes(layer)) return;
  if (usesList.length === 0) {
    errors.push({
      file: relSkillMd,
      message: `Camada '${layer}' requer declaração explícita de 'uses' com ao menos 1 dependência`,
    });
    return;
  }
  for (const dep of usesList) {
    if (existingSkills.size > 0 && !existingSkills.has(dep)) {
      errors.push({ file: relSkillMd, message: `Dependência inexistente em 'uses': '${dep}'` });
    }
  }
};

const validateEvalsSemantics = (skillName, evalsData, relEvalsPath, errors) => {
  if (evalsData.skill_name !== skillName) {
    errors.push({
      file: relEvalsPath,
      message: `Campo 'skill_name' ('${evalsData.skill_name}') diverge do diretório ('${skillName}')`,
    });
  }

  const seenIds = new Set();
  for (const ev of evalsData.evals) {
    if (seenIds.has(ev.id)) {
      errors.push({ file: relEvalsPath, message: `ID de cenário duplicado em evals: ${ev.id}` });
    }
    seenIds.add(ev.id);
  }

  const positiveSet = new Set(
    evalsData.trigger_tests.should_trigger.map((s) => s.trim().toLowerCase())
  );
  for (const neg of evalsData.trigger_tests.should_not_trigger) {
    if (positiveSet.has(neg.trim().toLowerCase())) {
      errors.push({
        file: relEvalsPath,
        message: `Colisão em trigger_tests: prompt presente em should_trigger e should_not_trigger ('${neg}')`,
      });
    }
  }
};

const validateAuthoredEvalsFile = (skillName, skillDir, errors) => {
  const evalsPath = path.join(skillDir, 'evals', 'evals.json');
  const relEvalsPath = `.agents/skills/${skillName}/evals/evals.json`;

  if (!fs.existsSync(evalsPath)) {
    errors.push({
      file: relEvalsPath,
      message: 'Arquivo evals/evals.json obrigatório ausente na skill autoral',
    });
    return;
  }

  let evalsJson;
  try {
    evalsJson = JSON.parse(fs.readFileSync(evalsPath, 'utf-8'));
  } catch (err) {
    errors.push({
      file: relEvalsPath,
      message: `JSON malformado em evals/evals.json: ${err.message}`,
    });
    return;
  }

  const parsedEvals = EvalsFileSchema.safeParse(evalsJson);
  if (!parsedEvals.success) {
    for (const issue of parsedEvals.error.issues) {
      errors.push({
        file: relEvalsPath,
        message: `[Zod] ${issue.path.join('.') || 'root'}: ${issue.message}`,
      });
    }
    return;
  }

  validateEvalsSemantics(skillName, parsedEvals.data, relEvalsPath, errors);
};

export const validateSkillDeterministic = (
  skillName,
  { skillsDir = path.resolve('.agents/skills'), existingSkills = new Set(), catalogContent = '' } = {}
) => {
  const errors = [];
  const warnings = [];
  const skillDir = path.join(skillsDir, skillName);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const relSkillMd = `.agents/skills/${skillName}/SKILL.md`;

  if (!fs.existsSync(skillMdPath)) {
    errors.push({
      file: `.agents/skills/${skillName}`,
      message: 'Diretório de skill sem SKILL.md obrigatório',
    });
    return { errors, warnings };
  }

  let parsed;
  try {
    parsed = matter(fs.readFileSync(skillMdPath, 'utf-8'));
  } catch (err) {
    errors.push({ file: relSkillMd, message: `Erro ao parsear YAML frontmatter: ${err.message}` });
    return { errors, warnings };
  }

  const data = parsed.data || {};
  const meta = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};

  if (isAuthoredSkill(skillName)) {
    validateAuthoredRootKeys(data, relSkillMd, errors);
    validateAuthoredIdentity(skillName, data, relSkillMd, errors);
    validateAuthoredFields(data, relSkillMd, errors);
    validateAuthoredMetadataMap(data, relSkillMd, errors);
    validateAuthoredEvalsFile(skillName, skillDir, errors);
  }

  validateLayerAndDependencies(data, meta, existingSkills, relSkillMd, errors, warnings);

  if (catalogContent && !catalogContent.includes(skillName)) {
    errors.push({
      file: 'knowledge/wiki/engineering/catalogo-skills.md',
      message: `Skill '.agents/skills/${skillName}' não está listada no catálogo. Execute 'pnpm run catalog:skills'.`,
    });
  }

  return { errors, warnings };
};
