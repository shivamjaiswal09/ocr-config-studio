/**
 * PDF Processor
 * Extracts text from PDF files for OCR processing
 */

/**
 * Extract text from PDF buffer
 * Returns extracted text content
 * @throws Error if PDF cannot be parsed
 */
export async function pdfToText(pdfBuffer: Buffer): Promise<string> {
  try {
    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF buffer is empty");
    }

    // Check if it's a valid PDF by checking the PDF header
    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    if (pdfHeader !== "%PDF") {
      throw new Error("Invalid PDF file format. File does not start with PDF header.");
    }

    const pdfParse = require("pdf-parse");
    
    // Parse with options for better error handling
    const data = await pdfParse(pdfBuffer, {
      max: 0, // Parse all pages
      version: "v1.10.100", // Use specific version
    });

    // Check if text was extracted
    const extractedText = data.text || "";
    
    if (!extractedText || extractedText.trim() === "") {
      // Check if PDF has pages but no text (might be image-based)
      if (data.numpages > 0) {
        throw new Error("PDF contains pages but no extractable text. This PDF might be image-based and requires OCR on images.");
      }
      throw new Error("PDF file appears to be empty or contains no text.");
    }

    return extractedText;
  } catch (error: any) {
    // Handle specific pdf-parse errors
    if (error.message) {
      // Check for common PDF parsing errors
      if (error.message.includes("XRef") || error.message.includes("xref")) {
        throw new Error("PDF file structure error (XRef). The PDF may be corrupted or use an unsupported format.");
      }
      if (error.message.includes("password") || error.message.includes("encrypted")) {
        throw new Error("PDF file is password-protected or encrypted. Please provide an unlocked version.");
      }
      if (error.message.includes("Invalid PDF")) {
        throw new Error("Invalid PDF file format. Please ensure the file is a valid PDF document.");
      }
      // Re-throw with original message if it's already a formatted error
      if (error.message.includes("PDF") || error.message.includes("corrupted")) {
        throw error;
      }
    }
    
    // Generic error handling
    console.error("PDF parsing error details:", {
      errorType: error.constructor?.name,
      errorMessage: error.message,
      bufferLength: pdfBuffer?.length,
      bufferStart: pdfBuffer?.slice(0, 20)?.toString('hex'),
    });
    
    throw new Error(`Failed to parse PDF: ${error.message || "Unknown error. The PDF file may be corrupted, password-protected, or in an unsupported format."}`);
  }
}

