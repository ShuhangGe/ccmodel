import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import type { LaunchTarget } from "./menu.js";
import { t } from "./i18n.js";

const ENV_STRIP_EXACT = new Set<string>([
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_AUTH_TOKEN",
  "ANTHROPIC_BASE_URL",
  "ANTHROPIC_MODEL",
  "ANTHROPIC_SMALL_FAST_MODEL",
  "ANTHROPIC_DEFAULT_SONNET_MODEL",
  "ANTHROPIC_DEFAULT_OPUS_MODEL",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL",
  "CLAUDE_CODE_SUBAGENT_MODEL",
  "CLAUDE_CONFIG_DIR",
  "API_TIMEOUT_MS",
  "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC",
]);

function resolveClaudeConfigDir(): string | undefined {
  if (process.env.CCMODEL_USE_USER_CLAUDE_CONFIG === "1") {
    return undefined;
  }

  const configured = process.env.CCMODEL_CLAUDE_CONFIG_DIR;
  const dir = configured
    ? path.resolve(configured)
    : path.join(os.homedir(), ".ccmodel", "claude-config");

  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}

function buildChildEnv(target: LaunchTarget): Record<string, string> {
  const { provider, model, fastModel, apiKey } = target;
  const claudeConfigDir = resolveClaudeConfigDir();
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v === undefined) continue;
    if (ENV_STRIP_EXACT.has(k)) continue;
    cleaned[k] = v;
  }

  cleaned.ANTHROPIC_AUTH_TOKEN = apiKey;
  cleaned.ANTHROPIC_MODEL = model.id;
  cleaned.ANTHROPIC_DEFAULT_OPUS_MODEL = model.id;
  cleaned.ANTHROPIC_DEFAULT_SONNET_MODEL = model.id;
  cleaned.ANTHROPIC_DEFAULT_HAIKU_MODEL = fastModel.id;
  cleaned.CLAUDE_CODE_SUBAGENT_MODEL = fastModel.id;
  // Deprecated alias that older Claude Code versions still honor.
  cleaned.ANTHROPIC_SMALL_FAST_MODEL = fastModel.id;

  for (const [k, v] of Object.entries(provider.env)) {
    cleaned[k] = v;
  }

  if (claudeConfigDir) {
    cleaned.CLAUDE_CONFIG_DIR = claudeConfigDir;
  }

  return cleaned;
}

function dumpEnvForDebug(env: Record<string, string>): void {
  const keys = [
    "ANTHROPIC_BASE_URL",
    "ANTHROPIC_AUTH_TOKEN",
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_MODEL",
    "ANTHROPIC_DEFAULT_OPUS_MODEL",
    "ANTHROPIC_DEFAULT_SONNET_MODEL",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL",
    "ANTHROPIC_SMALL_FAST_MODEL",
    "CLAUDE_CODE_SUBAGENT_MODEL",
    "CLAUDE_CONFIG_DIR",
    "API_TIMEOUT_MS",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC",
  ];
  console.log("\n  [debug] env to be passed to claude:");
  for (const k of keys) {
    const raw = env[k];
    if (raw === undefined) {
      console.log(`    ${k}=(unset)`);
      continue;
    }
    const shown = k.endsWith("TOKEN") || k.endsWith("API_KEY")
      ? raw.slice(0, 4) + "****" + raw.slice(-4)
      : raw;
    console.log(`    ${k}=${shown}`);
  }
  console.log();
}

function isExecutable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function getExecutableNames(command: string): string[] {
  if (process.platform !== "win32") return [command];

  const extensions = (process.env.PATHEXT ?? ".EXE;.CMD;.BAT")
    .split(";")
    .filter(Boolean);
  return path.extname(command)
    ? [command]
    : extensions.map((extension) => `${command}${extension.toLowerCase()}`);
}

function resolveClaudeCommand(): string {
  const configuredPath = process.env.CCMODEL_CLAUDE_PATH;
  if (configuredPath) {
    if (isExecutable(configuredPath)) return configuredPath;
    console.warn(t("launch.warnNotExec", { path: configuredPath }));
  }

  const pathEntries = (process.env.PATH ?? "")
    .split(path.delimiter)
    .filter(Boolean);
  const candidates: string[] = [];

  for (const dir of pathEntries) {
    for (const name of getExecutableNames("claude")) {
      const candidate = path.join(dir, name);
      if (isExecutable(candidate)) candidates.push(candidate);
    }
  }

  if (candidates.length > 1) {
    console.warn(t("launch.warnMultiple"));
    for (const candidate of candidates) {
      console.warn(`  ${candidate}`);
    }
  }

  return candidates[0] ?? "claude";
}

function resetTerminal(): void {
  if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
    try {
      process.stdin.setRawMode(false);
    } catch {}
  }
  process.stdin.pause();
}

export function launchClaude(target: LaunchTarget): Promise<number> {
  const { provider, model, fastModel } = target;
  const claudeCommand = resolveClaudeCommand();
  const env = buildChildEnv(target);

  console.log(`\n  ${t("launch.starting")}`);
  console.log(`  ${t("launch.provider")}   ${t("prov." + provider.id)}`);
  console.log(`  ${t("launch.model")}     ${model.name} (${model.id})`);
  console.log(`  ${t("launch.fastModel")} ${fastModel.name} (${fastModel.id})`);
  console.log(`  Base:       ${provider.baseUrl}`);
  if (env.CLAUDE_CONFIG_DIR) {
    console.log(`  ${t("launch.configDir")} ${env.CLAUDE_CONFIG_DIR}`);
  }
  console.log(`  Claude:     ${claudeCommand}\n`);

  if (process.env.CCMODEL_DEBUG_ENV === "1") {
    dumpEnvForDebug(env);
  }

  resetTerminal();

  const useShell = process.platform === "win32";

  return new Promise<number>((resolve) => {
    const child = spawn(claudeCommand, process.argv.slice(2), {
      stdio: "inherit",
      env,
      shell: useShell,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        resolve(128);
        return;
      }
      resolve(code ?? 0);
    });

    child.on("error", (err) => {
      console.error(t("launch.failed"), err.message);
      console.error(t("launch.installHint"));
      resolve(1);
    });
  });
}
