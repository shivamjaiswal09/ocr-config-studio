/**
 * OpenAI Client - Server-side only
 * Used for OCR processing with GPT-4 Vision or GPT-4
 */

import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAIClient() {
  if (_openai) {
    return _openai;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  _openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return _openai;
}

/**
 * OpenAI client instance
 * Use only in API routes and server components
 * Lazy-initialized on first use
 */
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAIClient();
    return (client as any)[prop];
  },
});

