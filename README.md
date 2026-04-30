# @shuhang/ccmodel

Interactive CLI to switch Claude Code model providers and launch `claude` with the right environment. Run `npx @shuhang/ccmodel`, pick a provider, enter an API key, select a model — Claude Code starts up configured.

## Quick Start

```bash
npx @shuhang/ccmodel
```

No global install required.

## CLI Flags

```bash
ccmodel                 # start the interactive menu
ccmodel --version       # print version and exit (alias: -v)
ccmodel --help          # print usage and exit   (alias: -h)
```

Any extra arguments after `ccmodel` are **forwarded to `claude`** once you launch, e.g. `ccmodel mcp`.

## What It Does

```
  Claude Code Model Launcher

? 选择操作:
❯ 选择模型并启动 Claude Code
  添加/修改 API Key
  退出
```

Select a provider → enter API key → pick a model → Claude Code launches with the correct environment variables. The parent process waits for `claude` to exit and then exits with the same code — the launcher never shares the terminal with Claude Code, so there is no UI overlap.

## Supported Providers

21 provider profiles across domestic (CN) and international endpoints. Providers marked **⚠** have endpoints that are not protocol-compatible with the Anthropic API out of the box, or are not fully verified for Claude Code; the menu warns and asks for confirmation before launching them.

| Provider | Region | Base URL | Models |
|----------|--------|----------|--------|
| Anthropic | Global | `api.anthropic.com` | Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 |
| DeepSeek | Global | `api.deepseek.com/anthropic` | DeepSeek V4 Pro, V4 Flash |
| GLM (智谱) | CN | `open.bigmodel.cn/api/anthropic` | GLM-5.1 |
| GLM (智谱) | International | `api.z.ai/api/anthropic` | GLM-5.1 |
| Qwen (通义千问) | CN | `dashscope.aliyuncs.com/apps/anthropic` | Qwen3 Max, Qwen3.5 Plus, Qwen Plus, Qwen3 Coder Next, Qwen3 Coder Plus |
| Qwen (百炼 Coding) | CN | `coding.dashscope.aliyuncs.com/apps/anthropic` | Qwen3 Coder Plus |
| Kimi (月之暗面) | CN | `api.moonshot.cn/anthropic` | Kimi K2.6, K2.5 |
| Kimi (Coding Plan) | CN | `api.kimi.com/coding/` | Kimi K2.6 (`2.6`) |
| MiniMax | CN | `api.minimaxi.com/anthropic` | MiniMax M2.7 |
| MiniMax | International | `api.minimax.io/anthropic` | MiniMax M2.7 |
| 硅基流动 SiliconFlow | CN | `api.siliconflow.cn` | MiniMax M2.7 Pro |
| 硅基流动 SiliconFlow | International | `api.siliconflow.com` | MiniMax M2.7 |
| 阶跃星辰 StepFun | CN | `api.stepfun.com/step_plan` | Step 3.5 Flash |
| 阶跃星辰 StepFun | International | `api.stepfun.ai/step_plan` | Step 3.5 Flash |
| OpenRouter | Global | `openrouter.ai/api` | Claude Sonnet 4.6, Opus 4.7, DeepSeek V4, Kimi K2.6 |
| 豆包 Doubao (字节) **⚠** | CN | `ark.cn-beijing.volces.com/api/coding` | Doubao Seed 2.0 Code, Pro, Lite, Mini |
| 小米 MiMo | CN | `api.xiaomimimo.com/anthropic` | MiMo V2 Pro |
| Novita AI | Global | `api.novita.ai/anthropic` | GLM-5.1, Kimi K2.5, Kimi K2.6 |
| OpenAI **⚠** | Global | `api.openai.com/v1` | GPT-5.5 Pro, GPT-5.5, GPT-5.4 Mini |
| Google Gemini **⚠** | Global | `generativelanguage.googleapis.com` | Gemini 3.1 Pro |
| GitHub Copilot **⚠** | Global | `api.githubcopilot.com` | Claude Sonnet 4.6 |

## How It Works

1. Reads `~/.ccmodel/config.json` for saved API keys and default models.
2. Asks you for a **main model** (chat + Opus/Sonnet tier tasks) and a **fast model** (Haiku tier + subagents). Fast model defaults to the main model — press Enter to skip.
3. Runs Claude Code with an isolated config directory, `~/.ccmodel/claude-config`, by setting `CLAUDE_CONFIG_DIR`. This prevents user-level `~/.claude/settings.json` from overriding the provider, API key, or model choices made in ccmodel.
4. Builds a clean child environment: inherits your shell env but **strips** `ANTHROPIC_*`, `CLAUDE_CODE_SUBAGENT_MODEL`, `CLAUDE_CONFIG_DIR`, `API_TIMEOUT_MS`, and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` so nothing leftover can hijack the request.
5. Sets the full set of Claude Code model-routing variables so subagent and background tasks also go to your chosen provider:

   | Variable | Value |
   |----------|-------|
   | `ANTHROPIC_MODEL` | main model |
   | `ANTHROPIC_DEFAULT_OPUS_MODEL` | main model |
   | `ANTHROPIC_DEFAULT_SONNET_MODEL` | main model |
   | `ANTHROPIC_DEFAULT_HAIKU_MODEL` | fast model |
   | `CLAUDE_CODE_SUBAGENT_MODEL` | fast model |
   | `ANTHROPIC_AUTH_TOKEN` | your API key |
   | `ANTHROPIC_BASE_URL` and any provider-specific env | from provider config |

   This is required for third-party providers: Claude Code internally routes different tiers of tasks (subagent spawning, background summarization, etc.) through different model aliases, and without these variables it falls back to Anthropic's default IDs (e.g. `claude-haiku-4-5`) that third-party endpoints will reject with "Unknown Model".

6. Resolves the `claude` binary path (honors `CCMODEL_CLAUDE_PATH`; warns if multiple `claude` binaries are on `PATH`).
7. Releases the terminal raw mode and `spawn`s `claude` with inherited stdio.
8. Waits for `claude` to exit, then exits the launcher with the same code.

No config files in your project are touched. User-level Claude Code settings under `~/.claude/` are also left untouched.

### Why two models?

Claude Code is an agent system: a single session makes many model calls. Some are the main conversation, others are background tasks like subagent spawning (`Task` tool), title generation, or tool-call planning. The Anthropic official docs define four routing env vars (`ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `CLAUDE_CODE_SUBAGENT_MODEL`). ccmodel simplifies those into a two-tier choice:

- **Main model** covers `ANTHROPIC_MODEL`, `DEFAULT_OPUS_MODEL`, and `DEFAULT_SONNET_MODEL`.
- **Fast model** covers `DEFAULT_HAIKU_MODEL` and `CLAUDE_CODE_SUBAGENT_MODEL`. Pick a cheaper / faster model here when your provider offers one (e.g. `deepseek-v4-flash` for DeepSeek, `kimi-k2-turbo-preview` for Kimi). If the provider only has one model, same-as-main is fine.

## Security Posture

- **Masked input**: API keys are read with a password prompt (displayed as `*`).
- **Plaintext storage (0600)**: once validated (≥ 8 chars), keys are saved to `~/.ccmodel/config.json` with mode `0600` on macOS/Linux. The content is plaintext — this is intentional (same trust level as the Claude Code CLI) but you should know.
- **Shell env scrubbing**: leftover `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_SUBAGENT_MODEL`, and similar variables in your shell cannot silently redirect your key or model to a different target; the launcher removes them before applying the provider config.
- **Claude settings isolation**: by default, ccmodel sets `CLAUDE_CONFIG_DIR=~/.ccmodel/claude-config` before launching Claude Code. This avoids reading or modifying your normal `~/.claude/settings.json`, which may contain unrelated provider settings.
- **Incompatible-endpoint warnings**: providers whose endpoints need a protocol adapter (OpenAI, Gemini, GitHub Copilot) are marked `⚠ 不兼容` in the menu and require an extra confirm before launch.
- **Binary trust**: set `CCMODEL_CLAUDE_PATH=/path/to/claude` to pin a specific `claude` binary and avoid `PATH` shadowing. When multiple `claude` binaries are found, the launcher prints every candidate before using the first one.
- **Corrupt config recovery**: if `~/.ccmodel/config.json` is unreadable or malformed, it is moved to `~/.ccmodel/config.json.corrupt-<timestamp>` instead of being silently overwritten — no other providers' keys are lost.
- **Ctrl+C is quiet**: pressing Ctrl+C in any prompt exits with code 130 without printing a stack trace.

## Configuration File

`~/.ccmodel/config.json`:

```json
{
  "providers": {
    "deepseek": {
      "apiKey": "sk-..."
    },
    "glm": {
      "apiKey": "...",
      "defaultModel": "glm-5.1"
    }
  }
}
```

`defaultModel` is set interactively the first time you pick a non-default model for a multi-model provider. Next time, that model is labeled `[默认]` in the menu.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CCMODEL_CLAUDE_PATH` | Override `claude` binary resolution. Launcher validates the path is executable and warns if not. |
| `CCMODEL_CLAUDE_CONFIG_DIR` | Override the isolated Claude Code config directory. Defaults to `~/.ccmodel/claude-config`. |
| `CCMODEL_USE_USER_CLAUDE_CONFIG=1` | Opt out of isolation and let Claude Code use your normal `~/.claude` config. Not recommended when switching providers. |
| `CCMODEL_DEBUG_ENV=1` | Print key environment variables passed to `claude` before launch. API keys/tokens are masked. |

Everything starting with `ANTHROPIC_*`, plus `CLAUDE_CODE_SUBAGENT_MODEL`, `CLAUDE_CONFIG_DIR`, `API_TIMEOUT_MS`, and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, is **stripped from inherited env** before spawn. Only values from the chosen provider config take effect inside `claude`.

## Requirements

- Node.js ≥ 18
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed: `npm install -g @anthropic-ai/claude-code`

## Install Globally (Optional)

```bash
npm install -g @shuhang/ccmodel
ccmodel
```

## Troubleshooting

- **"Cannot find module './menu.js'" during `npm run dev`** — use `npm run dev` which runs via `tsx`, not `ts-node`. `ts-node` under CJS cannot resolve the `.js` extensions used in source imports.
- **`claude` not found** — install Claude Code globally, or set `CCMODEL_CLAUDE_PATH` to the exact path.
- **Warnings about multiple `claude` binaries** — resolve ambiguity by setting `CCMODEL_CLAUDE_PATH`.
- **UI looks corrupted on launch** — make sure you are running in a real interactive terminal (not piped stdin) so both the menu and Claude Code can control the TTY properly.

## License

MIT
