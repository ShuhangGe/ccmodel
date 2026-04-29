#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { select } from "@inquirer/prompts";
import { mainMenu, manageApiKey } from "./menu.js";
import { launchClaude } from "./launcher.js";
import { t, setLang, type Lang } from "./i18n.js";

function readPackageMeta(): { name: string; version: string } {
  try {
    const pkgPath = path.join(__dirname, "..", "package.json");
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(raw) as { name?: string; version?: string };
    return { name: pkg.name ?? "ccmodel", version: pkg.version ?? "0.0.0" };
  } catch {
    return { name: "ccmodel", version: "0.0.0" };
  }
}

function printHelp(meta: { name: string; version: string }): void {
  console.log(`${meta.name} v${meta.version}`);
  console.log("");
  console.log(t("help.usage"));
  console.log("  ccmodel                " + t("help.start"));
  console.log("  ccmodel --version      " + t("help.version"));
  console.log("  ccmodel --help         " + t("help.showHelp"));
  console.log("");
  console.log(t("help.env"));
  console.log("  CCMODEL_CLAUDE_PATH   " + t("help.claudePath"));
}

function handleCliFlags(): boolean {
  const args = process.argv.slice(2);
  const meta = readPackageMeta();

  if (args.includes("--version") || args.includes("-v")) {
    console.log(meta.version);
    return true;
  }
  if (args.includes("--help") || args.includes("-h")) {
    printHelp(meta);
    return true;
  }
  return false;
}

function isUserAbortError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: unknown }).name;
  return name === "ExitPromptError" || name === "AbortPromptError";
}

async function main(): Promise<void> {
  while (true) {
    const action = await select({
      message: t("main.action"),
      choices: [
        { name: t("main.launch"), value: "launch" },
        { name: t("main.key"), value: "key" },
        { name: t("main.lang"), value: "lang" },
        { name: t("main.exit"), value: "quit" },
      ],
    });

    if (action === "quit") {
      process.exit(0);
    }

    if (action === "lang") {
      const newLang = await select({
        message: t("lang.select"),
        choices: [
          { name: "中文", value: "zh" },
          { name: "English", value: "en" },
        ],
      });
      setLang(newLang as Lang);
      continue;
    }

    if (action === "key") {
      await manageApiKey();
      continue;
    }

    const target = await mainMenu();
    if (target) {
      const exitCode = await launchClaude(target);
      process.exit(exitCode);
    }
  }
}

if (!handleCliFlags()) {
  main().catch((err) => {
    if (isUserAbortError(err)) {
      process.exit(130);
    }
    console.error(t("main.error"), err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
