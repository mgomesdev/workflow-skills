/**
 * scripts/validate-skills/diff-detector.mjs
 *
 * Responsabilidade Única (SRP): Detectar alterações no Git (--staged, --ci, --all, --skill)
 * e extrair cirurgicamente apenas os diretórios de skills (skills/<skill>/) tocados.
 */

import { execSync } from 'node:child_process';
import process from 'node:process';

export const isAuthoredSkill = (skillName) =>
  skillName.startsWith('a-') || skillName.startsWith('m-');

export const extractTouchedSkillsFromPaths = (filePaths, existingSkillsSet) => {
  const touched = new Set();
  for (const rawPath of filePaths) {
    const normalized = rawPath.replace(/\\/g, '/').trim();
    const match = normalized.match(/^skills\/([^/]+)\//);
    const skillName = match?.[1];
    if (skillName && (!existingSkillsSet || existingSkillsSet.has(skillName))) {
      touched.add(skillName);
    }
  }
  return Array.from(touched).sort();
};

const defaultExecGit = (command) => {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

const resolveCiChangedFiles = (execGit, env) => {
  const prTarget = env.SYSTEM_PULLREQUEST_TARGETBRANCH;
  if (prTarget) {
    const targetBranch = prTarget.replace(/^refs\/heads\//, '');
    const prFiles = execGit(`git diff --name-only origin/${targetBranch}...HEAD`);
    if (prFiles.length > 0) return prFiles;
  }
  return execGit('git diff --name-only HEAD~1...HEAD');
};

const resolveWorkingTreeChangedFiles = (execGit) => {
  const unstaged = execGit('git diff --name-only HEAD');
  const staged = execGit('git diff --cached --name-only --diff-filter=ACMR');
  const untracked = execGit('git ls-files --others --exclude-standard skills/');
  return Array.from(new Set([...unstaged, ...staged, ...untracked]));
};

export const detectTouchedSkills = ({
  staged = false,
  ci = false,
  all = false,
  skills = [],
  existingSkills = new Set(),
  execGit = defaultExecGit,
  env = process.env,
} = {}) => {
  if (skills.length > 0) {
    const filtered = skills.filter((s) => existingSkills.has(s));
    return { touchedSkills: filtered, changedFiles: [], scope: 'explicit' };
  }

  if (all) {
    return {
      touchedSkills: Array.from(existingSkills).sort(),
      changedFiles: [],
      scope: 'all',
    };
  }

  const scope = staged ? 'staged' : ci ? 'ci' : 'working-tree';
  const changedFiles = staged
    ? execGit('git diff --cached --name-only --diff-filter=ACMR')
    : ci
      ? resolveCiChangedFiles(execGit, env)
      : resolveWorkingTreeChangedFiles(execGit);

  const touchedSkills = extractTouchedSkillsFromPaths(changedFiles, existingSkills);
  return { touchedSkills, changedFiles, scope };
};
