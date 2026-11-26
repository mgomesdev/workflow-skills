import { describe, expect, it } from 'vitest';
import { parseCliArgs } from './validate-skills.mjs';

describe('CLI Runner de Governança de Skills (scripts/validate-skills.mjs)', () => {
  it('interpreta flags --mode, --staged, --ci, --all, --no-cache e --skill corretamente', () => {
    const parsed = parseCliArgs([
      '--mode=probabilistic',
      '--staged',
      '--no-cache',
      '--skill=a-ado-board-gate,m-ado-task-start',
    ]);

    expect(parsed.mode).toBe('probabilistic');
    expect(parsed.staged).toBe(true);
    expect(parsed.noCache).toBe(true);
    expect(parsed.skills).toEqual(['a-ado-board-gate', 'm-ado-task-start']);
  });

  it('assume modo deterministic por padrão quando nenhuma flag de modo é passada', () => {
    const parsed = parseCliArgs(['--ci']);
    expect(parsed.mode).toBe('deterministic');
    expect(parsed.ci).toBe(true);
  });
});
