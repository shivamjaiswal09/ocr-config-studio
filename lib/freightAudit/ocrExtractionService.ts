/**
 * OCR Extraction Service
 * Wraps existing OCR logic and normalizes output to ExtractedInvoice format
 */

import { runOcrWithOpenAI } from "@/lib/ocr/openaiOcr";
import { pdfToText } from "@/lib/ocr/pdfProcessor";
import { ExtractedInvoice, ExtractedInvoiceTrip } from "@/types/freightAudit";

/**
 * Normalize OCR output to ExtractedInvoice format
 * Maps various OCR response formats to our standard structure
 */
function normalizeOcrOutput(ocrResponse: Record<string, any>): ExtractedInvoice {
  console.log("OCR Response received:", JSON.stringify(ocrResponse, null, 2));

  // Extract invoice-level fields
  const invoiceNumber =
    ocrResponse.invoice_number ||
    ocrResponse.invoiceNumber ||
    ocrResponse.invoice_no ||
    ocrResponse.invoiceNo ||
    ocrResponse.invoice ||
    "";

  const invoiceDate =
    ocrResponse.invoice_date ||
    ocrResponse.invoiceDate ||
    ocrResponse.date ||
    ocrResponse.invoiceDate ||
    new Date().toISOString().split("T")[0];

  // Extract trips - handle multiple formats
  let trips: ExtractedInvoiceTrip[] = [];

  // Format 1: trips array
  if (Array.isArray(ocrResponse.trips)) {
    trips = ocrResponse.trips.map(normalizeTrip);
  }
  // Format 2: line_items array (common in invoices)
  else if (Array.isArray(ocrResponse.line_items)) {
    trips = ocrResponse.line_items.map(normalizeTrip);
  }
  // Format 3: nested structure
  else if (ocrResponse.trip_data && Array.isArray(ocrResponse.trip_data)) {
    trips = ocrResponse.trip_data.map(normalizeTrip);
  }
  // Format 4: single trip object or root-level fields
  else {
    // Try to extract vehicle number from various locations
    const vehicleNumber =
      ocrResponse.vehicle_number ||
      ocrResponse.vehicleNumber ||
      ocrResponse.vehicle_no ||
      ocrResponse.vehicleNo ||
      ocrResponse.vehicle ||
      "";

    // If we have a vehicle number or any freight-related data, create a trip
    if (vehicleNumber || ocrResponse.base_freight || ocrResponse.freight_charge || ocrResponse.freight) {
      trips = [normalizeTrip(ocrResponse)];
    }
  }

  // If still no trips, try to extract from any array fields
  if (trips.length === 0) {
    // Look for any array that might contain trip data
    for (const [key, value] of Object.entries(ocrResponse)) {
      if (Array.isArray(value) && value.length > 0) {
        // Check if first item looks like a trip (has vehicle_number or freight)
        const firstItem = value[0];
        if (
          firstItem &&
          typeof firstItem === "object" &&
          (firstItem.vehicle_number ||
            firstItem.vehicleNumber ||
            firstItem.base_freight ||
            firstItem.freight_charge ||
            firstItem.freight)
        ) {
          trips = value.map(normalizeTrip);
          break;
        }
      }
    }
  }

  // Final fallback: create a trip with whatever data we have
  if (trips.length === 0) {
    console.warn("No trips found in expected formats, creating fallback trip from root data");
    trips = [
      {
        vehicleNumber:
          ocrResponse.vehicle_number ||
          ocrResponse.vehicleNumber ||
          ocrResponse.vehicle_no ||
          ocrResponse.vehicleNo ||
          ocrResponse.vehicle ||
          "UNKNOWN",
        origin: ocrResponse.origin || ocrResponse.from_location || ocrResponse.from || undefined,
        destination:
          ocrResponse.destination ||
          ocrResponse.to_location ||
          ocrResponse.to ||
          undefined,
        lrNumber:
          ocrResponse.lr_number ||
          ocrResponse.lrNumber ||
          ocrResponse.lr_no ||
          ocrResponse.lrNo ||
          ocrResponse.lr ||
          undefined,
        tripId:
          ocrResponse.trip_id ||
          ocrResponse.tripId ||
          ocrResponse.trip_no ||
          ocrResponse.tripNo ||
          ocrResponse.trip ||
          undefined,
        baseFreight:
          parseFloat(
            String(
              ocrResponse.base_freight ||
                ocrResponse.baseFreight ||
                ocrResponse.freight_charge ||
                ocrResponse.freightCharge ||
                ocrResponse.freight ||
                ocrResponse.base_freight_amount ||
                0
            )
          ) || 0,
        additionalCharges: {
          detention:
            parseFloat(String(ocrResponse.detention || ocrResponse.detention_charge || ocrResponse.detentionCharge || 0)) || undefined,
          toll:
            parseFloat(String(ocrResponse.toll || ocrResponse.toll_charge || ocrResponse.tollCharge || 0)) || undefined,
          unloading:
            parseFloat(
              String(
                ocrResponse.unloading ||
                  ocrResponse.unloading_charge ||
                  ocrResponse.unloadingCharge ||
                  ocrResponse.unload ||
                  0
              )
            ) || undefined,
        },
        gstAmount:
          parseFloat(
            String(
              ocrResponse.gst_amount ||
                ocrResponse.gstAmount ||
                ocrResponse.gst ||
                ocrResponse.tax_amount ||
                ocrResponse.taxAmount ||
                ocrResponse.tax ||
                0
            )
          ) || 0,
      },
    ];
  }

  // Ensure at least one trip exists
  if (trips.length === 0) {
    console.error("Failed to extract trips. OCR Response:", JSON.stringify(ocrResponse, null, 2));
    throw new Error(
      `No trips found in OCR output. Available keys: ${Object.keys(ocrResponse).join(", ")}`
    );
  }

  return {
    invoiceNumber: invoiceNumber || "INV-" + Date.now(),
    invoiceDate,
    trips,
  };
}

/**
 * Normalize a single trip object to ExtractedInvoiceTrip format
 */
function normalizeTrip(trip: any): ExtractedInvoiceTrip {
  // Extract additional charges - handle various formats
  const additionalCharges: Record<string, number | undefined> = {};

  // Direct additional charges object
  if (trip.additionalCharges && typeof trip.additionalCharges === "object") {
    Object.assign(additionalCharges, trip.additionalCharges);
  }

  // Individual charge fields
  if (trip.detention !== undefined) {
    additionalCharges.detention = parseFloat(trip.detention) || undefined;
  }
  if (trip.detention_charge !== undefined) {
    additionalCharges.detention = parseFloat(trip.detention_charge) || undefined;
  }
  if (trip.toll !== undefined) {
    additionalCharges.toll = parseFloat(trip.toll) || undefined;
  }
  if (trip.toll_charge !== undefined) {
    additionalCharges.toll = parseFloat(trip.toll_charge) || undefined;
  }
  if (trip.unloading !== undefined) {
    additionalCharges.unloading = parseFloat(trip.unloading) || undefined;
  }
  if (trip.unloading_charge !== undefined) {
    additionalCharges.unloading = parseFloat(trip.unloading_charge) || undefined;
  }
  if (trip.others !== undefined) {
    additionalCharges.others = parseFloat(trip.others) || undefined;
  }

  return {
    vehicleNumber:
      trip.vehicle_number ||
      trip.vehicleNumber ||
      trip.vehicle_no ||
      trip.vehicleNo ||
      "",
    origin: trip.origin || trip.from_location || trip.from,
    destination: trip.destination || trip.to_location || trip.to,
    lrNumber: trip.lr_number || trip.lrNumber || trip.lr_no || trip.lrNo,
    tripId: trip.trip_id || trip.tripId || trip.trip_no || trip.tripNo,
    baseFreight:
      parseFloat(
        trip.base_freight ||
          trip.baseFreight ||
          trip.freight_charge ||
          trip.freightCharge ||
          trip.freight ||
          0
      ) || 0,
    additionalCharges,
    gstAmount:
      parseFloat(
        trip.gst_amount ||
          trip.gstAmount ||
          trip.gst ||
          trip.tax_amount ||
          trip.taxAmount ||
          0
      ) || 0,
  };
}

/**
 * Extract invoice data from PDF using existing OCR service
 * Falls back to OpenAI Vision API if text extraction fails (for image-based PDFs)
 */
export async function extractInvoiceFromPdf(
  pdfBuffer: Buffer,
  ocrConfig: {
    prompt: string;
    fields: any[];
  },
  pdfBase64?: string // Optional base64 for Vision API fallback
): Promise<ExtractedInvoice> {
  try {
    // Step 1: Try to convert PDF to text
    console.log("Step 1: Attempting to extract text from PDF...");
    let extractedText: string | undefined;
    let useVisionApi = false;
    
    try {
      extractedText = await pdfToText(pdfBuffer);
      
      if (!extractedText || extractedText.trim() === "") {
        console.log("No text extracted from PDF, will use Vision API fallback");
        useVisionApi = true;
      } else {
        console.log("PDF text extracted successfully, length:", extractedText.length);
      }
    } catch (pdfError: any) {
      console.warn("PDF text extraction failed, will use Vision API fallback:", pdfError.message);
      useVisionApi = true;
      
      // Check for password-protected PDFs (can't use Vision API for these)
      const errorMessage = pdfError.message || "";
      if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
        throw new Error("The PDF file is password-protected or encrypted. Please provide an unlocked version of the PDF.");
      }
      
      // For other errors, we'll try Vision API as fallback
      if (!pdfBase64) {
        // If we don't have base64, we can't use Vision API
        if (errorMessage.includes("XRef") || errorMessage.includes("xref") || errorMessage.includes("corrupted")) {
          throw new Error("The PDF file appears to be corrupted or in an unsupported format. Please try a different PDF file or ensure the file is not password-protected.");
        }
        throw new Error(`Failed to parse PDF: ${errorMessage}`);
      }
    }

    // Step 2: Run OCR with OpenAI (text-based or Vision API)
    console.log(`Step 2: Running OCR with OpenAI (${useVisionApi ? 'Vision API' : 'text-based'})...`);
    
    let ocrResult;
    if (useVisionApi && pdfBase64) {
      // Use Vision API for image-based PDFs
      console.log("Using OpenAI Vision API to process PDF as image...");
      ocrResult = await runOcrWithOpenAI({
        prompt: ocrConfig.prompt,
        inputText: undefined,
        imageData: pdfBase64, // Pass PDF as base64 image to Vision API
        fields: ocrConfig.fields,
      });
    } else if (extractedText) {
      // Use standard text-based OCR
      ocrResult = await runOcrWithOpenAI({
        prompt: ocrConfig.prompt,
        inputText: extractedText,
        imageData: undefined,
        fields: ocrConfig.fields,
      });
    } else {
      throw new Error("Unable to process PDF: no text extracted and no image data available.");
    }

    console.log("OCR completed, raw response keys:", Object.keys(ocrResult.parsedJson || {}));

    // Step 3: Normalize OCR output to ExtractedInvoice format
    console.log("Step 3: Normalizing OCR output...");
    const normalized = normalizeOcrOutput(ocrResult.parsedJson);
    console.log("Normalization successful:", {
      invoiceNumber: normalized.invoiceNumber,
      tripsCount: normalized.trips.length,
    });

    return normalized;
  } catch (error: any) {
    console.error("Error in extractInvoiceFromPdf:", error);
    throw new Error(`Failed to extract invoice data: ${error.message || "Unknown error"}`);
  }
}

/**
 * Extract invoice data from base64 PDF data URL
 */
export async function extractInvoiceFromBase64(
  base64Data: string,
  ocrConfig: {
    prompt: string;
    fields: any[];
  }
): Promise<ExtractedInvoice> {
  // Extract base64 data (remove data URL prefix if present)
  const base64String = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

  // Convert base64 to buffer
  const pdfBuffer = Buffer.from(base64String, "base64");

  return extractInvoiceFromPdf(pdfBuffer, ocrConfig);
}

