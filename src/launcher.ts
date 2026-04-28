import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import type { LaunchTarget } from "./menu.js";

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
    console.warn(`警告: CCMODEL_CLAUDE_PATH 不可执行，改用 PATH 查找: ${configuredPath}`);
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
    console.warn("警告: PATH 中发现多个 claude，可设置 CCMODEL_CLAUDE_PATH 指定可信路径:");
    for (const candidate of candidates) {
      console.warn(`  ${candidate}`);
    }
  }

  return candidates[0] ?? "claude";
}

export function launchClaude(target: LaunchTarget): void {
  const { provider, model, apiKey } = target;
  const claudeCommand = resolveClaudeCommand();

  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    ANTHROPIC_MODEL: model.id,
    ANTHROPIC_AUTH_TOKEN: apiKey,
    ...provider.env,
  };

  console.log(`\n  启动 Claude Code`);
  console.log(`  提供商: ${provider.name}`);
  console.log(`  模型:   ${model.name} (${model.id})`);
  console.log(`  Base:   ${provider.baseUrl}`);
  console.log(`  Claude: ${claudeCommand}\n`);

  const child = spawn(claudeCommand, process.argv.slice(2), {
    stdio: "inherit",
    env,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    console.error("启动 Claude Code 失败:", err.message);
    console.error("请确认已安装 claude: npm install -g @anthropic-ai/claude-code");
    process.exit(1);
  });
}
