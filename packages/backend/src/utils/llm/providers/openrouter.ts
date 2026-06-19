import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import config from "@root/config";
import type { LlmProviderDefinition } from "@utils/llm/types";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_DEFAULT_MODEL = "openai/gpt-4o-mini";

function getOpenRouterApiKey() {
  const apiKey = config.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }
  return apiKey;
}

function createOpenRouterProvider() {
  return createOpenAICompatible({
    name: "openrouter",
    baseURL: OPENROUTER_BASE_URL,
    apiKey: getOpenRouterApiKey(),
    headers: {
      "HTTP-Referer": config.API_BASE_URL,
      "X-Title": "loan-marketplace",
    },
  });
}

export const openrouterProvider: LlmProviderDefinition = {
  id: "openrouter",
  defaultModel: config.OPENROUTER_DEFAULT_MODEL || OPENROUTER_DEFAULT_MODEL,
  providerOptionsKey: "openrouter",
  getApiKey: getOpenRouterApiKey,
  createLanguageModel(modelId: string): LanguageModel {
    return createOpenRouterProvider()(modelId);
  },
};
