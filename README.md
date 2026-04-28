# @shuhang/ccmodel

Interactive CLI tool to switch AI model providers and launch Claude Code. Run `npx @shuhang/ccmodel`, pick a provider, enter your API key, select a model, and Claude Code starts with the right config.

## Quick Start

```bash
npx @shuhang/ccmodel
```

No global install needed.

## What It Does

```
  Claude Code Model Launcher

? 选择操作:
❯ 选择模型并启动 Claude Code
  添加/修改 API Key
  退出
```

Select a provider → enter API key → pick a model → Claude Code launches with the correct environment variables.

## Supported Providers

19 provider configs across domestic (CN) and international endpoints:

| Provider | Region | Base URL | Models |
|----------|--------|----------|--------|
| Anthropic | Global | `api.anthropic.com` | Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 |
| DeepSeek | Global | `api.deepseek.com/anthropic` | DeepSeek V4 Pro, V4 Flash |
| GLM (智谱) | CN | `open.bigmodel.cn/api/anthropic` | GLM-5 |
| GLM (智谱) | International | `api.z.ai/api/anthropic` | GLM-5 |
| Qwen (通义千问) | CN | `dashscope.aliyuncs.com/compatible-mode/v1` | Qwen3.6 Plus, Qwen3.5 Plus, Qwen Plus, Qwen3 Coder Plus |
| Qwen (百炼 Coding) | CN | `coding.dashscope.aliyuncs.com/apps/anthropic` | Qwen3 Coder Plus |
| Kimi (月之暗面) | CN | `api.moonshot.cn/anthropic` | Kimi K2.6, K2.5 |
| Kimi (Coding Plan) | CN | `api.kimi.com/coding/` | — |
| MiniMax | CN | `api.minimaxi.com/anthropic` | MiniMax M2.7 |
| MiniMax | International | `api.minimax.io/anthropic` | MiniMax M2.7 |
| 硅基流动 SiliconFlow | CN | `api.siliconflow.cn` | MiniMax M2.7 Pro |
| OpenAI | Global | `api.openai.com/v1` | GPT-5.5 Pro, GPT-5.5, GPT-5.4 Mini |
| 硅基流动 SiliconFlow | International | `api.siliconflow.com` | MiniMax M2.7 |
| 阶跃星辰 StepFun | CN | `api.stepfun.com/step_plan` | Step 3.5 Flash |
| 阶跃星辰 StepFun | International | `api.stepfun.ai/step_plan` | Step 3.5 Flash |
| OpenRouter | Global | `openrouter.ai/api` | Claude, DeepSeek V4, Kimi K2.6 |
| 豆包 Doubao (字节) | CN | `ark.cn-beijing.volces.com/api/coding` | Doubao Seed 2.0 |
| 小米 MiMo | CN | `api.xiaomimimo.com/anthropic` | MiMo V2 Pro |
| GitHub Copilot | Global | `api.githubcopilot.com` | Claude Sonnet 4.6 |
| Google Gemini | Global | `generativelanguage.googleapis.com` | Gemini 3.1 Pro |
| Novita AI | Global | `api.novita.ai/anthropic` | GLM-5.1, Kimi K2.5, Kimi K2.6 |

## How It Works

1. Sets `ANTHROPIC_MODEL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL` as environment variables
2. Spawns `claude` with those env vars — only affects the current terminal session
3. No config files are modified in your project

## Security

- API key input is **masked** (`****`)
- Third-party providers show a **trust confirmation** before proceeding
- Key storage is **opt-in** — you can use a key for one session without saving to disk
- Saved keys go to `~/.ccmodel/config.json` with `0600` permissions (plaintext — you are warned)
- Claude binary path is resolved from `PATH` with multi-match warnings
- Set `CCMODEL_CLAUDE_PATH` to pin a trusted `claude` binary

## Configuration

Config is stored at `~/.ccmodel/config.json`:

```json
{
  "providers": {
    "deepseek": {
      "apiKey": "sk-..."
    },
    "glm": {
      "apiKey": "...",
      "defaultModel": "glm-5"
    }
  }
}
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `CCMODEL_CLAUDE_PATH` | Override the `claude` binary path |

## Requirements

- Node.js >= 18
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed (`npm install -g @anthropic-ai/claude-code`)

## Install Globally (Optional)

```bash
npm install -g @shuhang/ccmodel
ccmodel
```

## License

MIT
