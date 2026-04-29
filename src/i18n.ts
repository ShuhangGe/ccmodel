export type Lang = "zh" | "en";

let current: Lang = detect();

function detect(): Lang {
  const env = process.env.CCMODEL_LANG;
  if (env === "en") return "en";
  if (env === "zh") return "zh";
  const locale = process.env.LANG ?? process.env.LC_ALL ?? "";
  if (/^zh/i.test(locale)) return "zh";
  return "zh";
}

export function getLang(): Lang {
  return current;
}
export function setLang(l: Lang): void {
  current = l;
}

type Vars = Record<string, string>;

const S: Record<string, { zh: string; en: string }> = {
  // ── Main menu (index.ts) ──────────────────────────────
  "main.action": { zh: "选择操作:", en: "Select action:" },
  "main.launch": {
    zh: "选择模型并启动 Claude Code",
    en: "Select model & launch Claude Code",
  },
  "main.key": { zh: "添加/修改 API Key", en: "Add / modify API Key" },
  "main.lang": { zh: "语言 / Language", en: "语言 / Language" },
  "main.exit": { zh: "退出", en: "Exit" },
  "main.error": { zh: "错误: ", en: "Error: " },
  "lang.select": { zh: "选择语言 / Select language:", en: "选择语言 / Select language:" },

  // ── Help text (index.ts) ──────────────────────────────
  "help.usage": { zh: "用法:", en: "Usage:" },
  "help.start": { zh: "启动交互式菜单", en: "Start interactive menu" },
  "help.version": { zh: "显示版本号", en: "Show version" },
  "help.showHelp": { zh: "显示帮助", en: "Show help" },
  "help.env": { zh: "环境变量:", en: "Environment variables:" },
  "help.claudePath": {
    zh: "显式指定 claude 可执行文件路径",
    en: "Specify claude binary path explicitly",
  },
  "help.configDir": {
    zh: "指定隔离的 Claude Code 配置目录",
    en: "Specify isolated Claude Code config directory",
  },
  "help.useUserConfig": {
    zh: "使用用户原始 ~/.claude 配置（不推荐用于切换 provider）",
    en: "Use the user's normal ~/.claude config (not recommended for provider switching)",
  },
  "help.debugEnv": {
    zh: "启动前打印传给 claude 的关键环境变量（token 会打码）",
    en: "Print key env passed to claude before launch (tokens are masked)",
  },

  // ── Menu chrome (menu.ts) ─────────────────────────────
  "menu.back": { zh: "← 返回", en: "← Back" },
  "menu.notConfigured": { zh: "未配置", en: "Not configured" },
  "menu.incompatible": { zh: "  ⚠ 不兼容", en: "  ⚠ Incompatible" },
  "menu.selectProvider": { zh: "选择模型提供商:", en: "Select model provider:" },
  "menu.continueAnyway": { zh: "仍然继续?", en: "Continue anyway?" },
  "menu.selectMainModel": {
    zh: "选择 {provider} 的主模型 (对话 + Opus/Sonnet 任务):",
    en: "Select main model for {provider} (chat + Opus/Sonnet tasks):",
  },
  "menu.selectFastModel": {
    zh: "选择 {provider} 的快模型 (Haiku + subagent，回车 = 与主模型相同):",
    en: "Select fast model for {provider} (Haiku + subagent, Enter = same as main):",
  },
  "menu.sameAsMain": { zh: " [与主模型相同]", en: " [same as main]" },
  "menu.default": { zh: " [默认]", en: " [Default]" },
  "menu.enterModelId": {
    zh: "输入 {provider} 的模型 ID (留空取消):",
    en: "Enter model ID for {provider} (empty to cancel):",
  },
  "menu.enterMainModelId": {
    zh: "输入 {provider} 的主模型 ID (留空取消):",
    en: "Enter main model ID for {provider} (empty to cancel):",
  },
  "menu.enterFastModelId": {
    zh: "输入 {provider} 的快模型 ID (留空取消，默认与主模型相同):",
    en: "Enter fast model ID for {provider} (empty to cancel, default = main model):",
  },
  "menu.hasApiKey": {
    zh: "{provider} 已有 API Key ({key})",
    en: "{provider} has API Key ({key})",
  },
  "menu.noApiKey": {
    zh: "{provider} 未配置 API Key",
    en: "{provider} API Key not configured",
  },
  "menu.reenter": { zh: "重新输入", en: "Re-enter" },
  "menu.enterApiKeyLabel": { zh: "输入 API Key", en: "Enter API Key" },
  "menu.keep": { zh: "保持不变", en: "Keep unchanged" },
  "menu.enterApiKeyPrompt": {
    zh: "输入 {provider} 的 API Key (留空取消):",
    en: "Enter API Key for {provider} (empty to cancel):",
  },
  "menu.keyTooShort": {
    zh: "API Key 长度过短 (至少 8 位)。重新输入?",
    en: "API Key too short (min 8 chars). Re-enter?",
  },
  "menu.keySaved": {
    zh: "API Key 已保存到 ~/.ccmodel/config.json",
    en: "API Key saved to ~/.ccmodel/config.json",
  },
  "menu.noModels": {
    zh: "该提供商未配置模型，请手动指定 ANTHROPIC_MODEL 或更新 provider 列表",
    en: "No models configured. Set ANTHROPIC_MODEL manually or update provider list",
  },
  "menu.setDefault": {
    zh: "将 {model} 设为 {provider} 的默认模型?",
    en: "Set {model} as default model for {provider}?",
  },

  // ── Launcher (launcher.ts) ────────────────────────────
  "launch.warnNotExec": {
    zh: "警告: CCMODEL_CLAUDE_PATH 不可执行，改用 PATH 查找: {path}",
    en: "Warning: CCMODEL_CLAUDE_PATH not executable, falling back to PATH: {path}",
  },
  "launch.warnMultiple": {
    zh: "警告: PATH 中发现多个 claude，可设置 CCMODEL_CLAUDE_PATH 指定可信路径:",
    en: "Warning: Multiple claude found in PATH. Set CCMODEL_CLAUDE_PATH to pin a trusted path:",
  },
  "launch.starting": { zh: "启动 Claude Code", en: "Launching Claude Code" },
  "launch.provider": { zh: "提供商:", en: "Provider:" },
  "launch.model": { zh: "主模型:", en: "Main model:" },
  "launch.fastModel": { zh: "快模型:", en: "Fast model:" },
  "launch.configDir": { zh: "配置目录:", en: "Config dir:" },
  "launch.failed": {
    zh: "启动 Claude Code 失败:",
    en: "Failed to launch Claude Code:",
  },
  "launch.installHint": {
    zh: "请确认已安装 claude: npm install -g @anthropic-ai/claude-code",
    en: "Please confirm claude is installed: npm install -g @anthropic-ai/claude-code",
  },

  // ── Config errors (config.ts) ─────────────────────────
  "config.corruptBackup": {
    zh: "⚠ 配置文件损坏 ({reason})，已备份到 {path}。将以空配置继续运行。",
    en: "⚠ Config corrupted ({reason}), backed up to {path}. Continuing with empty config.",
  },
  "config.corruptNoBackup": {
    zh: "⚠ 配置文件损坏 ({reason})，且备份失败: {error}。请手动检查 {path}。",
    en: "⚠ Config corrupted ({reason}), backup also failed: {error}. Please check {path}.",
  },
  "config.readFail": { zh: "读取失败: {error}", en: "Read failed: {error}" },
  "config.parseFail": {
    zh: "JSON 解析失败: {error}",
    en: "JSON parse failed: {error}",
  },
  "config.invalid": {
    zh: "结构与 AppConfig 不符",
    en: "Structure doesn't match AppConfig",
  },

  // ── Provider display names ────────────────────────────
  "prov.anthropic": { zh: "Anthropic (官方)", en: "Anthropic (Official)" },
  "prov.deepseek": { zh: "DeepSeek", en: "DeepSeek" },
  "prov.glm": { zh: "GLM 智谱 (国内)", en: "GLM Zhipu (CN)" },
  "prov.glm-intl": { zh: "GLM 智谱 (国际)", en: "GLM Zhipu (International)" },
  "prov.qwen": { zh: "Qwen 通义千问 (百炼)", en: "Qwen (Bailian)" },
  "prov.qwen-coding": {
    zh: "Qwen 通义千问 (百炼 Coding)",
    en: "Qwen (Bailian Coding)",
  },
  "prov.kimi": { zh: "Kimi 月之暗面", en: "Kimi (Moonshot)" },
  "prov.kimi-coding": { zh: "Kimi (Coding Plan)", en: "Kimi (Coding Plan)" },
  "prov.minimax": { zh: "MiniMax (国内)", en: "MiniMax (CN)" },
  "prov.minimax-intl": { zh: "MiniMax (国际)", en: "MiniMax (International)" },
  "prov.openai": { zh: "OpenAI", en: "OpenAI" },
  "prov.siliconflow": { zh: "硅基流动 (国内)", en: "SiliconFlow (CN)" },
  "prov.siliconflow-intl": {
    zh: "硅基流动 (国际)",
    en: "SiliconFlow (International)",
  },
  "prov.stepfun": { zh: "阶跃星辰 (国内)", en: "StepFun (CN)" },
  "prov.stepfun-intl": { zh: "阶跃星辰 (国际)", en: "StepFun (International)" },
  "prov.openrouter": { zh: "OpenRouter", en: "OpenRouter" },
  "prov.doubao": { zh: "豆包 Doubao (字节)", en: "Doubao (ByteDance)" },
  "prov.mimo": { zh: "小米 MiMo", en: "Xiaomi MiMo" },
  "prov.github-copilot": { zh: "GitHub Copilot", en: "GitHub Copilot" },
  "prov.gemini": { zh: "Google Gemini", en: "Google Gemini" },
  "prov.novita": { zh: "Novita AI", en: "Novita AI" },

  // ── Provider warnings ─────────────────────────────────
  "warn.incompatible-openai": {
    zh: "OpenAI 原生 API 与 Anthropic 协议不兼容，直接使用会失败；需自行搭建协议转换代理。",
    en: "OpenAI API is not compatible with the Anthropic protocol. A protocol adapter proxy is required.",
  },
  "warn.incompatible-copilot": {
    zh: "GitHub Copilot endpoint 需要专用 Copilot 订阅 token 与鉴权头，直接使用 ANTHROPIC_AUTH_TOKEN 会失败。",
    en: "GitHub Copilot endpoint requires a Copilot subscription token. ANTHROPIC_AUTH_TOKEN won't work.",
  },
  "warn.incompatible-gemini": {
    zh: "Gemini 原生 API 与 Anthropic 协议不兼容，直接使用会失败；需自行搭建协议转换代理。",
    en: "Gemini API is not compatible with the Anthropic protocol. A protocol adapter proxy is required.",
  },
  "warn.unverified-doubao": {
    zh: "豆包当前配置使用未公开确认的 Anthropic 兼容 Coding endpoint；模型 ID 已按官方 Seed 2.0 命名保守设置，但仍可能需要账号权限或专属 endpoint。",
    en: "Doubao currently uses an Anthropic-compatible Coding endpoint that is not publicly documented. Model IDs use conservative official Seed 2.0 naming, but account access or a dedicated endpoint may still be required.",
  },
};

export function t(key: string, vars?: Vars): string {
  const entry = S[key];
  if (!entry) return key;
  let s = entry[current];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }
  return s;
}
