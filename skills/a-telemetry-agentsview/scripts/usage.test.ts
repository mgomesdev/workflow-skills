import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALLOWED_PROVIDERS,
  DEFAULT_DISABLED_AGENTS,
  aggregateSessionUsages,
  buildAgentsViewConfigToml,
  ensureAgentsViewConfig,
  formatUsageMarkdown,
  formatUsageOneLiner,
  main,
  normalizeSessionId,
  parseCliArgs,
  parseSessionIdsFromGitLog,
} from "./usage.mjs";

describe("AgentsView Usage & FinOps CLI (a-telemetry-agentsview/scripts/usage.mjs)", () => {
  describe("normalizeSessionId", () => {
    it("deve prefixar UUID puro com antigravity:", () => {
      expect(normalizeSessionId("00000000-0000-4000-8000-000000000001")).toBe(
        "antigravity:00000000-0000-4000-8000-000000000001",
      );
    });

    it("deve preservar IDs que já possuem prefixo de provider", () => {
      expect(
        normalizeSessionId("antigravity:00000000-0000-4000-8000-000000000001"),
      ).toBe("antigravity:00000000-0000-4000-8000-000000000001");
      expect(normalizeSessionId("antigravity-cli:abc-123")).toBe(
        "antigravity-cli:abc-123",
      );
      expect(normalizeSessionId("gemini:xyz-999")).toBe("gemini:xyz-999");
    });

    it("deve retornar string vazia para entradas vazias", () => {
      expect(normalizeSessionId("")).toBe("");
      expect(normalizeSessionId("   ")).toBe("");
    });
  });

  describe("buildAgentsViewConfigToml & ensureAgentsViewConfig", () => {
    it("deve gerar config.toml com disable_update_check = true, providers ociosos desabilitados e tarifas do Gemini 4 Argon", () => {
      const toml = buildAgentsViewConfigToml();
      expect(toml).toContain("disable_update_check = true");
      expect(toml).toContain("disabled_agents =");
      expect(toml).toContain('"claude"');
      expect(toml).toContain('"codex"');
      expect(toml).not.toContain('"antigravity"');
      expect(toml).not.toContain('"antigravity-cli"');
      expect(toml).not.toContain('"gemini"');
      // Garantir que nenhum agente import-only (ex: claude-ai, chatgpt, gemini-apps) está em disabled_agents
      expect(DEFAULT_DISABLED_AGENTS).not.toContain("claude-ai");
      expect(DEFAULT_DISABLED_AGENTS).not.toContain("chatgpt");
      expect(DEFAULT_DISABLED_AGENTS).not.toContain("gemini-apps");
      expect(ALLOWED_PROVIDERS).toEqual([
        "antigravity",
        "antigravity-cli",
        "gemini",
      ]);
      expect(toml).toContain('[custom_model_pricing."Gemini 4 Argon (Low)"]');
      expect(toml).toContain('[custom_model_pricing."Gemini 4 Argon (XHigh)"]');
      expect(toml).toContain('[custom_model_pricing."Gemini 4 Neon (High)"]');
      expect(toml).toContain('[custom_model_pricing."Gemini 4 Neon (XHigh)"]');
      expect(toml).toContain('[custom_model_pricing."Claude Sonnet 5.5 (XHigh)"]');
      expect(toml).toContain('[custom_model_pricing."Claude Opus 5.5 (High)"]');
      expect(toml).toContain('[custom_model_pricing."Claude Opus 5.5 (XHigh)"]');
    });

    it("deve criar e preservar config.toml idempotente em diretório temporário", () => {
      const tempDir = mkdtempSync(join(tmpdir(), "agentsview-test-"));
      try {
        const first = ensureAgentsViewConfig(tempDir);
        expect(first.updated).toBe(true);
        const content = readFileSync(first.configPath, "utf-8");
        expect(content).toContain("disable_update_check = true");

        const second = ensureAgentsViewConfig(tempDir);
        expect(second.updated).toBe(false);

        // Se arquivo estiver incompleto, deve atualizar
        writeFileSync(first.configPath, "# empty\n", "utf-8");
        const third = ensureAgentsViewConfig(tempDir);
        expect(third.updated).toBe(true);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe("parseSessionIdsFromGitLog", () => {
    it("deve extrair múltiplos trailers Agent-Session sem duplicatas e normalizar UUIDs", () => {
      const logOutput = `
feat(telemetry): adicionar script de custo (#151)

Agent-Session: antigravity:00000000-0000-4000-8000-000000000001

chore(wiki): atualizar stack tecnica (#151)

  Agent-Session: 00000000-0000-4000-8000-000000000002
  Agent-Session: antigravity:00000000-0000-4000-8000-000000000001
`;
      const ids = parseSessionIdsFromGitLog(logOutput);
      expect(ids).toEqual([
        "antigravity:00000000-0000-4000-8000-000000000001",
        "antigravity:00000000-0000-4000-8000-000000000002",
      ]);
    });
  });

  describe("aggregateSessionUsages", () => {
    it("deve somar tokens de input/cache/output, manter o máximo de peak_context_tokens e converter microdollars para USD", () => {
      const reports = [
        {
          session_id: "antigravity:session-1",
          agent: "antigravity",
          total_output_tokens: 1500,
          peak_context_tokens: 120000,
          has_token_data: true,
          cost: { microdollars: 1_250_000 },
          has_cost: true,
          models: ["Gemini 4 Argon (Low)"],
          unpriced_models: [],
          subagent_count: 2,
          breakdown_count: 2,
          breakdown: [
            {
              ordinal: 1,
              model: "Gemini 4 Argon (Low)",
              input_tokens: 10000,
              cache_read_input_tokens: 40000,
              cache_creation_input_tokens: 5000,
              output_tokens: 800,
            },
            {
              ordinal: 2,
              model: "Gemini 4 Argon (Low)",
              subagent_session_id: "antigravity:sub-1",
              input_tokens: 5000,
              cache_read_input_tokens: 20000,
              cache_creation_input_tokens: 0,
              output_tokens: 700,
            },
          ],
        },
        {
          session_id: "antigravity-cli:session-2",
          agent: "antigravity-cli",
          total_output_tokens: 500,
          peak_context_tokens: 185000,
          has_token_data: true,
          cost: { microdollars: 750_000 },
          has_cost: true,
          models: ["Gemini 3.8 Flash (Low)"],
          unpriced_models: [],
          subagent_count: 1,
          breakdown_count: 1,
          breakdown: [
            {
              ordinal: 1,
              model: "Gemini 3.8 Flash (Low)",
              input_tokens: 5000,
              cache_read_input_tokens: 15000,
              cache_creation_input_tokens: 0,
              output_tokens: 500,
            },
          ],
        },
      ];

      const summary = aggregateSessionUsages(reports);
      expect(summary.status).toBe("ok");
      expect(summary.sessions).toEqual([
        "antigravity:session-1",
        "antigravity-cli:session-2",
      ]);
      expect(summary.agents).toEqual(["antigravity", "antigravity-cli"]);
      expect(summary.models).toEqual([
        "Gemini 4 Argon (Low)",
        "Gemini 3.8 Flash (Low)",
      ]);
      expect(summary.subagentCount).toBe(3);
      expect(summary.inputTokens).toBe(20000);
      expect(summary.cacheReadInputTokens).toBe(75000);
      expect(summary.cacheCreationInputTokens).toBe(5000);
      expect(summary.outputTokens).toBe(2000);
      expect(summary.totalTokens).toBe(102000);
      // Peak context é high-water mark (Math.max(120000, 185000)), nunca soma!
      expect(summary.peakContextTokens).toBe(185000);
      expect(summary.cacheHitRatePct).toBe(75);
      expect(summary.costMicrodollars).toBe(2_000_000);
      expect(summary.costUsd).toBe(2);
      expect(summary.hasCost).toBe(true);
    });

    it("deve somar custo parcial do breakdown quando a sessão possuir um modelo unpriced e report.cost zerado", () => {
      const summary = aggregateSessionUsages([
        {
          session_id: "antigravity:partial-1",
          agent: "antigravity",
          total_output_tokens: 1000,
          peak_context_tokens: 50000,
          has_token_data: true,
          cost: { microdollars: 0 },
          has_cost: false,
          models: ["Gemini 4 Argon (High)", "Unknown Experimental"],
          unpriced_models: ["Unknown Experimental"],
          subagent_count: 0,
          breakdown_count: 2,
          breakdown: [
            {
              model: "Gemini 4 Argon (High)",
              input_tokens: 10000,
              cache_read_input_tokens: 0,
              output_tokens: 500,
              cost: { microdollars: 250_000 },
            },
            {
              model: "Unknown Experimental",
              input_tokens: 5000,
              cache_read_input_tokens: 0,
              output_tokens: 500,
              cost: { microdollars: 0 },
            },
          ],
        },
      ]);

      expect(summary.costMicrodollars).toBe(250_000);
      expect(summary.costUsd).toBe(0.25);
      expect(summary.unpricedModels).toEqual(["Unknown Experimental"]);
      expect(formatUsageMarkdown(summary)).toContain(
        "`~$0.2500 USD (parcial — unpriced: Unknown Experimental)`",
      );
    });

    it("deve retornar status no_data quando a lista de sessões estiver vazia ou sem tokens", () => {
      const empty = aggregateSessionUsages([]);
      expect(empty.status).toBe("no_data");
      expect(empty.hasTokenData).toBe(false);
      expect(empty.costUsd).toBe(0);
    });
  });

  describe("formatUsageMarkdown & formatUsageOneLiner", () => {
    it("deve renderizar a tabela Markdown completa quando houver dados de tokens", () => {
      const summary = aggregateSessionUsages([
        {
          session_id: "antigravity:00000000-0000-4000-8000-000000000001",
          agent: "antigravity",
          total_output_tokens: 2500,
          peak_context_tokens: 150000,
          has_token_data: true,
          cost: { microdollars: 1_500_000 },
          has_cost: true,
          models: ["Gemini 4 Argon (Low)"],
          subagent_count: 1,
          breakdown_count: 10,
          breakdown: [
            {
              input_tokens: 20000,
              cache_read_input_tokens: 80000,
              cache_creation_input_tokens: 0,
              output_tokens: 2500,
            },
          ],
        },
      ]);

      const md = formatUsageMarkdown(summary);
      expect(md).toContain("| Métrica Agêntica (AgentsView) | Valor |");
      expect(md).toContain("`antigravity:00000000-0000-4000-8000-000000000001`");
      expect(md).toContain("`Gemini 4 Argon (Low)`");
      expect(md).toContain("`1` (10 steps)");
      expect(md).toContain("`~$1.5000 USD`");

      const oneLiner = formatUsageOneLiner(summary);
      expect(oneLiner).toContain("~$1.5000 USD");
      expect(oneLiner).toContain("102,500");
    });

    it("deve renderizar fallback gracioso não-bloqueante (n/a) quando não houver dados", () => {
      const empty = {
        ...aggregateSessionUsages([]),
        fallbackReason: "Sessão retornou exit code 3 (sem dados de tokens).",
      };
      const md = formatUsageMarkdown(empty);
      expect(md).toContain("| **Custo Estimado da Entrega (USD)** | `n/a` |");
      expect(md).toContain("Sessão retornou exit code 3");

      const oneLiner = formatUsageOneLiner(empty);
      expect(oneLiner).toContain("`n/a`");
    });
  });

  describe("parseCliArgs & fallback main()", () => {
    it("deve parsear flags de CLI corretamente", () => {
      const opts = parseCliArgs([
        "--session",
        "00000000-0000-4000-8000-000000000001,gemini:abc",
        "--branch",
        "feat/us-116-task-151",
        "--base=origin/feat/us-116",
        "--card",
        "#151",
        "--json",
      ]);
      expect(opts.sessions).toEqual([
        "antigravity:00000000-0000-4000-8000-000000000001",
        "gemini:abc",
      ]);
      expect(opts.branch).toBe("feat/us-116-task-151");
      expect(opts.baseBranch).toBe("origin/feat/us-116");
      expect(opts.card).toBe("151");
      expect(opts.format).toBe("json");
    });

    it("deve retornar exit code 0 no modo setup", () => {
      const code = main(["setup", "--json"]);
      expect(code).toBe(0);
    });
  });
});
