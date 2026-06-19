import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import config from "@root/config";
import type { LlmProviderDefinition } from "@utils/llm/types";

export const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

function getOpenAiApiKey() {
  const apiKey = config.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  return apiKey;
}

function createOpenAiProvider() {
  return createOpenAICompatible({
    name: "openai",
    baseURL: "https://api.openai.com/v1",
    apiKey: getOpenAiApiKey(),
  });
}

export const openaiProvider: LlmProviderDefinition = {
  id: "openai",
  defaultModel: config.OPENAI_DEFAULT_MODEL || OPENAI_DEFAULT_MODEL,
  providerOptionsKey: "openai",
  getApiKey: getOpenAiApiKey,
  createLanguageModel(modelId: string): LanguageModel {
    return createOpenAiProvider()(modelId);
  },
};
