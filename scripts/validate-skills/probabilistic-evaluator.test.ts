import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  computeSkillHash,
  evaluateSkillProbabilisticHeuristic,
  evaluateSkillProbabilisticLLM,
  runProbabilisticForSkill,
} from './probabilistic-evaluator.mjs';

const tempDirs: string[] = [];

const createTempSkillsWorkspace = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prob-skills-test-'));
  tempDirs.push(dir);
  const skillsDir = path.join(dir, '.agents', 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });
  return { rootDir: dir, skillsDir };
};

afterEach(() => {
  while (tempDirs.length > 0) {
    const d = tempDirs.pop();
    if (d && fs.existsSync(d)) {
      fs.rmSync(d, { recursive: true, force: true });
    }
  }
});

describe('Avaliador Probabilístico de Skills (scripts/validate-skills/probabilistic-evaluator.mjs)', () => {
  const sampleSkillMd = [
    '---',
    'name: a-ado-board-gate',
    'description: Átomo de pré-voo do Azure Boards via MCP wit_work_item e wit_work_item_write. Verifica Planning (Hierarchy-Forward Child), audita context drift e move card para Developing e Doing.',
    '---',
    '# Atom a-ado-board-gate',
    'Consulta wit_work_item com expand: All, verifica System.LinkTypes.Hierarchy-Forward (Child) e System.LinkTypes.Hierarchy-Reverse (Parent), audita context drift na codebase e emite BLOCKED (Planning Required) ou move para Developing (WEF_*_Kanban.Column) com System.State = Doing.',
  ].join('\n');

  const sampleEvals = {
    skill_name: 'a-ado-board-gate',
    evals: [
      {
        id: 1,
        prompt: 'Rode o pre-flight gate do Azure Boards para o card #115.',
        expected_output: 'Bloqueio imediato BLOCKED (Planning Required) sem tasks filhas.',
        expectations: [
          'Consulta o Work Item no servidor MCP azure-devops usando wit_work_item com expand: All',
          'Verifica vínculos System.LinkTypes.Hierarchy-Forward (Child)',
        ],
      },
      {
        id: 2,
        prompt: 'Valide o gate da Task #175 filha da US #115.',
        expected_output: 'Move para Developing e Doing.',
        expectations: [
          'Move o card pai para a coluna Developing (WEF_*_Kanban.Column) com System.State = Doing',
        ],
      },
    ],
    trigger_tests: {
      should_trigger: [
        'Verifique o gate de pré-voo do Azure Boards para a task #175',
        '/a-ado-board-gate 175',
      ],
      should_not_trigger: [
        'Faça o commit semântico das alterações locais',
        'Abra a Pull Request da task #175',
      ],
    },
  };

  it('avalia expectations e trigger_tests com sucesso no modo heurístico dry-run', () => {
    const report = evaluateSkillProbabilisticHeuristic(
      'a-ado-board-gate',
      sampleSkillMd,
      sampleEvals
    );

    expect(report.passed).toBe(true);
    expect(report.engine).toBe('heuristic-dry-run');
    expect(report.scenarios.every((s: { passed: boolean }) => s.passed)).toBe(true);
  });

  it('invoca o LLM Judge quando apiKey está presente e interpreta o veredito JSON', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    passed: true,
                    scenarios: [
                      {
                        id: 1,
                        passed: true,
                        expectations: [
                          {
                            expectation: 'Consulta wit_work_item',
                            status: 'PASS',
                            reason: 'Cumprido',
                          },
                        ],
                      },
                    ],
                    trigger_tests: {
                      should_trigger: [{ prompt: '/a-ado-board-gate 175', status: 'PASS' }],
                      should_not_trigger: [{ prompt: 'Faça commit', status: 'PASS' }],
                    },
                  }),
                },
              ],
            },
          },
        ],
      }),
    });

    const result = await evaluateSkillProbabilisticLLM(
      'a-ado-board-gate',
      sampleSkillMd,
      sampleEvals,
      {
        apiKey: 'fake-key',
        model: 'gemini-2.5-flash',
        fetchFn: mockFetch,
      }
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.passed).toBe(true);
    expect(result.engine).toBe('llm-judge (gemini-2.5-flash)');
  });

  it('persiste e reutiliza cache SHA-256 quando SKILL.md e evals.json não mudaram', async () => {
    const { rootDir, skillsDir } = createTempSkillsWorkspace();
    const skillName = 'a-ado-board-gate';
    const skillDir = path.join(skillsDir, skillName);
    const cacheFile = path.join(rootDir, '.cache', 'skills-evals-cache.json');
    fs.mkdirSync(path.join(skillDir, 'evals'), { recursive: true });

    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), sampleSkillMd, 'utf-8');
    fs.writeFileSync(
      path.join(skillDir, 'evals', 'evals.json'),
      JSON.stringify(sampleEvals),
      'utf-8'
    );

    const firstRun = await runProbabilisticForSkill(skillName, {
      skillsDir,
      cacheFile,
      useCache: true,
      apiKey: '',
    });
    expect(firstRun.passed).toBe(true);
    expect(firstRun.cached).toBe(false);

    const secondRun = await runProbabilisticForSkill(skillName, {
      skillsDir,
      cacheFile,
      useCache: true,
      apiKey: '',
    });
    expect(secondRun.passed).toBe(true);
    expect(secondRun.cached).toBe(true);
    expect(computeSkillHash(sampleSkillMd, JSON.stringify(sampleEvals))).toHaveLength(64);
  });
});
