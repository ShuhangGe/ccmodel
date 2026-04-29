import { spawn } from "child_process";
import fs from "fs";
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
  "API_TIMEOUT_MS",
  "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC",
]);

function buildChildEnv(target: LaunchTarget): Record<string, string> {
  const { provider, model, apiKey } = target;
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v === undefined) continue;
    if (ENV_STRIP_EXACT.has(k)) continue;
    cleaned[k] = v;
  }
  cleaned.ANTHROPIC_MODEL = model.id;
  cleaned.ANTHROPIC_AUTH_TOKEN = apiKey;
  for (const [k, v] of Object.entries(provider.env)) {
    cleaned[k] = v;
  }
  return cleaned;
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
  const { provider, model } = target;
  const claudeCommand = resolveClaudeCommand();
  const env = buildChildEnv(target);

  console.log(`\n  ${t("launch.starting")}`);
  console.log(`  ${t("launch.provider")} ${t("prov." + provider.id)}`);
  console.log(`  ${t("launch.model")}   ${model.name} (${model.id})`);
  console.log(`  Base:   ${provider.baseUrl}`);
  console.log(`  Claude: ${claudeCommand}\n`);

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
