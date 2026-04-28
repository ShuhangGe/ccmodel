import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".ccmodel");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export interface ProviderConfig {
  apiKey: string;
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

export function loadConfig(): AppConfig {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    return { providers: {} };
  }
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as AppConfig;
  } catch {
    return { providers: {} };
  }
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
  return config.providers[providerId]?.apiKey;
}

export function setProviderApiKey(providerId: string, apiKey: string): void {
  const config = loadConfig();
  if (!config.providers[providerId]) {
    config.providers[providerId] = { apiKey };
  } else {
    config.providers[providerId].apiKey = apiKey;
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
  if (!config.providers[providerId]) {
    config.providers[providerId] = { apiKey: "", defaultModel: modelId };
  } else {
    config.providers[providerId].defaultModel = modelId;
  }
  saveConfig(config);
}
