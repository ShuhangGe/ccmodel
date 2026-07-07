import { launchClaude } from "./launcher.js";
import {
  findAgentProfile,
  listAgentProfiles,
  recommendAgentProfile,
  resolveAgentProfile,
  resolveExplicitTarget,
} from "./agentProfiles.js";

function splitArgs(args: string[]): { ccmodelArgs: string[]; claudeArgs: string[] } {
  const separator = args.indexOf("--");
  if (separator === -1) return { ccmodelArgs: args, claudeArgs: [] };
  return {
    ccmodelArgs: args.slice(0, separator),
    claudeArgs: args.slice(separator + 1),
  };
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

export function printProfiles(): void {
  console.log("Available agent profiles:\n");
  for (const profile of listAgentProfiles()) {
    console.log(`${profile.id.padEnd(8)} ${profile.name}`);
    console.log(`         ${profile.description}`);
    console.log(`         Best for: ${profile.bestFor.join(", ")}`);
    console.log(`         Avoid for: ${profile.avoidFor.join(", ")}`);
    console.log("");
  }
}

export function printRecommendation(task: string): void {
  const profile = recommendAgentProfile(task);
  const resolved = resolveAgentProfile(profile);
  console.log(`Recommended profile: ${profile.id} (${profile.name})`);
  console.log(profile.description);
  if (!resolved) {
    console.log("No valid provider/model candidate is currently available in ccmodel.");
    return;
  }
  console.log(`Provider: ${resolved.provider.id} (${resolved.provider.name})`);
  console.log(`Main model: ${resolved.model.id}`);
  console.log(`Fast model: ${resolved.fastModel.id}`);
  console.log(`Reason: ${resolved.note}`);
  if (!resolved.apiKey) {
    console.log(`API key missing for provider '${resolved.provider.id}'. Run 'ccmodel' and configure it first.`);
  }
}

export async function handleAgentCommand(rawArgs: string[]): Promise<number> {
  const { ccmodelArgs, claudeArgs } = splitArgs(rawArgs);

  if (ccmodelArgs.includes("--list")) {
    printProfiles();
    return 0;
  }

  const recommendIndex = ccmodelArgs.indexOf("--recommend");
  if (recommendIndex !== -1) {
    const task = ccmodelArgs.slice(recommendIndex + 1).join(" ").trim();
    if (!task) {
      console.error("Missing task text after --recommend.");
      return 1;
    }
    printRecommendation(task);
    return 0;
  }

  const explicitProvider = readOption(ccmodelArgs, "--provider");
  const explicitModel = readOption(ccmodelArgs, "--model");
  const explicitFastModel = readOption(ccmodelArgs, "--fast-model");

  if (explicitProvider || explicitModel || explicitFastModel) {
    if (!explicitProvider || !explicitModel) {
      console.error("Explicit agent launch requires --provider <id> and --model <id>.");
      return 1;
    }
    const resolved = resolveExplicitTarget(explicitProvider, explicitModel, explicitFastModel);
    if (!resolved) {
      console.error("Could not resolve provider/model. Check 'ccmodel profiles' and provider model IDs.");
      return 1;
    }
    if (!resolved.apiKey) {
      console.error(`API key missing for provider '${resolved.provider.id}'. Run 'ccmodel' and configure it first.`);
      return 1;
    }
    return launchClaude(
      {
        provider: resolved.provider,
        model: resolved.model,
        fastModel: resolved.fastModel,
        apiKey: resolved.apiKey,
      },
      claudeArgs
    );
  }

  const profileId = ccmodelArgs[0];
  if (!profileId) {
    console.error("Missing profile. Use 'ccmodel agent --list' to see profiles.");
    return 1;
  }

  const profile = findAgentProfile(profileId);
  if (!profile) {
    console.error(`Unknown profile '${profileId}'. Use 'ccmodel agent --list' to see profiles.`);
    return 1;
  }

  const resolved = resolveAgentProfile(profile);
  if (!resolved) {
    console.error(`No valid provider/model candidate exists for profile '${profile.id}'.`);
    return 1;
  }
  if (!resolved.apiKey) {
    console.error(
      `No configured API key found for profile '${profile.id}'. Run 'ccmodel' and configure one of: ` +
        profile.candidates.map((candidate) => candidate.providerId).join(", ")
    );
    return 1;
  }

  return launchClaude(
    {
      provider: resolved.provider,
      model: resolved.model,
      fastModel: resolved.fastModel,
      apiKey: resolved.apiKey,
    },
    claudeArgs
  );
}
