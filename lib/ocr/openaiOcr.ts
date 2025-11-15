/**
 * OpenAI OCR Helper
 * Handles OCR extraction using OpenAI's GPT models
 */

import { openai } from "../openaiClient";
import { OcrFieldConfig } from "@/types/ocr";

interface RunOcrParams {
  prompt: string; // User-defined config prompt
  inputText?: string; // Text to extract from
  imageData?: string; // Base64 image data
  fields: OcrFieldConfig[]; // Field definitions for extraction
}

interface OcrResult {
  rawText: string; // Raw response from OpenAI
  parsedJson: Record<string, any>; // Parsed JSON object
}

/**
 * Run OCR extraction using OpenAI
 * Builds a system message with the config prompt, field schema, and instructions
 * Returns structured JSON based on field definitions
 */
export async function runOcrWithOpenAI({
  prompt,
  inputText,
  imageData,
  fields,
}: RunOcrParams): Promise<OcrResult> {
  // Build JSON schema description from fields
  const schemaDescription = fields
    .map((field) => {
      const parts = [
        `"${field.field_key}": ${field.data_type}`,
        field.required ? "(required)" : "(optional)",
      ];
      if (field.example_value) {
        parts.push(`e.g., ${field.example_value}`);
      }
      if (field.payload_mapping_key) {
        parts.push(`→ maps to: ${field.payload_mapping_key}`);
      }
      return `  - ${field.field_label}: ${parts.join(" ")}`;
    })
    .join("\n");

  // Build complete system message
  const systemMessage = `
You are an OCR assistant that extracts structured data from documents.

USER INSTRUCTIONS:
${prompt}

FIELD SCHEMA:
Extract the following fields and return them as a JSON object:
${schemaDescription}

RULES:
1. Return ONLY valid JSON, no additional text or markdown.
2. Use exact field keys as specified above.
3. Extract all required fields. If missing, set to null.
4. For optional fields, omit if not found or set to null.
5. Coerce values to the correct data types (string, number, date, boolean, array).
6. For dates, use ISO 8601 format (YYYY-MM-DD).
7. For arrays, return as JSON arrays.
8. Be precise and extract exact values from the document.
`.trim();

  // Call OpenAI - use Vision API if image data provided
  let completion;
  
  if (imageData) {
    // Use GPT-4 Vision for image-based OCR
    completion = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o supports vision
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract data from this document image:",
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });
  } else {
    // Use standard text-based OCR
    completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Extract data from this document:\n\n${inputText}`,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });
  }

  const rawText = completion.choices[0]?.message?.content || "{}";

  // Parse JSON
  let parsedJson: Record<string, any>;
  try {
    parsedJson = JSON.parse(rawText);
  } catch (error) {
    throw new Error(`Failed to parse OpenAI response as JSON: ${rawText}`);
  }

  return {
    rawText,
    parsedJson,
  };
}

