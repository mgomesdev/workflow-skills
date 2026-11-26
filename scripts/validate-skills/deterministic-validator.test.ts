import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parseUsesList, validateSkillDeterministic } from './deterministic-validator.mjs';

const tempDirs: string[] = [];

const createTempSkillsWorkspace = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'det-skills-test-'));
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

describe('Validador Determinístico de Skills (scripts/validate-skills/deterministic-validator.mjs)', () => {
  it('normaliza uses em string separada por vírgula ou array', () => {
    expect(parseUsesList('a-ado-board-gate, a-ado-git-commit')).toEqual([
      'a-ado-board-gate',
      'a-ado-git-commit',
    ]);
    expect(parseUsesList(['a-ado-board-gate'])).toEqual(['a-ado-board-gate']);
    expect(parseUsesList(undefined)).toEqual([]);
  });

  it('aprova skill autoral 100% aderente ao schema agentskills.io e com evals.json válido', () => {
    const { skillsDir } = createTempSkillsWorkspace();
    const skillName = 'a-ado-board-gate';
    const skillDir = path.join(skillsDir, skillName);
    fs.mkdirSync(path.join(skillDir, 'evals'), { recursive: true });

    fs.writeFileSync(
      path.join(skillDir, 'SKILL.md'),
      [
        '---',
        'name: a-ado-board-gate',
        'description: Átomo de pré-voo do Azure Boards via MCP (wit_work_item e wit_work_item_write).',
        'license: MIT',
        'compatibility: Requer servidor MCP azure-devops autenticado.',
        'metadata:',
        '  author: mgomesdev',
        '  version: "1.0.0"',
        '  layer: atom',
        '  sdlc_phase: development',
        '---',
        '# Atom a-ado-board-gate',
      ].join('\n'),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(skillDir, 'evals', 'evals.json'),
      JSON.stringify({
        skill_name: 'a-ado-board-gate',
        evals: [
          {
            id: 1,
            prompt: 'Vou começar a programar o card #115 agora. Rode o pre-flight gate.',
            expected_output: 'Bloqueio imediato caso o card #115 não possua subtasks SMART.',
            expectations: ['Consulta o Work Item #115 via wit_work_item com expand All'],
          },
          {
            id: 2,
            prompt: 'Valide o gate de pré-voo da Task #175 filha da US #115 no Azure Boards.',
            expected_output: 'Transição automática para Developing e Doing com PASSED.',
            expectations: ['Move o card pai #115 para a coluna Developing'],
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
      }),
      'utf-8'
    );

    const { errors, warnings } = validateSkillDeterministic(skillName, {
      skillsDir,
      existingSkills: new Set([skillName]),
      catalogContent: 'Catálogo contendo a-ado-board-gate listado.',
    });

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('reprova skill autoral com chaves raiz fora do skills-ref ou sem evals/evals.json', () => {
    const { skillsDir } = createTempSkillsWorkspace();
    const skillName = 'a-invalid-skill';
    const skillDir = path.join(skillsDir, skillName);
    fs.mkdirSync(skillDir, { recursive: true });

    fs.writeFileSync(
      path.join(skillDir, 'SKILL.md'),
      [
        '---',
        'name: wrong-name',
        'layer: atom',
        'sdlc_phase: development',
        'description: Curta',
        '---',
        '# Invalid Skill',
      ].join('\n'),
      'utf-8'
    );

    const { errors } = validateSkillDeterministic(skillName, {
      skillsDir,
      existingSkills: new Set([skillName]),
      catalogContent: 'a-invalid-skill',
    });

    const messages = errors.map((e) => e.message);
    expect(messages.some((m) => m.includes("Chave raiz 'layer' não permitida"))).toBe(true);
    expect(messages.some((m) => m.includes('idêntico ao nome do diretório'))).toBe(true);
    expect(messages.some((m) => m.includes('evals/evals.json obrigatório ausente'))).toBe(true);
  });
});
