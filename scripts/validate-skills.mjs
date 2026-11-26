#!/usr/bin/env node

/**
 * scripts/validate-skills.mjs
 *
 * CLI Runner enxuto para Governança de Agent Skills (skills/).
 * Delega detecção de diff, validação determinística (skills-ref + Zod) e
 * avaliação probabilística (evals + trigger_tests) para scripts/validate-skills/.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  detectTouchedSkills,
  isAuthoredSkill,
  runProbabilisticForSkill,
  validateSkillDeterministic,
} from './validate-skills/index.mjs';

export * from './validate-skills/index.mjs';

export const parseCliArgs = (argv) => {
  const args = {
    mode: 'deterministic',
    staged: false,
    ci: false,
    all: false,
    noCache: false,
    requireApiKey: false,
    skills: [],
  };

  for (const arg of argv) {
    if (arg.startsWith('--mode=')) args.mode = arg.split('=')[1];
    else if (arg === '--deterministic') args.mode = 'deterministic';
    else if (arg === '--probabilistic') args.mode = 'probabilistic';
    else if (arg === '--staged') args.staged = true;
    else if (arg === '--ci') args.ci = true;
    else if (arg === '--all') args.all = true;
    else if (arg === '--no-cache') args.noCache = true;
    else if (arg === '--require-api-key') args.requireApiKey = true;
    else if (arg.startsWith('--skill=')) {
      const list = (arg.split('=')[1] || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      args.skills.push(...list);
    }
  }
  return args;
};

const runDeterministicMode = (touchedSkills, scope, { skillsDir, existingSkills, catalogFile }) => {
  console.log(
    `🧩 [Skills Deterministic Gate] Validando ${touchedSkills.length} skill(s) tocada(s) [${scope}]: ${touchedSkills.join(', ')}`
  );

  const catalogContent = fs.existsSync(catalogFile) ? fs.readFileSync(catalogFile, 'utf-8') : '';
  const allErrors = [];
  const allWarnings = [];

  for (const skillName of touchedSkills) {
    const { errors, warnings } = validateSkillDeterministic(skillName, {
      skillsDir,
      existingSkills,
      catalogContent,
    });
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  for (const w of allWarnings) console.log(`  ⚠️ [${w.file}] ${w.message}`);
  if (allErrors.length > 0) {
    for (const e of allErrors) console.error(`  ❌ [${e.file}] ${e.message}`);
    console.error(
      `\n❌ [Skills Deterministic Gate] Falhou com ${allErrors.length} erro(s) em ${touchedSkills.length} skill(s).\n`
    );
    return 1;
  }

  console.log(
    `✅ [Skills Deterministic Gate] ${touchedSkills.length}/${touchedSkills.length} skill(s) aprovada(s) em conformidade com agentskills.io (skills-ref) e schema Zod!\n`
  );
  return 0;
};

const logProbabilisticSkillReport = (skillName, report) => {
  if (report.error) {
    console.error(`  ❌ [${skillName}] ${report.error}`);
    return false;
  }

  const totalExp = report.scenarios.reduce((acc, s) => acc + (s.expectations?.length || 0), 0);
  const passExp = report.scenarios.reduce(
    (acc, s) => acc + (s.expectations?.filter((e) => e.status === 'PASS').length || 0),
    0
  );
  const totalTrig =
    (report.trigger_tests?.should_trigger?.length || 0) +
    (report.trigger_tests?.should_not_trigger?.length || 0);
  const passTrig =
    (report.trigger_tests?.should_trigger?.filter((t) => t.status === 'PASS').length || 0) +
    (report.trigger_tests?.should_not_trigger?.filter((t) => t.status === 'PASS').length || 0);

  const badge = report.cached ? ' [CACHE HIT]' : '';
  const icon = report.passed ? '✅' : '❌';
  const logger = report.passed ? console.log : console.error;
  logger(
    `  ${icon} [${skillName}] (${report.engine}${badge}) — Expectations: ${passExp}/${totalExp} PASS | Triggers: ${passTrig}/${totalTrig} PASS`
  );
  return report.passed;
};

const runProbabilisticMode = async (touchedSkills, scope, args, skillsDir) => {
  const authoredTouched = touchedSkills.filter(isAuthoredSkill);
  if (authoredTouched.length === 0) {
    console.log(
      `⏭️ [Skills Probabilistic Gate] Apenas skills externas tocadas (${touchedSkills.join(', ')}). Pulando evals.`
    );
    return 0;
  }

  console.log(
    `🧠 [Skills Probabilistic Gate] Executando evals e trigger_tests para ${authoredTouched.length} skill(s) [${scope}]: ${authoredTouched.join(', ')}`
  );

  let failedSkills = 0;
  for (const skillName of authoredTouched) {
    const report = await runProbabilisticForSkill(skillName, {
      skillsDir,
      useCache: !args.noCache,
      requireApiKey: args.requireApiKey,
    });
    if (!logProbabilisticSkillReport(skillName, report)) failedSkills++;
  }

  if (failedSkills > 0) {
    console.error(`\n❌ [Skills Probabilistic Gate] ${failedSkills} skill(s) reprovada(s).\n`);
    return 1;
  }

  console.log(
    `✅ [Skills Probabilistic Gate] 100% das expectations e trigger_tests aprovados para ${authoredTouched.length} skill(s)!\n`
  );
  return 0;
};

export const runCli = async (argv = process.argv.slice(2)) => {
  const args = parseCliArgs(argv);
  const skillsDir = path.resolve('skills');
  const catalogFile = path.resolve('knowledge/wiki/engineering/catalogo-skills.md');

  if (!fs.existsSync(skillsDir)) return 0;

  const existingSkills = new Set(
    fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
      .map((d) => d.name)
  );

  const { touchedSkills, scope } = detectTouchedSkills({
    staged: args.staged,
    ci: args.ci,
    all: args.all,
    skills: args.skills,
    existingSkills,
  });

  if (touchedSkills.length === 0) {
    const label = args.mode === 'probabilistic' ? 'Probabilistic' : 'Deterministic';
    console.log(
      `⏭️ [Skills ${label} Gate] Nenhuma alteração em skills/ detectada (escopo: ${scope}). Pulando validação.`
    );
    return 0;
  }

  if (args.mode === 'deterministic') {
    return runDeterministicMode(touchedSkills, scope, { skillsDir, existingSkills, catalogFile });
  }
  if (args.mode === 'probabilistic') {
    return runProbabilisticMode(touchedSkills, scope, args, skillsDir);
  }

  console.error(`❌ Modo inválido: '${args.mode}'.`);
  return 1;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('❌ Erro fatal no validador de skills:', err.message);
      process.exit(1);
    });
}
