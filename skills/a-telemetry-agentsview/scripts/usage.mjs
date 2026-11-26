#!/usr/bin/env node
/**
 * Utilitário CLI de Telemetria Agêntica e FinOps por Entrega (AgentsView)
 *
 * Responsabilidades:
 * 1. Bootstrap seguro de ~/.agentsview/config.toml (disable_update_check = true,
 *    foco estrito em Gemini + Antigravity IDE/CLI, desativando providers ociosos
 *    para poupar file watchers inotify no Linux, e tarifas customizadas para
 *    variantes não catalogadas do Gemini 4 Argon).
 * 2. Resolução determinística de sessões associadas a uma entrega/PR:
 *    - Via --session <id> (repetível ou separado por vírgula)
 *    - Via trailers Git `Agent-Session: <id>` nos commits da branch
 *    - Via endpoint local `POST /api/v1/commits/sessions` do daemon AgentsView
 *    - Via labels `card=<id>` ou `task=<id>` (`agentsview session list --label`)
 *    - Fallback: sessão ativa mais recente dos providers `antigravity`, `antigravity-cli`, `gemini`
 * 3. Extração e agregação de tokens e custos via `agentsview session usage <id> --format json --no-sync`
 *    (com rollup nativo de subagentes), somando:
 *    - input_tokens, cache_read_input_tokens, cache_creation_input_tokens, output_tokens
 *    - peak_context_tokens (high-water mark máximo entre sessões)
 *    - subagent_count, models, unpriced_models e cost.microdollars / 1e6
 * 4. Emissão padronizada em Markdown (`--format markdown`) ou JSON (`--format json`),
 *    com resiliência e fallback gracioso não-bloqueante (`exit 0`) quando o binário
 *    não estiver instalado ou a sessão retornar exit code 2/3 (sem telemetria de tokens).
 *
 * Contexto: Card #116 / Task #151
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ALLOWED_PROVIDERS = ["antigravity", "antigravity-cli", "gemini"];

export const DEFAULT_DISABLED_AGENTS = [
  "claude",
  "openclaude",
  "cowork",
  "codex",
  "traex",
  "augure-code",
  "open-interpreter",
  "copilot",
  "mimocode",
  "opencode",
  "opencodereview",
  "kilo",
  "kilo-legacy",
  "openhands",
  "cursor",
  "cursor-ide",
  "amp",
  "junie",
  "zencoder",
  "iflow",
  "vscode-copilot",
  "windsurf",
  "trae",
  "visualstudio-copilot",
  "pi",
  "fx",
  "tau",
  "prime-agent",
  "omp",
  "omo",
  "stepcode",
  "qwen",
  "commandcode",
  "deepseek-tui",
  "deepseek-harness",
  "codex-cloud",
  "openclaw",
  "qclaw",
  "kimi",
  "kimi-work",
  "kiro",
  "kiro-ide",
  "cortex",
  "hermes",
  "augure-desktop",
  "grok",
  "goose",
  "workbuddy",
  "codebuddy",
  "forge",
  "devin",
  "piebald",
  "warp",
  "positron",
  "posit-assistant",
  "zcode",
  "zed",
  "qwenpaw",
  "gptme",
  "qoder",
  "shelley",
  "vibe",
  "aider",
  "evener",
  "reasonix",
  "icodemate",
  "roocode",
  "cline",
  "poolside",
  "omnigent",
  "codebuff",
  "crush",
  "muse",
];

export const DEFAULT_CUSTOM_MODEL_PRICING = {
  "Gemini 4 Argon (Low)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Argon (Medium)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Argon (High)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Argon (XHigh)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "gemini-4-argon-trial": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Neon (Low)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Neon (Medium)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Neon (High)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Neon (XHigh)": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "gemini-4-neon": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "gemini-4-neon-trial": {
    input_microdollars_per_mtok: 2_000_000,
    output_microdollars_per_mtok: 10_000_000,
    cache_creation_microdollars_per_mtok: 2_500_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Gemini 4 Hydrogen (Low)": {
    input_microdollars_per_mtok: 500_000,
    output_microdollars_per_mtok: 3_000_000,
    cache_creation_microdollars_per_mtok: 625_000,
    cache_read_microdollars_per_mtok: 50_000,
  },
  "Gemini 4 Hydrogen (Medium)": {
    input_microdollars_per_mtok: 500_000,
    output_microdollars_per_mtok: 3_000_000,
    cache_creation_microdollars_per_mtok: 625_000,
    cache_read_microdollars_per_mtok: 50_000,
  },
  "Gemini 4 Hydrogen (High)": {
    input_microdollars_per_mtok: 500_000,
    output_microdollars_per_mtok: 3_000_000,
    cache_creation_microdollars_per_mtok: 625_000,
    cache_read_microdollars_per_mtok: 50_000,
  },
  "Gemini 4 Hydrogen (XHigh)": {
    input_microdollars_per_mtok: 500_000,
    output_microdollars_per_mtok: 3_000_000,
    cache_creation_microdollars_per_mtok: 625_000,
    cache_read_microdollars_per_mtok: 50_000,
  },
  "Claude Sonnet 5.5 (Low)": {
    input_microdollars_per_mtok: 3_000_000,
    output_microdollars_per_mtok: 15_000_000,
    cache_creation_microdollars_per_mtok: 3_750_000,
    cache_read_microdollars_per_mtok: 300_000,
  },
  "Claude Sonnet 5.5 (Medium)": {
    input_microdollars_per_mtok: 3_000_000,
    output_microdollars_per_mtok: 15_000_000,
    cache_creation_microdollars_per_mtok: 3_750_000,
    cache_read_microdollars_per_mtok: 300_000,
  },
  "Claude Sonnet 5.5 (High)": {
    input_microdollars_per_mtok: 3_000_000,
    output_microdollars_per_mtok: 15_000_000,
    cache_creation_microdollars_per_mtok: 3_750_000,
    cache_read_microdollars_per_mtok: 300_000,
  },
  "Claude Sonnet 5.5 (XHigh)": {
    input_microdollars_per_mtok: 3_000_000,
    output_microdollars_per_mtok: 15_000_000,
    cache_creation_microdollars_per_mtok: 3_750_000,
    cache_read_microdollars_per_mtok: 300_000,
  },
  "Claude Opus 5.5 (Low)": {
    input_microdollars_per_mtok: 4_000_000,
    output_microdollars_per_mtok: 20_000_000,
    cache_creation_microdollars_per_mtok: 5_000_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Claude Opus 5.5 (Medium)": {
    input_microdollars_per_mtok: 4_000_000,
    output_microdollars_per_mtok: 20_000_000,
    cache_creation_microdollars_per_mtok: 5_000_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Claude Opus 5.5 (High)": {
    input_microdollars_per_mtok: 4_000_000,
    output_microdollars_per_mtok: 20_000_000,
    cache_creation_microdollars_per_mtok: 5_000_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
  "Claude Opus 5.5 (XHigh)": {
    input_microdollars_per_mtok: 4_000_000,
    output_microdollars_per_mtok: 20_000_000,
    cache_creation_microdollars_per_mtok: 5_000_000,
    cache_read_microdollars_per_mtok: 200_000,
  },
};

/**
 * Normaliza o ID de sessão garantindo o prefixo `antigravity:` quando for um UUID puro.
 * @param {string} rawId
 * @returns {string}
 */
export function normalizeSessionId(rawId) {
  const trimmed = String(rawId || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes(":")) return trimmed;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return `antigravity:${trimmed}`;
  }
  return trimmed;
}

/**
 * Gera o conteúdo canônico do arquivo `~/.agentsview/config.toml`.
 * @param {string[]} [disabledAgents]
 * @param {Record<string, {input_microdollars_per_mtok: number, output_microdollars_per_mtok: number, cache_creation_microdollars_per_mtok?: number, cache_read_microdollars_per_mtok?: number}>} [customPricing]
 * @returns {string}
 */
export function buildAgentsViewConfigToml(
  disabledAgents = DEFAULT_DISABLED_AGENTS,
  customPricing = DEFAULT_CUSTOM_MODEL_PRICING,
) {
  const lines = [
    "# Configuração gerenciada pela skill a-telemetry-agentsview",
    "# Foco estrito: Gemini + Antigravity (IDE e CLI) | Zero telemetria externa",
    "disable_update_check = true",
    `disabled_agents = ${JSON.stringify(disabledAgents)}`,
    "",
  ];

  for (const [modelName, rates] of Object.entries(customPricing)) {
    lines.push(`[custom_model_pricing.${JSON.stringify(modelName)}]`);
    lines.push(
      `input_microdollars_per_mtok = ${rates.input_microdollars_per_mtok}`,
    );
    lines.push(
      `output_microdollars_per_mtok = ${rates.output_microdollars_per_mtok}`,
    );
    if (rates.cache_creation_microdollars_per_mtok !== undefined) {
      lines.push(
        `cache_creation_microdollars_per_mtok = ${rates.cache_creation_microdollars_per_mtok}`,
      );
    }
    if (rates.cache_read_microdollars_per_mtok !== undefined) {
      lines.push(
        `cache_read_microdollars_per_mtok = ${rates.cache_read_microdollars_per_mtok}`,
      );
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * Garante que `~/.agentsview/config.toml` exista e contenha as diretrizes de privacidade
 * e restrição de providers para Gemini + Antigravity.
 * @param {string} [dataDir]
 * @returns {{ configPath: string, updated: boolean }}
 */
export function ensureAgentsViewConfig(
  dataDir = process.env.AGENTSVIEW_DATA_DIR || join(homedir(), ".agentsview"),
) {
  mkdirSync(dataDir, { recursive: true });
  const configPath = join(dataDir, "config.toml");
  const desiredContent = buildAgentsViewConfigToml();

  if (existsSync(configPath)) {
    const current = readFileSync(configPath, "utf-8");
    const hasAllDefaultPricings = Object.keys(DEFAULT_CUSTOM_MODEL_PRICING).every(
      (model) => current.includes(`[custom_model_pricing.${JSON.stringify(model)}]`),
    );
    if (
      current.includes("disable_update_check = true") &&
      current.includes("disabled_agents =") &&
      hasAllDefaultPricings
    ) {
      return { configPath, updated: false };
    }
  }

  writeFileSync(configPath, desiredContent, "utf-8");
  return { configPath, updated: true };
}

/**
 * Localiza o binário do `agentsview` no PATH ou em `~/.local/bin/agentsview`.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string | null}
 */
export function resolveAgentsViewBinary(env = process.env) {
  if (env.AGENTSVIEW_BIN && existsSync(env.AGENTSVIEW_BIN)) {
    return env.AGENTSVIEW_BIN;
  }

  const candidates = [
    join(homedir(), ".local", "bin", "agentsview"),
    "/usr/local/bin/agentsview",
    "/usr/bin/agentsview",
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const whichResult = spawnSync("which", ["agentsview"], {
    encoding: "utf-8",
    env,
  });
  if (whichResult.status === 0 && whichResult.stdout.trim()) {
    return whichResult.stdout.trim();
  }

  return null;
}

/**
 * Extrai trailers `Agent-Session: <id>` de uma string de log do Git.
 * @param {string} gitLogOutput
 * @returns {string[]}
 */
export function parseSessionIdsFromGitLog(gitLogOutput) {
  const seen = new Set();
  const regex = /^\s*Agent-Session:\s*([^\s#]+)/gim;
  let match = regex.exec(gitLogOutput);
  while (match !== null) {
    const normalized = normalizeSessionId(match[1]);
    if (normalized) {
      seen.add(normalized);
    }
    match = regex.exec(gitLogOutput);
  }
  return Array.from(seen);
}

/**
 * Agrega múltiplos relatórios JSON de `agentsview session usage <id> --format json`.
 *
 * Regras de agregação (conforme documentação oficial `token-usage.md` & `session-api.md`):
 * - `input_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens` e `output_tokens`
 *   são somados a partir das linhas de `breakdown` (ou `total_output_tokens` quando `breakdown` estiver vazio).
 * - `peak_context_tokens` é uma marca d'água máxima (high-water mark): usa-se `Math.max`, nunca soma.
 * - `cost.microdollars` é somado em inteiros e convertido ao final via `microdollars / 1_000_000`.
 * - `subagent_count` é somado entre as sessões principais analisadas.
 *
 * @param {Array<Record<string, any>>} usageReports
 * @returns {{
 *   status: "ok" | "no_data",
 *   sessions: string[],
 *   agents: string[],
 *   models: string[],
 *   unpricedModels: string[],
 *   subagentCount: number,
 *   inputTokens: number,
 *   cacheReadInputTokens: number,
 *   cacheCreationInputTokens: number,
 *   outputTokens: number,
 *   totalTokens: number,
 *   peakContextTokens: number,
 *   cacheHitRatePct: number,
 *   costMicrodollars: number,
 *   costUsd: number,
 *   hasCost: boolean,
 *   hasTokenData: boolean,
 *   breakdownCount: number
 * }}
 */
export function aggregateSessionUsages(usageReports) {
  const validReports = (usageReports || []).filter(
    (r) => r && typeof r === "object" && r.session_id,
  );

  const sessions = [];
  const agentsSet = new Set();
  const modelsSet = new Set();
  const unpricedSet = new Set();

  let subagentCount = 0;
  let inputTokens = 0;
  let cacheReadInputTokens = 0;
  let cacheCreationInputTokens = 0;
  let outputTokens = 0;
  let peakContextTokens = 0;
  let costMicrodollars = 0;
  let hasAnyTokenData = false;
  let allPriced = validReports.length > 0;
  let breakdownCount = 0;

  for (const report of validReports) {
    sessions.push(String(report.session_id));
    if (report.agent) agentsSet.add(String(report.agent));

    for (const m of report.models || []) {
      modelsSet.add(String(m));
    }
    for (const um of report.unpriced_models || []) {
      unpricedSet.add(String(um));
    }

    if (typeof report.subagent_count === "number") {
      subagentCount += report.subagent_count;
    }

    if (typeof report.peak_context_tokens === "number") {
      peakContextTokens = Math.max(
        peakContextTokens,
        report.peak_context_tokens,
      );
    }

    if (report.has_token_data) {
      hasAnyTokenData = true;
    }

    const rows = Array.isArray(report.breakdown) ? report.breakdown : [];
    breakdownCount +=
      typeof report.breakdown_count === "number"
        ? report.breakdown_count
        : rows.length;

    let rowCostSum = 0;
    if (rows.length > 0) {
      let rowOutputSum = 0;
      for (const row of rows) {
        inputTokens += Number(row.input_tokens || 0);
        cacheReadInputTokens += Number(row.cache_read_input_tokens || 0);
        cacheCreationInputTokens += Number(
          row.cache_creation_input_tokens || 0,
        );
        rowOutputSum += Number(row.output_tokens || 0);
        rowCostSum += Number(row.cost?.microdollars || 0);
        if (row.model) modelsSet.add(String(row.model));
      }
      outputTokens +=
        typeof report.total_output_tokens === "number" &&
        report.total_output_tokens > 0
          ? report.total_output_tokens
          : rowOutputSum;
    } else if (typeof report.total_output_tokens === "number") {
      outputTokens += report.total_output_tokens;
    }

    const reportMicros = Number(report.cost?.microdollars || 0);
    costMicrodollars += reportMicros > 0 ? reportMicros : rowCostSum;
    if (!report.has_cost) {
      allPriced = false;
    }
  }

  const totalTokens =
    inputTokens +
    cacheReadInputTokens +
    cacheCreationInputTokens +
    outputTokens;

  const totalPromptContext =
    inputTokens + cacheReadInputTokens + cacheCreationInputTokens;
  const cacheHitRatePct =
    totalPromptContext > 0
      ? Number(((cacheReadInputTokens / totalPromptContext) * 100).toFixed(1))
      : 0;

  const hasCost =
    hasAnyTokenData &&
    (allPriced || (costMicrodollars > 0 && unpricedSet.size === 0));
  const costUsd = Number((costMicrodollars / 1_000_000).toFixed(4));

  return {
    status: hasAnyTokenData ? "ok" : "no_data",
    sessions,
    agents: Array.from(agentsSet),
    models: Array.from(modelsSet),
    unpricedModels: Array.from(unpricedSet),
    subagentCount,
    inputTokens,
    cacheReadInputTokens,
    cacheCreationInputTokens,
    outputTokens,
    totalTokens,
    peakContextTokens,
    cacheHitRatePct,
    costMicrodollars,
    costUsd,
    hasCost,
    hasTokenData: hasAnyTokenData,
    breakdownCount,
  };
}

/**
 * Formata um número inteiro com separadores de milhar no padrão `pt-BR` / `en-US` legível.
 * @param {number} value
 * @returns {string}
 */
export function formatInt(value) {
  return Number(value || 0).toLocaleString("en-US");
}

/**
 * Renderiza a tabela Markdown padronizada para o corpo de Pull Requests e comentários no Azure Boards.
 * @param {ReturnType<typeof aggregateSessionUsages> & { fallbackReason?: string }} summary
 * @returns {string}
 */
export function formatUsageMarkdown(summary) {
  if (!summary || summary.status !== "ok" || !summary.hasTokenData) {
    const reason =
      summary?.fallbackReason ||
      "Sessão sem telemetria de tokens exposta (`n/a` — exit code 2/3 ou binário ausente).";
    return [
      "| Métrica Agêntica (AgentsView) | Valor |",
      "| :--- | :--- |",
      "| **Sessão(ões) Antigravity / Gemini** | `n/a` |",
      "| **Modelos Utilizados** | `n/a` |",
      "| **Subagentes Incluídos (Rollup)** | `0` |",
      "| **Input Tokens (Uncached)** | `n/a` |",
      "| **Cache Read Input Tokens** | `n/a` |",
      "| **Output Tokens (Gerados)** | `n/a` |",
      "| **Peak Context Window** | `n/a` |",
      "| **Custo Estimado da Entrega (USD)** | `n/a` |",
      "",
      `> ℹ️ *Fallback gracioso FinOps:* ${reason}`,
    ].join("\n");
  }

  const sessionsLabel = summary.sessions.map((s) => `\`${s}\``).join(", ");
  const modelsLabel =
    summary.models.length > 0
      ? summary.models.map((m) => `\`${m}\``).join(", ")
      : "`unknown`";

  let costLabel = `\`~$${summary.costUsd.toFixed(4)} USD\``;
  if (!summary.hasCost && summary.costMicrodollars === 0) {
    costLabel =
      summary.unpricedModels.length > 0
        ? `\`$0.0000 USD (unpriced: ${summary.unpricedModels.join(", ")})\``
        : "`n/a`";
  } else if (summary.unpricedModels.length > 0) {
    costLabel = `\`~$${summary.costUsd.toFixed(4)} USD (parcial — unpriced: ${summary.unpricedModels.join(", ")})\``;
  }

  const cacheCreationSuffix =
    summary.cacheCreationInputTokens > 0
      ? ` (+ \`${formatInt(summary.cacheCreationInputTokens)}\` cache write)`
      : "";

  return [
    "| Métrica Agêntica (AgentsView) | Valor |",
    "| :--- | :--- |",
    `| **Sessão(ões) Antigravity / Gemini** | ${sessionsLabel} |`,
    `| **Modelos Utilizados** | ${modelsLabel} |`,
    `| **Subagentes Incluídos (Rollup)** | \`${summary.subagentCount}\` (${summary.breakdownCount} steps) |`,
    `| **Input Tokens (Uncached)** | \`${formatInt(summary.inputTokens)}\` |`,
    `| **Cache Read Input Tokens** | \`${formatInt(summary.cacheReadInputTokens)}\` (\`${summary.cacheHitRatePct}%\` hit rate)${cacheCreationSuffix} |`,
    `| **Output Tokens (Gerados)** | \`${formatInt(summary.outputTokens)}\` |`,
    `| **Total de Tokens Processados** | \`${formatInt(summary.totalTokens)}\` |`,
    `| **Peak Context Window** | \`${formatInt(summary.peakContextTokens)}\` tokens |`,
    `| **Custo Estimado da Entrega (USD)** | **${costLabel}** |`,
  ].join("\n");
}

/**
 * Renderiza uma linha executiva enxuta para o comentário de resumo no Card Pai (`a-ado-us-summary`).
 * @param {ReturnType<typeof aggregateSessionUsages> & { fallbackReason?: string }} summary
 * @returns {string}
 */
export function formatUsageOneLiner(summary) {
  if (!summary || summary.status !== "ok" || !summary.hasTokenData) {
    return "**Telemetria FinOps (AgentsView):** `n/a` (sessão sem dados de tokens ou binário indisponível).";
  }
  const costText =
    summary.hasCost || summary.costMicrodollars > 0
      ? `~$${summary.costUsd.toFixed(4)} USD`
      : "n/a (unpriced)";
  const modelsText =
    summary.models.length > 0 ? summary.models.join(", ") : "Gemini";
  return `**Telemetria FinOps (AgentsView):** **${costText}** · \`${formatInt(summary.totalTokens)}\` tokens totais (\`${formatInt(summary.inputTokens)}\` in / \`${formatInt(summary.cacheReadInputTokens)}\` cache [${summary.cacheHitRatePct}%] / \`${formatInt(summary.outputTokens)}\` out · peak ctx \`${formatInt(summary.peakContextTokens)}\` · \`${summary.subagentCount}\` subagentes · modelo: \`${modelsText}\`).`;
}

/**
 * Faz o parse dos argumentos de linha de comando.
 * @param {string[]} argv
 */
export function parseCliArgs(argv) {
  const options = {
    mode: "pr", // "setup" | "pr" | "daily"
    sessions: /** @type {string[]} */ ([]),
    branch: "",
    baseBranch: "origin/main",
    card: "",
    since: "7d",
    format: "markdown", // "markdown" | "json" | "oneliner"
    sync: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "setup" || arg === "--setup") {
      options.mode = "setup";
    } else if (arg === "daily" || arg === "--daily") {
      options.mode = "daily";
    } else if (arg === "pr" || arg === "--pr") {
      options.mode = "pr";
    } else if (arg === "--session" && argv[i + 1]) {
      const parts = argv[++i]
        .split(",")
        .map((s) => normalizeSessionId(s))
        .filter(Boolean);
      options.sessions.push(...parts);
    } else if (arg.startsWith("--session=")) {
      const parts = arg
        .slice("--session=".length)
        .split(",")
        .map((s) => normalizeSessionId(s))
        .filter(Boolean);
      options.sessions.push(...parts);
    } else if (arg === "--branch" && argv[i + 1]) {
      options.branch = argv[++i];
    } else if (arg.startsWith("--branch=")) {
      options.branch = arg.slice("--branch=".length);
    } else if (arg === "--base" && argv[i + 1]) {
      options.baseBranch = argv[++i];
    } else if (arg.startsWith("--base=")) {
      options.baseBranch = arg.slice("--base=".length);
    } else if (arg === "--card" && argv[i + 1]) {
      options.card = String(argv[++i]).replace(/^#/, "");
    } else if (arg.startsWith("--card=")) {
      options.card = arg.slice("--card=".length).replace(/^#/, "");
    } else if (arg === "--since" && argv[i + 1]) {
      options.since = argv[++i];
    } else if (arg.startsWith("--since=")) {
      options.since = arg.slice("--since=".length);
    } else if (arg === "--format" && argv[i + 1]) {
      options.format = argv[++i].toLowerCase();
    } else if (arg.startsWith("--format=")) {
      options.format = arg.slice("--format=".length).toLowerCase();
    } else if (arg === "--json") {
      options.format = "json";
    } else if (arg === "--oneliner") {
      options.format = "oneliner";
    } else if (arg === "--sync") {
      options.sync = true;
    }
  }

  return options;
}

/**
 * Executa o binário `agentsview` com as variáveis de privacidade obrigatórias.
 * @param {string} binPath
 * @param {string[]} args
 * @returns {{ status: number, stdout: string, stderr: string }}
 */
function runAgentsView(binPath, args) {
  const result = spawnSync(binPath, args, {
    encoding: "utf-8",
    env: {
      ...process.env,
      AGENTSVIEW_TELEMETRY_ENABLED: "0",
      DO_NOT_TRACK: "1",
    },
    maxBuffer: 20 * 1024 * 1024,
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

/**
 * Descobre IDs de sessão relevantes quando `--session` não foi informado explicitamente.
 * Ordem de precedência:
 * 1. Variável de ambiente `ANTIGRAVITY_SESSION_ID` / `AGENT_SESSION_ID`
 * 2. Trailers `Agent-Session:` nos commits da branch atual (`git log`)
 * 3. Sessões com label `card=<ID>` ou `task=<ID>` no AgentsView
 * 4. Sessão mais recente de `antigravity` / `antigravity-cli` / `gemini` no arquivo local
 *
 * @param {string} binPath
 * @param {ReturnType<typeof parseCliArgs>} options
 * @returns {string[]}
 */
function discoverSessionIds(binPath, options) {
  const discovered = new Set(options.sessions);

  const envSession =
    process.env.ANTIGRAVITY_SESSION_ID || process.env.AGENT_SESSION_ID;
  if (envSession) {
    discovered.add(normalizeSessionId(envSession));
  }

  if (discovered.size > 0) {
    return Array.from(discovered);
  }

  // 1. Tentar extrair trailers Agent-Session do git log da branch e consultar commits no daemon local
  let commitShas = [];
  try {
    const range = options.branch
      ? `${options.baseBranch}..${options.branch}`
      : "-n 20";
    const gitArgs = options.branch
      ? ["log", range, "--format=%B"]
      : ["log", "-n", "20", "--format=%B"];
    const gitOut = execFileSync("git", gitArgs, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    for (const id of parseSessionIdsFromGitLog(gitOut)) {
      discovered.add(id);
    }

    const shaArgs = options.branch
      ? ["log", range, "--format=%H"]
      : ["log", "-n", "10", "--format=%H"];
    commitShas = execFileSync("git", shaArgs, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    // Ignorar se não estiver em um range válido do git
  }

  if (discovered.size > 0) {
    return Array.from(discovered);
  }

  // 1.B Se houver SHAs da branch, tentar consultar `agentsview why --commit <sha> --json`
  for (const sha of commitShas.slice(0, 5)) {
    const whyRes = runAgentsView(binPath, ["why", "--commit", sha, "--json"]);
    if (whyRes.status === 0 && whyRes.stdout.trim()) {
      try {
        const parsed = JSON.parse(whyRes.stdout);
        for (const s of parsed.sessions || []) {
          const sid = s.session_id || s.id;
          if (sid) discovered.add(normalizeSessionId(sid));
        }
      } catch {
        // ignore
      }
    }
  }

  if (discovered.size > 0) {
    return Array.from(discovered);
  }

  // 2. Se --card foi passado, procurar sessões rotuladas com card=<id> ou task=<id>
  if (options.card) {
    for (const labelKey of [`card=${options.card}`, `task=${options.card}`]) {
      const listRes = runAgentsView(binPath, [
        "session",
        "list",
        "--label",
        labelKey,
        "--limit",
        "10",
        "--json",
      ]);
      if (listRes.status === 0 && listRes.stdout.trim()) {
        try {
          const parsed = JSON.parse(listRes.stdout);
          for (const s of parsed.sessions || []) {
            if (s.id && ALLOWED_PROVIDERS.includes(s.agent)) {
              discovered.add(s.id);
            }
          }
        } catch {
          // ignore JSON parse errors
        }
      }
    }
  }

  if (discovered.size > 0) {
    return Array.from(discovered);
  }

  // 3. Fallback: pegar a sessão mais recente de antigravity / antigravity-cli / gemini
  const recentRes = runAgentsView(binPath, [
    "session",
    "list",
    "--limit",
    "5",
    "--json",
  ]);
  if (recentRes.status === 0 && recentRes.stdout.trim()) {
    try {
      const parsed = JSON.parse(recentRes.stdout);
      const match = (parsed.sessions || []).find((s) =>
        ALLOWED_PROVIDERS.includes(s.agent),
      );
      if (match?.id) {
        discovered.add(match.id);
      }
    } catch {
      // ignore
    }
  }

  return Array.from(discovered);
}

/**
 * Ponto de entrada principal da CLI.
 * @param {string[]} [argv]
 */
export function main(argv = process.argv.slice(2)) {
  const options = parseCliArgs(argv);
  const configStatus = ensureAgentsViewConfig();
  const binPath = resolveAgentsViewBinary();

  if (options.mode === "setup") {
    const payload = {
      status: "ok",
      configPath: configStatus.configPath,
      configUpdated: configStatus.updated,
      binaryInstalled: Boolean(binPath),
      binaryPath: binPath,
      allowedProviders: ALLOWED_PROVIDERS,
    };
    if (options.format === "json") {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log(
        `✅ AgentsView configurado em ${configStatus.configPath} (binário: ${binPath || "não instalado — fallback ativo"}).`,
      );
    }
    return 0;
  }

  // Fallback gracioso não-bloqueante se o binário não estiver instalado
  if (!binPath) {
    const emptySummary = {
      ...aggregateSessionUsages([]),
      fallbackReason:
        "Binário `agentsview` não encontrado no ambiente local (`~/.local/bin/agentsview`).",
    };
    if (options.format === "json") {
      console.log(JSON.stringify(emptySummary, null, 2));
    } else if (options.format === "oneliner") {
      console.log(formatUsageOneLiner(emptySummary));
    } else {
      console.log(formatUsageMarkdown(emptySummary));
    }
    return 0;
  }

  if (options.sync) {
    runAgentsView(binPath, ["source", "sync"]);
  }

  if (options.mode === "daily") {
    const dailyArgs = ["report", "usage", "daily", "--since", options.since];
    if (options.format === "json") {
      dailyArgs.push("--json");
    }
    const res = runAgentsView(binPath, dailyArgs);
    if (res.stdout.trim()) {
      console.log(res.stdout.trim());
    } else {
      console.log(
        options.format === "json"
          ? JSON.stringify({ status: "no_data", days: [] }, null, 2)
          : "Nenhum dado diário disponível no período solicitado.",
      );
    }
    return 0;
  }

  // Modo padrão: "pr" (telemetria por entrega / sessão)
  const sessionIds = discoverSessionIds(binPath, options);
  if (sessionIds.length === 0) {
    const emptySummary = {
      ...aggregateSessionUsages([]),
      fallbackReason:
        "Nenhuma sessão ativa do Antigravity/Gemini localizada para a entrega.",
    };
    if (options.format === "json") {
      console.log(JSON.stringify(emptySummary, null, 2));
    } else if (options.format === "oneliner") {
      console.log(formatUsageOneLiner(emptySummary));
    } else {
      console.log(formatUsageMarkdown(emptySummary));
    }
    return 0;
  }

  const reports = [];
  const errors = [];
  let syncedSources = false;

  for (const id of sessionIds) {
    const usageArgs = ["session", "usage", id, "--format", "json"];
    if (!options.sync) {
      usageArgs.push("--no-sync");
    }
    let res = runAgentsView(binPath, usageArgs);

    // Se --no-sync retornou 2 (sessão ainda não indexada no SQLite), força 1 `source sync` antes do retry
    if (res.status === 2) {
      if (!syncedSources) {
        runAgentsView(binPath, ["source", "sync"]);
        syncedSources = true;
      }
      res = runAgentsView(binPath, [
        "session",
        "usage",
        id,
        "--format",
        "json",
      ]);
    }

    if ((res.status === 0 || res.status === 3) && res.stdout.trim()) {
      try {
        const parsed = JSON.parse(res.stdout);
        reports.push(parsed);
      } catch {
        errors.push(`Falha ao parsear JSON da sessão ${id}`);
      }
    } else if (res.status === 2) {
      errors.push(`Sessão ${id} não encontrada no arquivo local (exit 2).`);
    } else if (res.status === 3) {
      errors.push(`Sessão ${id} não possui dados de tokens/custo (exit 3).`);
    } else {
      errors.push(
        `Erro ao consultar sessão ${id} (exit ${res.status}): ${res.stderr.trim() || "sem detalhes"}`,
      );
    }
  }

  const aggregated = {
    ...aggregateSessionUsages(reports),
    ...(errors.length > 0 ? { fallbackReason: errors.join(" | ") } : {}),
  };

  if (options.format === "json") {
    console.log(JSON.stringify(aggregated, null, 2));
  } else if (options.format === "oneliner") {
    console.log(formatUsageOneLiner(aggregated));
  } else {
    console.log(formatUsageMarkdown(aggregated));
  }

  return 0;
}

const isDirectExecution =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  process.exitCode = main();
}
