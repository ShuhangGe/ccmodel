export interface ModelOption {
  id: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  models: ModelOption[];
  env: Record<string, string>;
  /** 警告文案，例如该 endpoint 协议不兼容 Anthropic API */
  warning?: string;
  /** 允许用户手动输入模型 ID，适用于专属 Coding Plan / 私有 endpoint */
  allowCustomModel?: boolean;
}

const providers: Provider[] = [
  // ===== Anthropic 官方 =====
  {
    id: "anthropic",
    name: "Anthropic (官方)",
    baseUrl: "https://api.anthropic.com",
    models: [
      { id: "claude-fable-5-1", name: "Claude Fable 5.1" },
      { id: "claude-opus-5", name: "Claude Opus 5" },
      { id: "claude-sonnet-5", name: "Claude Sonnet 5" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
      { id: "claude-fable-5", name: "Claude Fable 5" },
      { id: "claude-opus-4-8", name: "Claude Opus 4.8" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.anthropic.com",
    },
  },

  // ===== DeepSeek =====
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/anthropic",
    models: [
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro" },
      { id: "deepseek-flash", name: "DeepSeek V4.1 Flash" },
      { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash (routes to V4.1)" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== GLM 智谱 (国内) =====
  {
    id: "glm",
    name: "GLM 智谱 (国内)",
    baseUrl: "https://open.bigmodel.cn/api/anthropic",
    models: [
      { id: "glm-5.3", name: "GLM-5.3" },
      { id: "glm-5.3[1m]", name: "GLM-5.3 (1M context)" },
      { id: "glm-5.2", name: "GLM-5.2" },
      { id: "glm-5.2[1m]", name: "GLM-5.2 (1M context)" },
      { id: "glm-5.1", name: "GLM-5.1" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://open.bigmodel.cn/api/anthropic",
      API_TIMEOUT_MS: "3000000",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== GLM 智谱 (国际) =====
  {
    id: "glm-intl",
    name: "GLM 智谱 (国际)",
    baseUrl: "https://api.z.ai/api/anthropic",
    models: [
      { id: "glm-5.3", name: "GLM-5.3" },
      { id: "glm-5.3[1m]", name: "GLM-5.3 (1M context)" },
      { id: "glm-5.2", name: "GLM-5.2" },
      { id: "glm-5.2[1m]", name: "GLM-5.2 (1M context)" },
      { id: "glm-5.1", name: "GLM-5.1" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
      API_TIMEOUT_MS: "3000000",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== Qwen 通义千问 (百炼) =====
  {
    id: "qwen",
    name: "Qwen 通义千问 (百炼)",
    baseUrl: "https://dashscope.aliyuncs.com/apps/anthropic",
    models: [
      { id: "qwen3.8-max", name: "Qwen3.8 Max" },
      { id: "qwen3.8-flash", name: "Qwen3.8 Flash" },
      { id: "qwen3.7-max", name: "Qwen3.7 Max" },
      { id: "qwen3.7-plus", name: "Qwen3.7 Plus" },
      { id: "qwen3-max", name: "Qwen3 Max" },
      { id: "qwen3-coder-next", name: "Qwen3 Coder Next" },
      { id: "qwen3-coder-plus", name: "Qwen3 Coder Plus" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://dashscope.aliyuncs.com/apps/anthropic",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== Qwen 通义千问 (百炼 For Coding) =====
  {
    id: "qwen-coding",
    name: "Qwen 通义千问 (百炼 Coding)",
    baseUrl: "https://coding.dashscope.aliyuncs.com/apps/anthropic",
    models: [
      { id: "qwen3.7-plus", name: "Qwen3.7 Plus" },
      { id: "qwen3-coder-plus", name: "Qwen3 Coder Plus" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://coding.dashscope.aliyuncs.com/apps/anthropic",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== Kimi 月之暗面 =====
  {
    id: "kimi",
    name: "Kimi 月之暗面",
    baseUrl: "https://api.moonshot.cn/anthropic",
    models: [
      { id: "kimi-k3", name: "Kimi K3" },
      { id: "kimi-k2.7-code", name: "Kimi K2.7 Code" },
      { id: "kimi-k2.7-code-highspeed", name: "Kimi K2.7 Code (High Speed)" },
      { id: "kimi-k2.6", name: "Kimi K2.6" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.moonshot.cn/anthropic",
    },
  },

  // ===== Kimi For Coding =====
  {
    id: "kimi-coding",
    name: "Kimi (Coding Plan)",
    baseUrl: "https://api.kimi.ai/coding/",
    models: [
      { id: "k3-256k", name: "Kimi K3 (256K context)" },
      { id: "k3[1m]", name: "Kimi K3 (1M context)" },
      { id: "kimi-for-coding", name: "Kimi for Coding (K2.8 Preview)" },
      { id: "kimi-for-coding-highspeed", name: "Kimi for Coding High Speed (Pro+)" },
    ],
    allowCustomModel: true,
    env: {
      ANTHROPIC_BASE_URL: "https://api.kimi.ai/coding/",
    },
  },

  // ===== MiniMax (国内) =====
  {
    id: "minimax",
    name: "MiniMax (国内)",
    baseUrl: "https://api.minimaxi.com/anthropic",
    models: [
      { id: "MiniMax-M3", name: "MiniMax M3" },
      { id: "MiniMax-M2.7", name: "MiniMax M2.7" },
      { id: "MiniMax-M2.5", name: "MiniMax M2.5" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.minimaxi.com/anthropic",
      API_TIMEOUT_MS: "3000000",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== MiniMax (国际) =====
  {
    id: "minimax-intl",
    name: "MiniMax (国际)",
    baseUrl: "https://api.minimax.io/anthropic",
    models: [
      { id: "MiniMax-M3", name: "MiniMax M3" },
      { id: "MiniMax-M2.7", name: "MiniMax M2.7" },
      { id: "MiniMax-M2.5", name: "MiniMax M2.5" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.minimax.io/anthropic",
      API_TIMEOUT_MS: "3000000",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== OpenAI =====
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: [
      { id: "gpt-6-astra", name: "GPT-6 Astra" },
      { id: "gpt-5.6-sol", name: "GPT-5.6 Sol" },
      { id: "gpt-5.6-terra", name: "GPT-5.6 Terra" },
      { id: "gpt-5.6-luna", name: "GPT-5.6 Luna" },
      { id: "gpt-5.5", name: "GPT-5.5" },
      { id: "gpt-5.4", name: "GPT-5.4" },
      { id: "gpt-5.4-mini", name: "GPT-5.4 Mini" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.openai.com/v1",
    },
    warning: "incompatible-openai",
  },

  // ===== 硅基流动 SiliconFlow (国内) =====
  {
    id: "siliconflow",
    name: "硅基流动 (国内)",
    baseUrl: "https://api.siliconflow.cn",
    models: [
      { id: "Pro/MiniMaxAI/MiniMax-M3", name: "MiniMax M3 Pro" },
      { id: "Pro/MiniMaxAI/MiniMax-M2.7", name: "MiniMax M2.7 Pro" },
    ],
    allowCustomModel: true,
    env: {
      ANTHROPIC_BASE_URL: "https://api.siliconflow.cn",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== 硅基流动 SiliconFlow (国际) =====
  {
    id: "siliconflow-intl",
    name: "硅基流动 (国际)",
    baseUrl: "https://api.siliconflow.com",
    models: [
      { id: "MiniMaxAI/MiniMax-M3", name: "MiniMax M3" },
      { id: "MiniMaxAI/MiniMax-M2.7", name: "MiniMax M2.7" },
    ],
    allowCustomModel: true,
    env: {
      ANTHROPIC_BASE_URL: "https://api.siliconflow.com",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== 阶跃星辰 StepFun (国内) =====
  {
    id: "stepfun",
    name: "阶跃星辰 (国内)",
    baseUrl: "https://api.stepfun.com/step_plan",
    models: [
      { id: "step-3.7-flash", name: "Step 3.7 Flash" },
      { id: "step-3.5-flash-2603", name: "Step 3.5 Flash" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.stepfun.com/step_plan",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== 阶跃星辰 StepFun (国际) =====
  {
    id: "stepfun-intl",
    name: "阶跃星辰 (国际)",
    baseUrl: "https://api.stepfun.ai/step_plan",
    models: [
      { id: "step-3.7-flash", name: "Step 3.7 Flash" },
      { id: "step-3.5-flash-2603", name: "Step 3.5 Flash" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.stepfun.ai/step_plan",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== OpenRouter =====
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api",
    models: [
      { id: "anthropic/claude-fable-5.1", name: "Claude Fable 5.1" },
      { id: "anthropic/claude-opus-5", name: "Claude Opus 5" },
      { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5" },
      { id: "anthropic/claude-opus-4.8", name: "Claude Opus 4.8" },
      { id: "openai/gpt-6-astra", name: "GPT-6 Astra" },
      { id: "z-ai/glm-5.3", name: "GLM-5.3" },
      { id: "deepseek/deepseek-v4", name: "DeepSeek V4" },
      { id: "moonshotai/kimi-k3", name: "Kimi K3" },
      { id: "moonshotai/kimi-k2.6", name: "Kimi K2.6" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://openrouter.ai/api",
    },
  },

  // ===== 豆包 Doubao (字节) =====
  {
    id: "doubao",
    name: "豆包 Doubao (字节)",
    baseUrl: "https://ark.cn-beijing.volces.com/api/coding",
    models: [
      { id: "ark-code-latest", name: "Ark Code Latest (auto-routes to newest)" },
      { id: "doubao-seed-evolving", name: "Doubao Seed Evolving" },
      { id: "doubao-seed-2-1-pro-260628", name: "Doubao Seed 2.1 Pro" },
      { id: "doubao-seed-2-1-turbo-260628", name: "Doubao Seed 2.1 Turbo" },
      { id: "doubao-seed-2-0-code", name: "Doubao Seed 2.0 Code" },
      { id: "doubao-seed-2-0-pro", name: "Doubao Seed 2.0 Pro" },
      { id: "doubao-seed-2-0-lite", name: "Doubao Seed 2.0 Lite" },
      { id: "doubao-seed-2-0-mini", name: "Doubao Seed 2.0 Mini" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://ark.cn-beijing.volces.com/api/coding",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
    warning: "unverified-doubao",
  },

  // ===== 小米 MiMo =====
  // V2 系列已于 2026-06-30 下线，仅保留 V2.5 模型。
  {
    id: "mimo",
    name: "小米 MiMo",
    baseUrl: "https://api.xiaomimimo.com/anthropic",
    models: [
      { id: "mimo-v2.5-pro", name: "MiMo V2.5 Pro" },
      { id: "mimo-v2.5-pro[1m]", name: "MiMo V2.5 Pro (1M context)" },
      { id: "mimo-v2.5-pro-ultraspeed", name: "MiMo V2.5 Pro UltraSpeed" },
      { id: "mimo-v2.5", name: "MiMo V2.5" },
    ],
    allowCustomModel: true,
    env: {
      ANTHROPIC_BASE_URL: "https://api.xiaomimimo.com/anthropic",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== 小米 MiMo Token Plan（订阅制，API Key 格式 tp-xxxxx）=====
  {
    id: "mimo-tokenplan",
    name: "小米 MiMo (Token Plan)",
    baseUrl: "https://token-plan-cn.xiaomimimo.com/anthropic",
    models: [
      { id: "mimo-v2.5-pro", name: "MiMo V2.5 Pro" },
      { id: "mimo-v2.5-pro[1m]", name: "MiMo V2.5 Pro (1M context)" },
      { id: "mimo-v2.5-pro-ultraspeed", name: "MiMo V2.5 Pro UltraSpeed" },
      { id: "mimo-v2.5", name: "MiMo V2.5" },
    ],
    allowCustomModel: true,
    env: {
      ANTHROPIC_BASE_URL: "https://token-plan-cn.xiaomimimo.com/anthropic",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== GitHub Copilot =====
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    baseUrl: "https://api.githubcopilot.com",
    models: [
      { id: "claude-sonnet-5", name: "Claude Sonnet 5" },
      { id: "claude-opus-5", name: "Claude Opus 5" },
      { id: "claude-fable-5", name: "Claude Fable 5" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.githubcopilot.com",
    },
    warning: "incompatible-copilot",
  },

  // ===== Google Gemini =====
  {
    id: "gemini",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    models: [
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash" },
      { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (Preview)" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://generativelanguage.googleapis.com",
    },
    warning: "incompatible-gemini",
  },

  // ===== Novita AI =====
  {
    id: "novita",
    name: "Novita AI",
    baseUrl: "https://api.novita.ai/anthropic",
    models: [
      { id: "zai-org/glm-5.3", name: "GLM-5.3" },
      { id: "zai-org/glm-5.2", name: "GLM-5.2" },
      { id: "zai-org/glm-5.1", name: "GLM-5.1" },
      { id: "moonshotai/kimi-k3", name: "Kimi K3" },
      { id: "moonshotai/kimi-k2.6", name: "Kimi K2.6" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.novita.ai/anthropic",
    },
  },
];

export default providers;
