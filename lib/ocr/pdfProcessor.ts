/**
 * PDF Processor
 * Extracts text from PDF files for OCR processing
 */

/**
 * Extract text from PDF buffer
 * Returns extracted text content
 */
export async function pdfToText(pdfBuffer: Buffer): Promise<string> {
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(pdfBuffer);
  return data.text || "";
}

