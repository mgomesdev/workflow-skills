/**
 * scripts/validate-skills/index.mjs
 *
 * Barrel central dos módulos de validação de Agent Skills.
 */

export {
  ALLOWED_ROOT_KEYS,
  EvalsFileSchema,
  parseUsesList,
  SKILL_NAME_REGEX,
  VALID_LAYERS,
  validateSkillDeterministic,
} from './deterministic-validator.mjs';
export {
  detectTouchedSkills,
  extractTouchedSkillsFromPaths,
  isAuthoredSkill,
} from './diff-detector.mjs';
export {
  computeSkillHash,
  evaluateSkillProbabilisticHeuristic,
  evaluateSkillProbabilisticLLM,
  runProbabilisticForSkill,
} from './probabilistic-evaluator.mjs';
