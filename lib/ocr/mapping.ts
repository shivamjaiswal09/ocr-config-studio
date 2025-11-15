/**
 * Mapping Helper
 * Maps extracted OCR data to standardized freight invoicing payload
 */

import { OcrFieldConfig, DataType } from "@/types/ocr";

/**
 * Map extracted OCR data to freight invoicing payload
 * Reads from modelJson using field_key and writes to mappedPayload using payload_mapping_key
 */
export function mapToFreightPayload(
  fields: OcrFieldConfig[],
  modelJson: Record<string, any>
): Record<string, any> {
  const mappedPayload: Record<string, any> = {};

  for (const field of fields) {
    // Skip if no payload mapping defined
    if (!field.payload_mapping_key) {
      continue;
    }

    const extractedValue = modelJson[field.field_key];

    // Skip if value not found and field is not required
    if (extractedValue === undefined || extractedValue === null) {
      if (field.required) {
        // Set to null for required missing fields
        mappedPayload[field.payload_mapping_key] = null;
      }
      continue;
    }

    // Coerce value based on data_type
    const coercedValue = coerceValue(extractedValue, field.data_type);
    mappedPayload[field.payload_mapping_key] = coercedValue;
  }

  return mappedPayload;
}

/**
 * Coerce a value to the specified data type
 */
function coerceValue(value: any, dataType: DataType): any {
  if (value === null || value === undefined) {
    return null;
  }

  switch (dataType) {
    case "string":
      return String(value);

    case "number":
      const num = Number(value);
      return isNaN(num) ? null : num;

    case "date":
      // Assume ISO 8601 format, return as string
      // Could use Date object, but JSON serialization converts back to string
      return String(value);

    case "boolean":
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const lower = value.toLowerCase().trim();
        if (lower === "true" || lower === "yes" || lower === "1") return true;
        if (lower === "false" || lower === "no" || lower === "0") return false;
      }
      return Boolean(value);

    case "array":
      if (Array.isArray(value)) return value;
      // Try to parse if string
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // Not JSON, return as single-item array
          return [value];
        }
      }
      return [value];

    default:
      return value;
  }
}

