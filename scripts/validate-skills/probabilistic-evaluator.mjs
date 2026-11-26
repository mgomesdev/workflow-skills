/**
 * scripts/validate-skills/probabilistic-evaluator.mjs
 *
 * Responsabilidade Única (SRP): Execução probabilística de evals e trigger_tests
 * via LLM Judge (Gemini API REST) com cache SHA-256 e fallback heurístico dry-run.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';

const JUDGE_SYSTEM_INSTRUCTION = [
  'Você é um avaliador rigoroso de Agent Skills (LLM-as-a-Judge) seguindo o padrão agentskills.io.',
  'Simule em modo dry-run a execução da skill descrita em SKILL.md para cada cenário em evals.json e avalie cada item de expectations com PASS ou FAIL, além de validar os trigger_tests.',
  'Responda ESTRITAMENTE em JSON válido no formato:',
  '{"passed": boolean, "scenarios": [{"id": number, "passed": boolean, "expectations": [{"expectation": string, "status": "PASS" | "FAIL", "reason": string}]}], "trigger_tests": {"should_trigger": [{"prompt": string, "status": "PASS" | "FAIL"}], "should_not_trigger": [{"prompt": string, "status": "PASS" | "FAIL"}]}}',
].join('\n');

export const computeSkillHash = (skillMdContent, evalsJsonContent) =>
  crypto
    .createHash('sha256')
    .update(`${skillMdContent}\n---EVALS---\n${evalsJsonContent}`, 'utf-8')
    .digest('hex');

const normalizeText = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const tokenizeKeywords = (text) =>
  normalizeText(text)
    .split(/[^a-z0-9_-]+/)
    .filter((token) => token.length >= 3);

const evaluateScenarioHeuristic = (scenario, normalizedDoc) => {
  const expectations = scenario.expectations.map((exp) => {
    const tokens = tokenizeKeywords(exp);
    const matched = tokens.filter((t) => normalizedDoc.includes(t));
    const ratio = tokens.length > 0 ? matched.length / tokens.length : 0;
    const passed = ratio >= 0.35;
    return {
      expectation: exp,
      status: passed ? 'PASS' : 'FAIL',
      score: Number(ratio.toFixed(2)),
      reason: passed
        ? `Aderência confirmada no protocolo do SKILL.md (${matched.length}/${tokens.length} termos ancorados)`
        : `Baixa ancoragem no SKILL.md (${matched.length}/${tokens.length} termos encontrados)`,
    };
  });

  return {
    id: scenario.id,
    prompt: scenario.prompt,
    passed: expectations.every((r) => r.status === 'PASS'),
    expectations,
  };
};

const evaluateTriggersHeuristic = (skillName, descAndHeader, triggerTests) => {
  const should_trigger = triggerTests.should_trigger.map((prompt) => {
    const tokens = tokenizeKeywords(prompt);
    const directMention = prompt.toLowerCase().includes(skillName.toLowerCase());
    const matched = tokens.filter((t) => descAndHeader.includes(t));
    const ratio = tokens.length > 0 ? matched.length / tokens.length : 0;
    return { prompt, status: directMention || ratio >= 0.25 ? 'PASS' : 'FAIL' };
  });

  const should_not_trigger = triggerTests.should_not_trigger.map((prompt) => {
    const directSlash = prompt.trim().toLowerCase().startsWith(`/${skillName.toLowerCase()}`);
    return { prompt, status: !directSlash ? 'PASS' : 'FAIL' };
  });

  return { should_trigger, should_not_trigger };
};

export const evaluateSkillProbabilisticHeuristic = (skillName, skillMdContent, evalsData) => {
  const parsed = matter(skillMdContent);
  const description = String(parsed.data?.description || '');
  const normalizedDoc = normalizeText(`${skillName} ${description} ${parsed.content}`);
  const descAndHeader = normalizeText(`${skillName} ${description} ${parsed.content.slice(0, 1200)}`);

  const scenarios = evalsData.evals.map((sc) => evaluateScenarioHeuristic(sc, normalizedDoc));
  const trigger_tests = evaluateTriggersHeuristic(skillName, descAndHeader, evalsData.trigger_tests);

  const scenariosPassed = scenarios.every((s) => s.passed);
  const triggersPassed =
    trigger_tests.should_trigger.every((t) => t.status === 'PASS') &&
    trigger_tests.should_not_trigger.every((t) => t.status === 'PASS');

  return {
    skill_name: skillName,
    engine: 'heuristic-dry-run',
    passed: scenariosPassed && triggersPassed,
    scenarios,
    trigger_tests,
  };
};

const isJudgeVerdictPassing = (parsedResult) => {
  const scenariosPassed =
    Array.isArray(parsedResult.scenarios) &&
    parsedResult.scenarios.every(
      (s) =>
        s.passed &&
        Array.isArray(s.expectations) &&
        s.expectations.every((e) => e.status === 'PASS')
    );
  const triggersPassed =
    Array.isArray(parsedResult.trigger_tests?.should_trigger) &&
    parsedResult.trigger_tests.should_trigger.every((t) => t.status === 'PASS') &&
    Array.isArray(parsedResult.trigger_tests?.should_not_trigger) &&
    parsedResult.trigger_tests.should_not_trigger.every((t) => t.status === 'PASS');

  return Boolean(scenariosPassed && triggersPassed);
};

export const evaluateSkillProbabilisticLLM = async (
  skillName,
  skillMdContent,
  evalsData,
  {
    apiKey = process.env.GEMINI_API_KEY,
    model = process.env.SKILL_EVAL_MODEL || 'gemini-2.5-flash',
    fetchFn = globalThis.fetch,
  } = {}
) => {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada para execução do LLM Judge');
  }

  const userPrompt = JSON.stringify(
    { skill_name: skillName, skill_markdown: skillMdContent, evals_suite: evalsData },
    null,
    2
  );
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetchFn(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: JUDGE_SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Resposta vazia do modelo Gemini ao julgar evals');
  }

  const parsedResult = JSON.parse(rawText);
  return {
    skill_name: skillName,
    engine: `llm-judge (${model})`,
    passed: isJudgeVerdictPassing(parsedResult),
    scenarios: parsedResult.scenarios || [],
    trigger_tests: parsedResult.trigger_tests || { should_trigger: [], should_not_trigger: [] },
  };
};

const readCacheFile = (cacheFile) => {
  if (!fs.existsSync(cacheFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  } catch {
    return {};
  }
};

const writeCacheEntry = (cacheFile, cacheData, skillName, contentHash, result) => {
  try {
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    cacheData[skillName] = { hash: contentHash, updatedAt: new Date().toISOString(), result };
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), 'utf-8');
  } catch {
    // Falha de cache local nunca bloqueia o gate
  }
};

export const runProbabilisticForSkill = async (
  skillName,
  {
    skillsDir = path.resolve('.agents/skills'),
    cacheFile = path.resolve('.cache/skills-evals-cache.json'),
    useCache = true,
    requireApiKey = false,
    apiKey = process.env.GEMINI_API_KEY,
    fetchFn = globalThis.fetch,
  } = {}
) => {
  const skillDir = path.join(skillsDir, skillName);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const evalsPath = path.join(skillDir, 'evals', 'evals.json');

  if (!fs.existsSync(skillMdPath) || !fs.existsSync(evalsPath)) {
    return {
      skill_name: skillName,
      engine: 'none',
      passed: false,
      error: `Arquivos obrigatórios ausentes (${!fs.existsSync(skillMdPath) ? 'SKILL.md' : 'evals/evals.json'})`,
      scenarios: [],
      trigger_tests: { should_trigger: [], should_not_trigger: [] },
    };
  }

  const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');
  const evalsRawContent = fs.readFileSync(evalsPath, 'utf-8');
  const contentHash = computeSkillHash(skillMdContent, evalsRawContent);
  const cacheData = useCache ? readCacheFile(cacheFile) : {};
  const cachedEntry = cacheData[skillName];

  if (useCache && cachedEntry?.hash === contentHash && cachedEntry.result?.passed) {
    return { ...cachedEntry.result, cached: true };
  }

  if (!apiKey && requireApiKey) {
    throw new Error('GEMINI_API_KEY é obrigatória quando --require-api-key está ativo.');
  }

  const evalsData = JSON.parse(evalsRawContent);
  const result = apiKey
    ? await evaluateSkillProbabilisticLLM(skillName, skillMdContent, evalsData, { apiKey, fetchFn })
    : evaluateSkillProbabilisticHeuristic(skillName, skillMdContent, evalsData);

  if (useCache && result.passed) {
    writeCacheEntry(cacheFile, cacheData, skillName, contentHash, result);
  }

  return { ...result, cached: false };
};
