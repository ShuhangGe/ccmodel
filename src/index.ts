#!/usr/bin/env node

import { select } from "@inquirer/prompts";
import { mainMenu, manageApiKey } from "./menu.js";
import { launchClaude } from "./launcher.js";

async function main(): Promise<void> {
  while (true) {
    const action = await select({
      message: "选择操作:",
      choices: [
        { name: "选择模型并启动 Claude Code", value: "launch" },
        { name: "添加/修改 API Key", value: "key" },
        { name: "退出", value: "quit" },
      ],
    });

    if (action === "quit") {
      process.exit(0);
    }

    if (action === "key") {
      await manageApiKey();
      continue;
    }

    const target = await mainMenu();
    if (target) {
      launchClaude(target);
    }
  }
}

main().catch((err) => {
  console.error("错误:", err.message);
  process.exit(1);
});
