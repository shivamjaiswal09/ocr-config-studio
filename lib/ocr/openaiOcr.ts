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

  // Build comprehensive extraction prompt
  const comprehensivePrompt = `Extract all text and data from this Indian tax image and return it as a structured JSON object. Include: supplier details, customer details, invoice details (number, date, order details), line items with descriptions, quantities, rates, amounts, GST breakdowns, and totals. Be precise and include all numerical values exactly as shown along with the mapped fields in the config.`;

  // Build complete system message
  const systemMessage = `
You are an OCR assistant that extracts structured data from documents.

PRIMARY INSTRUCTION:
${comprehensivePrompt}

ADDITIONAL USER INSTRUCTIONS:
${prompt}

REQUIRED FIELD SCHEMA (must be included):
${schemaDescription}

RULES:
1. Return ONLY valid JSON, no additional text or markdown.
2. Extract ALL visible text and data from the document, not just the fields listed above.
3. For the required fields above, use exact field keys as specified.
4. For additional fields found in the document, use descriptive keys (e.g., "supplier_name", "customer_address", "gst_amount", "line_items", etc.).
5. Extract all required fields. If missing, set to null.
6. Include ALL line items, amounts, GST details, totals, and any other visible information.
7. Coerce values to the correct data types (string, number, date, boolean, array).
8. For dates, use ISO 8601 format (YYYY-MM-DD).
9. For arrays (like line items), return as JSON arrays.
10. Be precise and extract exact values exactly as shown in the document.
11. Include all numerical values, percentages, and amounts with exact precision.
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
              text: "Extract ALL text and data from this Indian tax invoice image. Include every detail: supplier information, customer information, invoice number, dates, line items with descriptions, quantities, rates, amounts, GST breakdowns (CGST, SGST, IGST), totals, and any other visible information. Return everything as a structured JSON object.",
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
          content: `Extract ALL text and data from this Indian tax invoice document. Include every detail: supplier information, customer information, invoice number, dates, line items with descriptions, quantities, rates, amounts, GST breakdowns (CGST, SGST, IGST), totals, and any other visible information. Return everything as a structured JSON object.\n\nDocument text:\n${inputText}`,
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

