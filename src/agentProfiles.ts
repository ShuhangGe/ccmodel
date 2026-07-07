import providers, { ModelOption, Provider } from "./providers.js";
import { getProviderApiKey } from "./config.js";

export interface AgentModelCandidate {
  providerId: string;
  mainModelId: string;
  fastModelId: string;
  note: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
  avoidFor: string[];
  candidates: AgentModelCandidate[];
}

export interface ResolvedAgentProfile {
  profile: AgentProfile;
  provider: Provider;
  model: ModelOption;
  fastModel: ModelOption;
  apiKey?: string;
  note: string;
}

export const AGENT_PROFILES: AgentProfile[] = [
  {
    id: "cheap",
    name: "Cheap / routine",
    description: "Low-cost model for simple edits, file search, formatting, and mechanical changes.",
    bestFor: ["small edits", "search", "formatting", "docs cleanup", "simple scripts"],
    avoidFor: ["ambiguous architecture", "hard debugging", "security-sensitive changes"],
    candidates: [
      {
        providerId: "deepseek",
        mainModelId: "deepseek-v4-flash",
        fastModelId: "deepseek-v4-flash",
        note: "Fast and cheap for routine coding work.",
      },
      {
        providerId: "qwen",
        mainModelId: "qwen-plus-latest",
        fastModelId: "qwen-plus-latest",
        note: "Good budget generalist when Qwen is configured.",
      },
      {
        providerId: "glm",
        mainModelId: "glm-4.7",
        fastModelId: "glm-4.7",
        note: "Budget GLM option for straightforward work.",
      },
      {
        providerId: "anthropic",
        mainModelId: "claude-haiku-4-5-20251001",
        fastModelId: "claude-haiku-4-5-20251001",
        note: "Official Anthropic fast tier.",
      },
    ],
  },
  {
    id: "coding",
    name: "Coding",
    description: "Coding-specialized model for feature work, test fixes, and medium-complexity refactors.",
    bestFor: ["feature implementation", "test fixes", "refactors", "code generation"],
    avoidFor: ["very high-risk architecture", "deep multi-repo reasoning"],
    candidates: [
      {
        providerId: "qwen-coding",
        mainModelId: "qwen3-coder-plus",
        fastModelId: "qwen3-coder-plus",
        note: "Coding endpoint with a coding-specialized model.",
      },
      {
        providerId: "kimi-coding",
        mainModelId: "2.6",
        fastModelId: "2.6",
        note: "Coding Plan endpoint for Kimi.",
      },
      {
        providerId: "deepseek",
        mainModelId: "deepseek-v4-pro",
        fastModelId: "deepseek-v4-flash",
        note: "Use Pro for main work and Flash for subagents/background tasks.",
      },
      {
        providerId: "anthropic",
        mainModelId: "claude-sonnet-4-6",
        fastModelId: "claude-haiku-4-5-20251001",
        note: "Strong official baseline for coding.",
      },
    ],
  },
  {
    id: "review",
    name: "Review / debugging",
    description: "Stronger reasoning for code review, bug isolation, and regression analysis.",
    bestFor: ["code review", "bug fixing", "test failure analysis", "risk analysis"],
    avoidFor: ["bulk mechanical edits", "simple documentation changes"],
    candidates: [
      {
        providerId: "anthropic",
        mainModelId: "claude-sonnet-4-6",
        fastModelId: "claude-haiku-4-5-20251001",
        note: "Balanced accuracy and cost for review/debugging.",
      },
      {
        providerId: "deepseek",
        mainModelId: "deepseek-v4-pro",
        fastModelId: "deepseek-v4-flash",
        note: "Good non-official review/debugging option.",
      },
      {
        providerId: "openrouter",
        mainModelId: "anthropic/claude-sonnet-4.6",
        fastModelId: "deepseek/deepseek-v4",
        note: "OpenRouter mix for reasoning plus cheaper background tasks.",
      },
    ],
  },
  {
    id: "deep",
    name: "Deep reasoning",
    description: "Highest-reasoning profile for ambiguous architecture, hard design choices, and complex failures.",
    bestFor: ["architecture", "hard debugging", "planning", "high-stakes changes"],
    avoidFor: ["trivial edits", "formatting", "bulk search"],
    candidates: [
      {
        providerId: "anthropic",
        mainModelId: "claude-opus-4-7",
        fastModelId: "claude-haiku-4-5-20251001",
        note: "Best quality profile with cheaper subagents/background tasks.",
      },
      {
        providerId: "openrouter",
        mainModelId: "anthropic/claude-opus-4.7",
        fastModelId: "deepseek/deepseek-v4",
        note: "OpenRouter high-reasoning profile.",
      },
      {
        providerId: "kimi",
        mainModelId: "kimi-k2.6",
        fastModelId: "kimi-k2.5",
        note: "Kimi profile for long-context reasoning when configured.",
      },
    ],
  },
];

const PROFILE_KEYWORDS: Array<{ profileId: string; patterns: RegExp[] }> = [
  {
    profileId: "cheap",
    patterns: [/trivial/i, /simple/i, /format/i, /rename/i, /docs?/i, /search/i, /cleanup/i],
  },
  {
    profileId: "coding",
    patterns: [/implement/i, /feature/i, /test/i, /refactor/i, /code/i, /frontend/i, /backend/i],
  },
  {
    profileId: "review",
    patterns: [/review/i, /debug/i, /bug/i, /regression/i, /failure/i, /risk/i],
  },
  {
    profileId: "deep",
    patterns: [/architect/i, /design/i, /complex/i, /hard/i, /ambiguous/i, /strategy/i, /migration/i],
  },
];

function findProvider(providerId: string): Provider | undefined {
  return providers.find((provider) => provider.id === providerId);
}

function modelFromProvider(provider: Provider, modelId: string): ModelOption | undefined {
  return provider.models.find((model) => model.id === modelId);
}

export function listAgentProfiles(): AgentProfile[] {
  return AGENT_PROFILES;
}

export function findAgentProfile(profileId: string): AgentProfile | undefined {
  const normalized = profileId.trim().toLowerCase();
  return AGENT_PROFILES.find((profile) => profile.id === normalized);
}

export function recommendAgentProfile(task: string): AgentProfile {
  const normalized = task.trim();
  let bestProfileId = "coding";
  let bestScore = 0;
  for (const { profileId, patterns } of PROFILE_KEYWORDS) {
    const score = patterns.filter((pattern) => pattern.test(normalized)).length;
    if (score > bestScore) {
      bestProfileId = profileId;
      bestScore = score;
    }
  }
  return findAgentProfile(bestProfileId) ?? AGENT_PROFILES[1];
}

export function resolveAgentProfile(profile: AgentProfile): ResolvedAgentProfile | undefined {
  const validCandidates: ResolvedAgentProfile[] = profile.candidates
    .map((candidate): ResolvedAgentProfile | undefined => {
      const provider = findProvider(candidate.providerId);
      if (!provider) return undefined;
      const model = modelFromProvider(provider, candidate.mainModelId);
      const fastModel = modelFromProvider(provider, candidate.fastModelId);
      if (!model || !fastModel) return undefined;
      return {
        profile,
        provider,
        model,
        fastModel,
        apiKey: getProviderApiKey(provider.id),
        note: candidate.note,
      };
    })
    .filter((candidate): candidate is ResolvedAgentProfile => candidate !== undefined);

  return validCandidates.find((candidate) => candidate.apiKey) ?? validCandidates[0];
}

export function resolveExplicitTarget(
  providerId: string,
  mainModelId: string,
  fastModelId?: string
): Omit<ResolvedAgentProfile, "profile" | "note"> | undefined {
  const provider = findProvider(providerId);
  if (!provider) return undefined;

  const model =
    modelFromProvider(provider, mainModelId) ??
    (provider.allowCustomModel ? { id: mainModelId, name: mainModelId } : undefined);
  if (!model) return undefined;

  const resolvedFastModelId = fastModelId ?? mainModelId;
  const fastModel =
    modelFromProvider(provider, resolvedFastModelId) ??
    (provider.allowCustomModel
      ? { id: resolvedFastModelId, name: resolvedFastModelId }
      : undefined);
  if (!fastModel) return undefined;

  return {
    provider,
    model,
    fastModel,
    apiKey: getProviderApiKey(provider.id),
  };
}
