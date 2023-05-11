import type {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from "openai";
import { type } from "os";

export type ChatRequest = CreateChatCompletionRequest;
export type ChatResponse = CreateChatCompletionResponse;
export type Updater<T> = (updater: (value: T) => void) => void;
