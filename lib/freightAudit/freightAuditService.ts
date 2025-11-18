/**
 * Freight Audit Service
 * Matches invoice trips with Proforma records and computes differences
 */

import { ProformaRecord } from "./staticProforma";
import {
  ExtractedInvoice,
  ExtractedInvoiceTrip,
  AuditTripResult,
  AuditSummary,
  FreightAuditResult,
  TripCategory,
} from "@/types/freightAudit";

/**
 * Sum all additional charges from an object
 */
function sumAdditionalCharges(charges: Record<string, number | undefined>): number {
  return Object.values(charges).reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Find matching Proforma record by vehicleNumber
 */
function findMatchingProforma(
  vehicleNumber: string,
  proformaRecords: ProformaRecord[]
): ProformaRecord | null {
  // Normalize vehicle number for matching (remove spaces, convert to uppercase)
  const normalizedVehicle = vehicleNumber.trim().toUpperCase().replace(/\s+/g, "");
  
  return (
    proformaRecords.find((proforma) => {
      const normalizedProforma = proforma.vehicleNumber.trim().toUpperCase().replace(/\s+/g, "");
      return normalizedProforma === normalizedVehicle;
    }) || null
  );
}

/**
 * Compute difference category for a trip
 */
function computeCategory(
  baseDiff: number | null,
  additionalDiff: number | null
): TripCategory {
  if (baseDiff === null || additionalDiff === null) {
    // No match found, default to BASE_FREIGHT_DIFF
    return "BASE_FREIGHT_DIFF";
  }

  if (baseDiff === 0 && additionalDiff === 0) {
    return "EXACT_MATCH";
  }

  if (baseDiff !== 0 && additionalDiff === 0) {
    return "BASE_FREIGHT_DIFF";
  }

  // If additional charges differ (or both differ), categorize as ADDITIONAL_CHARGES_DIFF
  return "ADDITIONAL_CHARGES_DIFF";
}

/**
 * Process a single invoice trip and compute audit result
 */
function processTrip(
  trip: ExtractedInvoiceTrip,
  proformaRecords: ProformaRecord[]
): AuditTripResult {
  const matchingProforma = findMatchingProforma(trip.vehicleNumber, proformaRecords);

  if (!matchingProforma) {
    // No match found
    const invoiceAdditionalTotal = sumAdditionalCharges(trip.additionalCharges);
    const invoiceTotal = trip.baseFreight + invoiceAdditionalTotal + trip.gstAmount;

    return {
      proformaId: null,
      tripId: null,
      lrNumber: null,
      vehicleNumber: trip.vehicleNumber,
      origin: trip.origin,
      destination: trip.destination,
      proformaBaseFreight: null,
      invoiceBaseFreight: trip.baseFreight,
      proformaAdditionalTotal: null,
      invoiceAdditionalTotal,
      proformaGstAmount: null,
      invoiceGstAmount: trip.gstAmount,
      baseDiff: null,
      additionalDiff: null,
      totalDiff: null,
      diffPercent: null,
      category: "BASE_FREIGHT_DIFF",
    };
  }

  // Match found - compute differences
  const proformaAdditionalTotal = sumAdditionalCharges(matchingProforma.additionalCharges);
  const invoiceAdditionalTotal = sumAdditionalCharges(trip.additionalCharges);

  const baseDiff = trip.baseFreight - matchingProforma.baseFreight;
  const additionalDiff = invoiceAdditionalTotal - proformaAdditionalTotal;

  const proformaTotal =
    matchingProforma.baseFreight + proformaAdditionalTotal + matchingProforma.gstAmount;
  const invoiceTotal = trip.baseFreight + invoiceAdditionalTotal + trip.gstAmount;
  const totalDiff = invoiceTotal - proformaTotal;

  // Compute percentage difference (based on proforma total, guard division by zero)
  const diffPercent =
    proformaTotal !== 0 ? (totalDiff / proformaTotal) * 100 : null;

  const category = computeCategory(baseDiff, additionalDiff);

  return {
    proformaId: matchingProforma.proformaId,
    tripId: matchingProforma.tripId,
    lrNumber: matchingProforma.lrNumber,
    vehicleNumber: trip.vehicleNumber,
    origin: trip.origin || matchingProforma.origin,
    destination: trip.destination || matchingProforma.destination,
    proformaBaseFreight: matchingProforma.baseFreight,
    invoiceBaseFreight: trip.baseFreight,
    proformaAdditionalTotal,
    invoiceAdditionalTotal,
    proformaGstAmount: matchingProforma.gstAmount,
    invoiceGstAmount: trip.gstAmount,
    baseDiff,
    additionalDiff,
    totalDiff,
    diffPercent,
    category,
  };
}

/**
 * Compute audit summary from trip results
 */
function computeSummary(trips: AuditTripResult[]): AuditSummary {
  const totalTrips = trips.length;
  let exactMatchTrips = 0;
  let baseDiffTrips = 0;
  let additionalDiffTrips = 0;
  let totalDifferenceAmount = 0;

  for (const trip of trips) {
    if (trip.category === "EXACT_MATCH") {
      exactMatchTrips++;
    } else if (trip.category === "BASE_FREIGHT_DIFF") {
      baseDiffTrips++;
    } else if (trip.category === "ADDITIONAL_CHARGES_DIFF") {
      additionalDiffTrips++;
    }

    if (trip.totalDiff !== null) {
      totalDifferenceAmount += trip.totalDiff;
    }
  }

  return {
    totalTrips,
    exactMatchTrips,
    baseDiffTrips,
    additionalDiffTrips,
    totalDifferenceAmount,
  };
}

/**
 * Run freight audit: match invoice trips with Proforma and compute differences
 */
export function runFreightAudit(
  extractedInvoice: ExtractedInvoice,
  proformaRecords: ProformaRecord[],
  context?: {
    clientId?: string;
    branchId?: string;
    transporterId?: string;
  }
): FreightAuditResult {
  // Process each trip
  const tripResults: AuditTripResult[] = extractedInvoice.trips.map((trip) =>
    processTrip(trip, proformaRecords)
  );

  // Compute summary
  const summary = computeSummary(tripResults);

  return {
    invoice: extractedInvoice,
    summary,
    trips: tripResults,
  };
}

