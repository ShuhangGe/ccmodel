import fs from "fs";
import path from "path";
import os from "os";
import { t } from "./i18n.js";

const CONFIG_DIR = path.join(os.homedir(), ".ccmodel");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface ProviderConfig {
  apiKey?: string;
  defaultModel?: string;
}

export interface AppConfig {
  providers: Record<string, ProviderConfig>;
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateAppConfig(parsed: unknown): AppConfig | null {
  if (!isPlainObject(parsed)) return null;
  const providers = (parsed as Record<string, unknown>).providers;
  if (!isPlainObject(providers)) return null;

  const clean: Record<string, ProviderConfig> = {};
  for (const [id, value] of Object.entries(providers)) {
    if (!isPlainObject(value)) continue;
    const apiKey = typeof value.apiKey === "string" ? value.apiKey : undefined;
    const defaultModel =
      typeof value.defaultModel === "string" ? value.defaultModel : undefined;
    clean[id] = { apiKey, defaultModel };
  }
  return { providers: clean };
}

function quarantineCorruptConfig(reason: string): void {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${CONFIG_FILE}.corrupt-${stamp}`;
    fs.renameSync(CONFIG_FILE, backupPath);
    console.error(
      t("config.corruptBackup", { reason, path: backupPath })
    );
  } catch (renameErr) {
    console.error(
      t("config.corruptNoBackup", {
        reason,
        error: (renameErr as Error).message,
        path: CONFIG_FILE,
      })
    );
  }
}

export function loadConfig(): AppConfig {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    return { providers: {} };
  }

  let raw: string;
  try {
    raw = fs.readFileSync(CONFIG_FILE, "utf-8");
  } catch (err) {
    quarantineCorruptConfig(t("config.readFail", { error: (err as Error).message }));
    return { providers: {} };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    quarantineCorruptConfig(t("config.parseFail", { error: (err as Error).message }));
    return { providers: {} };
  }

  const validated = validateAppConfig(parsed);
  if (!validated) {
    quarantineCorruptConfig(t("config.invalid"));
    return { providers: {} };
  }

  return validated;
}

export function saveConfig(config: AppConfig): void {
  ensureConfigDir();
  const tmpFile = CONFIG_FILE + ".tmp";
  fs.writeFileSync(tmpFile, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
  fs.renameSync(tmpFile, CONFIG_FILE);
}

export function getProviderApiKey(providerId: string): string | undefined {
  const config = loadConfig();
  const key = config.providers[providerId]?.apiKey;
  return key && key.length > 0 ? key : undefined;
}

export function setProviderApiKey(providerId: string, apiKey: string): void {
  const config = loadConfig();
  const existing = config.providers[providerId];
  if (existing) {
    existing.apiKey = apiKey;
  } else {
    config.providers[providerId] = { apiKey };
  }
  saveConfig(config);
}

export function getDefaultModel(providerId: string): string | undefined {
  const config = loadConfig();
  return config.providers[providerId]?.defaultModel;
}

export function setDefaultModel(
  providerId: string,
  modelId: string
): void {
  const config = loadConfig();
  const existing = config.providers[providerId];
  if (existing) {
    existing.defaultModel = modelId;
  } else {
    config.providers[providerId] = { defaultModel: modelId };
  }
  saveConfig(config);
}
