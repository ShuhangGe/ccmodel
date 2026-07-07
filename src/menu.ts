import { select, password, confirm, input, checkbox } from "@inquirer/prompts";
import providers, { Provider, ModelOption } from "./providers.js";
import {
  loadConfig,
  getProviderApiKey,
  setProviderApiKey,
  getDefaultModel,
  setDefaultModel,
  getLaunchOptions,
  setLaunchOptions,
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

async function selectMainModel(provider: Provider): Promise<ModelOption | null> {
  const defaultModel = getDefaultModel(provider.id);
  const choices = provider.models.map((m) => ({
    name: m.name + (m.id === defaultModel ? t("menu.default") : ""),
    value: m.id,
  }));
  choices.unshift({ name: t("menu.back"), value: "__back__" });

  const modelId = await select({
    message: t("menu.selectMainModel", { provider: providerName(provider) }),
    choices,
    loop: false,
  });

  if (modelId === "__back__") return null;
  return provider.models.find((m) => m.id === modelId)!;
}

async function selectFastModel(
  provider: Provider,
  main: ModelOption
): Promise<ModelOption | null> {
  const choices = provider.models.map((m) => ({
    name: m.name + (m.id === main.id ? t("menu.sameAsMain") : ""),
    value: m.id,
  }));
  choices.unshift({ name: t("menu.back"), value: "__back__" });

  const modelId = await select({
    message: t("menu.selectFastModel", { provider: providerName(provider) }),
    choices,
    default: main.id,
    loop: false,
  });

  if (modelId === "__back__") return null;
  return provider.models.find((m) => m.id === modelId)!;
}

async function promptCustomModel(
  provider: Provider,
  kind: "main" | "fast",
  defaultValue?: string
): Promise<ModelOption | null> {
  const modelId = await input({
    message: t(
      kind === "main" ? "menu.enterMainModelId" : "menu.enterFastModelId",
      { provider: providerName(provider) }
    ),
    default: defaultValue,
  });
  const trimmed = modelId.trim();
  if (!trimmed) return null;
  return { id: trimmed, name: trimmed };
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

async function resolveModels(
  provider: Provider
): Promise<{ main: ModelOption; fast: ModelOption } | null> {
  if (provider.models.length === 0) {
    if (!provider.allowCustomModel) {
      console.log(t("menu.noModels"));
      return null;
    }
    const main = await promptCustomModel(provider, "main");
    if (!main) return null;
    const fast = await promptCustomModel(provider, "fast", main.id);
    if (!fast) return null;
    return { main, fast };
  }

  const defaultId = getDefaultModel(provider.id);
  const defaultMatch = defaultId
    ? provider.models.find((m) => m.id === defaultId)
    : undefined;

  const main = await selectMainModel(provider);
  if (!main) return null;

  const fast = await selectFastModel(provider, main);
  if (!fast) return null;

  if (main.id !== defaultMatch?.id) {
    const makeDefault = await confirm({
      message: t("menu.setDefault", {
        model: main.name,
        provider: providerName(provider),
      }),
      default: false,
    });
    if (makeDefault) setDefaultModel(provider.id, main.id);
  }
  return { main, fast };
}

interface LaunchArgPreset {
  key: string;
  flag: string;
  labelKey: string;
}

const LAUNCH_ARG_PRESETS: LaunchArgPreset[] = [
  { key: "continue", flag: "--continue", labelKey: "menu.argContinue" },
  { key: "resume", flag: "--resume", labelKey: "menu.argResume" },
  {
    key: "skip-permissions",
    flag: "--dangerously-skip-permissions",
    labelKey: "menu.argSkipPerms",
  },
];

const CUSTOM_ARGS_KEY = "custom";

export async function selectLaunchArgs(): Promise<string[]> {
  const saved = getLaunchOptions();
  const savedPresets = new Set(saved.presets ?? []);

  const choices = LAUNCH_ARG_PRESETS.map((p) => ({
    name: t(p.labelKey),
    value: p.key,
    checked: savedPresets.has(p.key),
  }));
  choices.push({
    name: t("menu.argCustom"),
    value: CUSTOM_ARGS_KEY,
    checked: savedPresets.has(CUSTOM_ARGS_KEY),
  });

  const selected = await checkbox({
    message: t("menu.launchArgs"),
    choices,
    loop: false,
    validate: (items) => {
      const keys = items.map((i) => i.value);
      if (keys.includes("continue") && keys.includes("resume")) {
        return t("menu.argConflict");
      }
      return true;
    },
  });

  const args: string[] = [];
  for (const preset of LAUNCH_ARG_PRESETS) {
    if (selected.includes(preset.key)) args.push(preset.flag);
  }

  let custom = saved.custom;
  if (selected.includes(CUSTOM_ARGS_KEY)) {
    const entered = await input({
      message: t("menu.enterCustomArgs"),
      default: saved.custom,
    });
    custom = entered.trim();
    if (custom) {
      args.push(...custom.split(/\s+/));
    }
  }

  setLaunchOptions({ presets: selected, custom });
  return args;
}

export interface LaunchTarget {
  provider: Provider;
  model: ModelOption;
  fastModel: ModelOption;
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

    const models = await resolveModels(provider);
    if (!models) continue;

    return { provider, model: models.main, fastModel: models.fast, apiKey };
  }
}

export async function manageApiKey(): Promise<void> {
  while (true) {
    const provider = await selectProvider();
    if (!provider) return;
    await promptApiKey(provider);
  }
}
