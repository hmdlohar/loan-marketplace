import { openaiProvider } from "@utils/llm/providers/openai";
import { opencodeZenProvider } from "@utils/llm/providers/opencodeZen";
import { openrouterProvider } from "@utils/llm/providers/openrouter";
import type { LlmProviderDefinition, LlmProviderId } from "@utils/llm/types";

const providers: Record<LlmProviderId, LlmProviderDefinition> = {
  "opencode-zen": opencodeZenProvider,
  openrouter: openrouterProvider,
  openai: openaiProvider,
};

export function getLlmProvider(providerId: LlmProviderId): LlmProviderDefinition {
  const provider = providers[providerId];
  if (!provider) {
    throw new Error(`Unknown LLM provider: ${providerId}`);
  }
  return provider;
}

export function listLlmProviders(): LlmProviderId[] {
  return Object.keys(providers) as LlmProviderId[];
}
