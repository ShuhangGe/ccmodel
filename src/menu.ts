import { select, password } from "@inquirer/prompts";
import providers, { Provider, ModelOption } from "./providers.js";
import {
  loadConfig,
  getProviderApiKey,
  setProviderApiKey,
  getDefaultModel,
} from "./config.js";

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

async function selectProvider(): Promise<Provider | null> {
  const config = loadConfig();
  const choices = providers.map((p) => {
    const hasKey = !!config.providers[p.id]?.apiKey;
    const suffix = hasKey ? " (API Key: " + maskKey(config.providers[p.id].apiKey) + ")" : " (未配置)";
    return {
      name: p.name + suffix,
      value: p.id,
    };
  });
  choices.unshift({ name: "← 返回", value: "__back__" });

  const providerId = await select({
    message: "选择模型提供商:",
    choices,
    loop: false,
  });

  if (providerId === "__back__") return null;
  return providers.find((p) => p.id === providerId)!;
}

async function selectModel(provider: Provider): Promise<ModelOption | null> {
  const defaultModel = getDefaultModel(provider.id);
  const choices = provider.models.map((m) => ({
    name: m.name + (m.id === defaultModel ? " [默认]" : ""),
    value: m.id,
  }));
  choices.unshift({ name: "← 返回", value: "__back__" });

  const modelId = await select({
    message: `选择 ${provider.name} 的模型:`,
    choices,
    loop: false,
  });

  if (modelId === "__back__") return null;
  return provider.models.find((m) => m.id === modelId)!;
}

async function promptApiKey(provider: Provider): Promise<string | null> {
  const existing = getProviderApiKey(provider.id);
  const action = await select({
    message: existing
      ? `${provider.name} 已有 API Key (${maskKey(existing)})`
      : `${provider.name} 未配置 API Key`,
    choices: [
      { name: "← 返回", value: "back" },
      { name: existing ? "重新输入" : "输入 API Key", value: "input" },
      ...(existing ? [{ name: "保持不变", value: "keep" }] : []),
    ],
  });

  if (action === "back") return null;
  if (action === "keep") return existing!;

  const apiKey = await password({
    message: `输入 ${provider.name} 的 API Key:`,
    mask: "*",
  });

  if (!apiKey || apiKey.trim().length < 8) {
    console.log("API Key 长度过短 (至少 8 位)");
    return null;
  }

  setProviderApiKey(provider.id, apiKey.trim());
  console.log(`API Key 已保存到 ~/.ccmodel/config.json`);

  return apiKey.trim();
}

export interface LaunchTarget {
  provider: Provider;
  model: ModelOption;
  apiKey: string;
}

export async function mainMenu(): Promise<LaunchTarget | null> {
  while (true) {
    console.log("\n  Claude Code Model Launcher\n");

    const provider = await selectProvider();
    if (!provider) return null;

    let apiKey: string | undefined = getProviderApiKey(provider.id);
    if (!apiKey) {
      apiKey = (await promptApiKey(provider)) ?? undefined;
      if (!apiKey) continue;
    }

    let model = provider.models[0];
    if (provider.models.length > 1) {
      const selected = await selectModel(provider);
      if (!selected) continue;
      model = selected;
    }

    if (!model) {
      console.log("该提供商未配置模型，请手动指定 ANTHROPIC_MODEL");
      continue;
    }

    return { provider, model, apiKey };
  }
}

export async function manageApiKey(): Promise<void> {
  while (true) {
    const provider = await selectProvider();
    if (!provider) return;

    const result = await promptApiKey(provider);
    if (!result) continue;
  }
}
