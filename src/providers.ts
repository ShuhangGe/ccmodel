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
}

const providers: Provider[] = [
  // ===== Anthropic 官方 =====
  {
    id: "anthropic",
    name: "Anthropic (官方)",
    baseUrl: "https://api.anthropic.com",
    models: [
      { id: "claude-opus-4-7", name: "Claude Opus 4.7" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
    ],
    env: {},
  },

  // ===== DeepSeek =====
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/anthropic",
    models: [
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro" },
      { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash" },
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
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: [
      { id: "qwen3.6-plus", name: "Qwen3.6 Plus" },
      { id: "qwen3.5-plus", name: "Qwen3.5 Plus" },
      { id: "qwen-plus", name: "Qwen Plus (快速)" },
      { id: "qwen3-coder-plus", name: "Qwen3 Coder Plus" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== Qwen 通义千问 (百炼 For Coding) =====
  {
    id: "qwen-coding",
    name: "Qwen 通义千问 (百炼 Coding)",
    baseUrl: "https://coding.dashscope.aliyuncs.com/apps/anthropic",
    models: [
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
      { id: "kimi-k2.6", name: "Kimi K2.6" },
      { id: "kimi-k2.5", name: "Kimi K2.5" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.moonshot.cn/anthropic",
    },
  },

  // ===== Kimi For Coding =====
  {
    id: "kimi-coding",
    name: "Kimi (Coding Plan)",
    baseUrl: "https://api.kimi.com/coding/",
    models: [],
    env: {
      ANTHROPIC_BASE_URL: "https://api.kimi.com/coding/",
    },
  },

  // ===== MiniMax (国内) =====
  {
    id: "minimax",
    name: "MiniMax (国内)",
    baseUrl: "https://api.minimaxi.com/anthropic",
    models: [
      { id: "MiniMax-M2.7", name: "MiniMax M2.7" },
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
      { id: "MiniMax-M2.7", name: "MiniMax M2.7" },
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
      { id: "gpt-5.5-pro", name: "GPT-5.5 Pro" },
      { id: "gpt-5.5", name: "GPT-5.5" },
      { id: "gpt-5.4-mini", name: "GPT-5.4 Mini" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.openai.com/v1",
    },
  },

  // ===== 硅基流动 SiliconFlow (国内) =====
  {
    id: "siliconflow",
    name: "硅基流动 (国内)",
    baseUrl: "https://api.siliconflow.cn",
    models: [
      { id: "Pro/MiniMaxAI/MiniMax-M2.7", name: "MiniMax M2.7 Pro" },
    ],
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
      { id: "MiniMaxAI/MiniMax-M2.7", name: "MiniMax M2.7" },
    ],
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
      { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6" },
      { id: "anthropic/claude-opus-4.7", name: "Claude Opus 4.7" },
      { id: "deepseek/deepseek-v4", name: "DeepSeek V4" },
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
      { id: "doubao-seed-2-0-code-preview-latest", name: "Doubao Seed 2.0" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://ark.cn-beijing.volces.com/api/coding",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== 小米 MiMo =====
  {
    id: "mimo",
    name: "小米 MiMo",
    baseUrl: "https://api.xiaomimimo.com/anthropic",
    models: [
      { id: "mimo-v2-pro", name: "MiMo V2 Pro" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.xiaomimimo.com/anthropic",
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  },

  // ===== GitHub Copilot =====
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    baseUrl: "https://api.githubcopilot.com",
    models: [
      { id: "claude-sonnet-4.6", name: "Claude Sonnet 4.6" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.githubcopilot.com",
    },
  },

  // ===== Google Gemini =====
  {
    id: "gemini",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    models: [
      { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://generativelanguage.googleapis.com",
    },
  },

  // ===== Novita AI =====
  {
    id: "novita",
    name: "Novita AI",
    baseUrl: "https://api.novita.ai/anthropic",
    models: [
      { id: "zai-org/glm-5.1", name: "GLM-5.1" },
      { id: "moonshotai/kimi-k2.5", name: "Kimi K2.5" },
      { id: "moonshotai/kimi-k2.6", name: "Kimi K2.6" },
    ],
    env: {
      ANTHROPIC_BASE_URL: "https://api.novita.ai/anthropic",
    },
  },
];

export default providers;
