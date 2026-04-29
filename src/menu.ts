import { select, password, confirm } from "@inquirer/prompts";
import providers, { Provider, ModelOption } from "./providers.js";
import {
  loadConfig,
  getProviderApiKey,
  setProviderApiKey,
  getDefaultModel,
  setDefaultModel,
} from "./config.js";
import { t } from "./i18n.js";

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

function providerName(p: Provider): string {
  return t("prov." + p.id);
}

async function selectProvider(): Promise<Provider | null> {
  const config = loadConfig();
  const choices = providers.map((p) => {
    const hasKey = !!config.providers[p.id]?.apiKey;
    const keySuffix = hasKey
      ? " (API Key: " + maskKey(config.providers[p.id].apiKey!) + ")"
      : " (" + t("menu.notConfigured") + ")";
    const warnSuffix = p.warning ? t("menu.incompatible") : "";
    return {
      name: providerName(p) + keySuffix + warnSuffix,
      value: p.id,
    };
  });
  choices.unshift({ name: t("menu.back"), value: "__back__" });

  const providerId = await select({
    message: t("menu.selectProvider"),
    choices,
    loop: false,
  });

  if (providerId === "__back__") return null;
  return providers.find((p) => p.id === providerId)!;
}

async function warnIfIncompatible(provider: Provider): Promise<boolean> {
  if (!provider.warning) return true;
  console.log(`\n⚠ ${t("warn." + provider.warning)}`);
  return confirm({
    message: t("menu.continueAnyway"),
    default: false,
  });
}

async function selectModel(provider: Provider): Promise<ModelOption | null> {
  const defaultModel = getDefaultModel(provider.id);
  const choices = provider.models.map((m) => ({
    name: m.name + (m.id === defaultModel ? t("menu.default") : ""),
    value: m.id,
  }));
  choices.unshift({ name: t("menu.back"), value: "__back__" });

  const modelId = await select({
    message: t("menu.selectModel", { provider: providerName(provider) }),
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
      ? t("menu.hasApiKey", { provider: providerName(provider), key: maskKey(existing) })
      : t("menu.noApiKey", { provider: providerName(provider) }),
    choices: [
      { name: t("menu.back"), value: "back" },
      {
        name: existing ? t("menu.reenter") : t("menu.enterApiKeyLabel"),
        value: "input",
      },
      ...(existing ? [{ name: t("menu.keep"), value: "keep" }] : []),
    ],
  });

  if (action === "back") return null;
  if (action === "keep") return existing!;

  while (true) {
    const apiKey = await password({
      message: t("menu.enterApiKeyPrompt", { provider: providerName(provider) }),
      mask: "*",
    });

    if (!apiKey) return null;
    if (apiKey.trim().length < 8) {
      const retry = await confirm({
        message: t("menu.keyTooShort"),
        default: true,
      });
      if (!retry) return null;
      continue;
    }

    const trimmed = apiKey.trim();
    setProviderApiKey(provider.id, trimmed);
    console.log(t("menu.keySaved"));
    return trimmed;
  }
}

async function resolveModel(provider: Provider): Promise<ModelOption | null> {
  if (provider.models.length === 0) {
    console.log(t("menu.noModels"));
    return null;
  }

  if (provider.models.length === 1) {
    return provider.models[0];
  }

  const defaultId = getDefaultModel(provider.id);
  const defaultMatch = defaultId
    ? provider.models.find((m) => m.id === defaultId)
    : undefined;

  const selected = await selectModel(provider);
  if (!selected) return null;

  if (selected.id !== defaultMatch?.id) {
    const makeDefault = await confirm({
      message: t("menu.setDefault", {
        model: selected.name,
        provider: providerName(provider),
      }),
      default: false,
    });
    if (makeDefault) setDefaultModel(provider.id, selected.id);
  }
  return selected;
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

    if (!(await warnIfIncompatible(provider))) continue;

    let apiKey: string | undefined = getProviderApiKey(provider.id);
    if (!apiKey) {
      apiKey = (await promptApiKey(provider)) ?? undefined;
      if (!apiKey) continue;
    }

    const model = await resolveModel(provider);
    if (!model) continue;

    return { provider, model, apiKey };
  }
}

export async function manageApiKey(): Promise<void> {
  while (true) {
    const provider = await selectProvider();
    if (!provider) return;
    await promptApiKey(provider);
  }
}
