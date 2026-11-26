import { describe, expect, it } from 'vitest';
import {
  detectTouchedSkills,
  extractTouchedSkillsFromPaths,
  isAuthoredSkill,
} from './diff-detector.mjs';

describe('Detector de Diff de Skills (scripts/validate-skills/diff-detector.mjs)', () => {
  it('identifica corretamente skills autorais (a-* e m-*) vs externas', () => {
    expect(isAuthoredSkill('a-ado-board-gate')).toBe(true);
    expect(isAuthoredSkill('m-ado-task-start')).toBe(true);
    expect(isAuthoredSkill('shadcn-ui')).toBe(false);
  });

  it('extrai apenas pastas de skills existentes tocadas no diff', () => {
    const existing = new Set(['a-ado-board-gate', 'm-ado-task-start', 'shadcn-ui']);
    const paths = [
      'src/app/workflow/page.tsx',
      'skills/a-ado-board-gate/SKILL.md',
      'skills/a-ado-board-gate/evals/evals.json',
      'skills/non-existent/SKILL.md',
      'skills/m-ado-task-start/SKILL.md',
    ];

    expect(extractTouchedSkillsFromPaths(paths, existing)).toEqual([
      'a-ado-board-gate',
      'm-ado-task-start',
    ]);
  });

  it('retorna lista vazia quando nenhum arquivo em skills/ foi alterado', () => {
    const existing = new Set(['a-ado-board-gate']);
    const result = detectTouchedSkills({
      staged: true,
      existingSkills: existing,
      execGit: () => ['src/components/navbar.tsx', 'package.json'],
    });

    expect(result.touchedSkills).toEqual([]);
    expect(result.scope).toBe('staged');
  });

  it('detecta skills via branch alvo de PR quando em modo --ci', () => {
    const existing = new Set(['a-ado-board-gate', 'a-wiki-auditor']);
    const commands: string[] = [];
    const result = detectTouchedSkills({
      ci: true,
      existingSkills: existing,
      env: { NODE_ENV: 'test', SYSTEM_PULLREQUEST_TARGETBRANCH: 'refs/heads/feat/us-115' },
      execGit: (cmd) => {
        commands.push(cmd);
        return ['skills/a-ado-board-gate/SKILL.md'];
      },
    });

    expect(commands[0]).toContain('origin/feat/us-115...HEAD');
    expect(result.touchedSkills).toEqual(['a-ado-board-gate']);
    expect(result.scope).toBe('ci');
  });
});
