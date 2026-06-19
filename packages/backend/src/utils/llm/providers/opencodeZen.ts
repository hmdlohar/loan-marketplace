import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import config from "@root/config";
import type { LlmProviderDefinition } from "@utils/llm/types";

export const OPENCODE_ZEN_BASE_URL = "https://opencode.ai/zen/v1";
export const OPENCODE_ZEN_DEFAULT_MODEL = "deepseek-v4-flash-free";

function getZenApiKey() {
  const apiKey = config.ZEN_API_KEY;
  if (!apiKey) {
    throw new Error("ZEN_API_KEY is not set. Get a free key at https://opencode.ai");
  }
  return apiKey;
}

function createZenProvider() {
  return createOpenAICompatible({
    name: "opencode-zen",
    baseURL: OPENCODE_ZEN_BASE_URL,
    apiKey: getZenApiKey(),
  });
}

export const opencodeZenProvider: LlmProviderDefinition = {
  id: "opencode-zen",
  defaultModel: config.LLM_DEFAULT_MODEL || OPENCODE_ZEN_DEFAULT_MODEL,
  providerOptionsKey: "opencode-zen",
  getApiKey: getZenApiKey,
  createLanguageModel(modelId: string): LanguageModel {
    return createZenProvider()(modelId);
  },
};
