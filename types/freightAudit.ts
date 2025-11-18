/**
 * Freight Audit Type Definitions
 * Types for invoice extraction and audit results
 */

export type ExtractedInvoiceTrip = {
  vehicleNumber: string;
  origin?: string;
  destination?: string;
  lrNumber?: string;
  tripId?: string;
  baseFreight: number;
  additionalCharges: {
    detention?: number;
    toll?: number;
    unloading?: number;
    [key: string]: number | undefined;
  };
  gstAmount: number;
};

export type ExtractedInvoice = {
  invoiceNumber: string;
  invoiceDate: string; // ISO string
  trips: ExtractedInvoiceTrip[];
};

export type TripCategory = "EXACT_MATCH" | "BASE_FREIGHT_DIFF" | "ADDITIONAL_CHARGES_DIFF";

export type AuditTripResult = {
  proformaId: string | null;
  tripId: string | null;
  lrNumber: string | null;
  vehicleNumber: string;
  origin?: string;
  destination?: string;
  proformaBaseFreight: number | null;
  invoiceBaseFreight: number;
  proformaAdditionalTotal: number | null;
  invoiceAdditionalTotal: number;
  proformaGstAmount: number | null;
  invoiceGstAmount: number;
  baseDiff: number | null;
  additionalDiff: number | null;
  totalDiff: number | null;
  diffPercent: number | null;
  category: TripCategory;
};

export type AuditSummary = {
  totalTrips: number;
  exactMatchTrips: number;
  baseDiffTrips: number;
  additionalDiffTrips: number;
  totalDifferenceAmount: number;
};

export type FreightAuditResult = {
  invoice: ExtractedInvoice;
  summary: AuditSummary;
  trips: AuditTripResult[];
};

