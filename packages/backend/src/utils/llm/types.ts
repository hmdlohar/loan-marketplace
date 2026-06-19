import type { LanguageModel } from "ai";

/** Registered LLM provider. Omit at call time to use `LLM_DEFAULT_PROVIDER` from env. */
export type LlmProviderId = "opencode-zen" | "openrouter" | "openai";

/**
 * Controls extended thinking / reasoning on models that support it.
 * - `true` — medium effort
 * - `false` — disabled
 * - `"low"` | `"medium"` | `"high"` — explicit effort level
 */
export type LlmThinkingOption = boolean | "low" | "medium" | "high";

/** One image attached to a `generateText` call. */
export type LlmImageInput = {
  /**
   * Image bytes as a Buffer, raw base64 string, or data URL
   * (e.g. `data:image/jpeg;base64,...`).
   */
  data: string | Buffer | Uint8Array | ArrayBuffer;
  /** IANA media type, e.g. `image/jpeg`. Inferred from data URLs when omitted. Defaults to `image/jpeg`. */
  mediaType?: string;
};

/** Options for {@link generateText}. */
export type GenerateTextOptions = {
  /** User prompt — plain text sent to the model. */
  text: string;
  /** Optional images sent together with `text` (e.g. PAN/Aadhaar scans). Routes to a vision-capable model automatically. */
  images?: LlmImageInput[];
  /** System instructions prepended to the conversation. */
  system?: string;
  /** Provider to use. Defaults to `LLM_DEFAULT_PROVIDER` env (`opencode-zen`). */
  provider?: LlmProviderId;
  /** Model id for the chosen provider. Defaults to the provider's configured default model. */
  model?: string;
  /** Maximum tokens in the model response. */
  maxOutputTokens?: number;
  /** Sampling temperature. Lower values are more deterministic. */
  temperature?: number;
  /** Nucleus sampling (0–1). Prefer setting either `temperature` or `topP`, not both. */
  topP?: number;
  /** Extended thinking / reasoning. See {@link LlmThinkingOption}. */
  thinking?: LlmThinkingOption;
  /** Retry count on transient failures. */
  maxRetries?: number;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Optional abort signal to cancel the request. */
  abortSignal?: AbortSignal;
};

/** Token usage summary returned by {@link generateText}. */
export type GenerateTextUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
};

/** Result returned by {@link generateText}. */
export type GenerateTextResult = {
  /** Generated text from the model. */
  text: string;
  /** Reasoning / thinking text when the model produced it separately from `text`. */
  reasoningText?: string;
  /** Provider that handled the request. */
  provider: LlmProviderId;
  /** Model id that handled the request. */
  model: string;
  /** Token usage, when reported by the provider. */
  usage?: GenerateTextUsage;
};

/** @internal */
export type LlmProviderDefinition = {
  id: LlmProviderId;
  defaultModel: string;
  getApiKey: () => string;
  createLanguageModel: (modelId: string) => LanguageModel;
  providerOptionsKey: string;
};
