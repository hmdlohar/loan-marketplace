import { generateText as aiGenerateText } from "ai";
import config from "@root/config";
import { getLlmProvider } from "@utils/llm/providers";
import type {
  GenerateTextOptions,
  GenerateTextResult,
  GenerateTextUsage,
  LlmImageInput,
  LlmProviderId,
  LlmThinkingOption,
} from "@utils/llm/types";

/** Default provider when `provider` is omitted and env has no override. */
export const DEFAULT_LLM_PROVIDER: LlmProviderId = "opencode-zen";

const DEFAULT_VISION_MODELS: Record<LlmProviderId, string> = {
  "opencode-zen": "mimo-v2.5-free",
  openrouter: "google/gemini-2.0-flash-001",
  openai: "gpt-4o-mini",
};

function isTextOnlyModel(modelId: string) {
  return /^deepseek-v4/i.test(modelId);
}

function resolveProviderId(provider?: LlmProviderId): LlmProviderId {
  const providerId = provider || (config.LLM_DEFAULT_PROVIDER as LlmProviderId) || DEFAULT_LLM_PROVIDER;
  return providerId;
}

function resolveModel(providerId: LlmProviderId, model?: string) {
  const provider = getLlmProvider(providerId);
  return model || provider.defaultModel;
}

function resolveProviderAndModel(options: GenerateTextOptions) {
  const hasImages = !!options.images?.length;
  if (!hasImages) {
    const providerId = resolveProviderId(options.provider);
    return {
      providerId,
      modelId: resolveModel(providerId, options.model),
    };
  }

  const providerId = resolveProviderId(
    options.provider || (config.LLM_VISION_PROVIDER as LlmProviderId) || undefined
  );
  let modelId =
    options.model ||
    config.LLM_VISION_MODEL ||
    DEFAULT_VISION_MODELS[providerId] ||
    resolveModel(providerId);

  if (isTextOnlyModel(modelId)) {
    modelId = config.LLM_VISION_MODEL || DEFAULT_VISION_MODELS[providerId] || modelId;
  }

  return { providerId, modelId };
}

function normalizeImageData(data: LlmImageInput["data"]) {
  if (typeof data === "string") {
    return data;
  }
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (data instanceof Uint8Array) {
    return data;
  }
  return new Uint8Array(data);
}

function guessMediaTypeFromDataUrl(data: string) {
  const match = data.match(/^data:([^;]+);base64,/i);
  return match?.[1];
}

function buildUserMessageContent(text: string, images?: LlmImageInput[]) {
  if (!images?.length) {
    return text;
  }

  return [
    { type: "text" as const, text },
    ...images.map((image) => ({
      type: "image" as const,
      image: normalizeImageData(image.data),
      mediaType:
        image.mediaType ||
        (typeof image.data === "string" ? guessMediaTypeFromDataUrl(image.data) : undefined) ||
        "image/jpeg",
    })),
  ];
}

function mapThinkingToReasoningEffort(thinking: LlmThinkingOption) {
  if (thinking === true) {
    return "medium";
  }
  if (thinking === false) {
    return undefined;
  }
  return thinking;
}

function buildProviderOptions(
  providerOptionsKey: string,
  thinking?: LlmThinkingOption
) {
  const reasoningEffort = thinking === undefined ? undefined : mapThinkingToReasoningEffort(thinking);
  if (!reasoningEffort) {
    return undefined;
  }

  return {
    [providerOptionsKey]: {
      reasoningEffort,
    },
  };
}

function mapUsage(usage: {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  outputTokenDetails?: { reasoningTokens?: number };
  reasoningTokens?: number;
} | undefined): GenerateTextUsage | undefined {
  if (!usage) {
    return undefined;
  }

  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    reasoningTokens: usage.outputTokenDetails?.reasoningTokens ?? usage.reasoningTokens,
  };
}

/**
 * Send a text prompt (optionally with images) to an LLM and return the response.
 *
 * Import from `@utils/llm` — do not call provider APIs directly.
 *
 * When `images` are included, a vision-capable model is used automatically
 * (`LLM_VISION_PROVIDER` / `LLM_VISION_MODEL`, or provider defaults such as `mimo-v2.5-free` on OpenCode Zen).
 * Text-only models like `deepseek-v4-flash-free` cannot accept images.
 * @returns Generated text, optional reasoning text, provider/model used, and token usage.
 *
 * @example
 * ```ts
 * import { generateText } from "@utils/llm";
 *
 * const result = await generateText({
 *   text: "Extract PAN number, name, and DOB as JSON.",
 *   images: [{ data: fileBuffer, mediaType: "image/jpeg" }],
 *   system: "Return valid JSON only.",
 *   maxOutputTokens: 2048,
 *   temperature: 0.2,
 * });
 * ```
 */
export async function generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
  const { providerId, modelId } = resolveProviderAndModel(options);
  const provider = getLlmProvider(providerId);

  provider.getApiKey();

  const result = await aiGenerateText({
    model: provider.createLanguageModel(modelId),
    system: options.system,
    messages: [
      {
        role: "user",
        content: buildUserMessageContent(options.text, options.images),
      },
    ],
    maxOutputTokens: options.maxOutputTokens,
    temperature: options.temperature,
    topP: options.topP,
    maxRetries: options.maxRetries,
    timeout: options.timeout,
    abortSignal: options.abortSignal,
    providerOptions: buildProviderOptions(provider.providerOptionsKey, options.thinking),
  });

  return {
    text: result.text,
    reasoningText: result.reasoningText,
    provider: providerId,
    model: modelId,
    usage: mapUsage(result.usage),
  };
}
