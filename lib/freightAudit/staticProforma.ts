/**
 * Static Proforma Dataset
 * Hard-coded in-memory Proforma records for PoC
 * TODO: Replace with real Get Proforma API call when ready
 */

export type ProformaRecord = {
  proformaId: string;
  clientId: string;
  branchId: string;
  transporterId: string;
  vehicleNumber: string;
  tripId: string;
  lrNumber: string;
  origin: string;
  destination: string;
  proformaDate: string; // ISO string
  baseFreight: number;
  additionalCharges: {
    detention?: number;
    toll?: number;
    unloading?: number;
    others?: number;
  };
  gstAmount: number;
};

export const STATIC_PROFORMA: ProformaRecord[] = [
  {
    proformaId: "PFR-1001",
    clientId: "CNR-001",
    branchId: "BR-001",
    transporterId: "TRN-001",
    vehicleNumber: "MH12AB1234",
    tripId: "TRIP-001",
    lrNumber: "LR-001",
    origin: "Mumbai",
    destination: "Pune",
    proformaDate: "2025-01-10",
    baseFreight: 12000,
    additionalCharges: {
      detention: 0,
      toll: 800,
      unloading: 200,
    },
    gstAmount: 2380,
  },
  {
    proformaId: "PFR-1002",
    clientId: "CNR-001",
    branchId: "BR-001",
    transporterId: "TRN-001",
    vehicleNumber: "MH12CD5678",
    tripId: "TRIP-002",
    lrNumber: "LR-002",
    origin: "Mumbai",
    destination: "Bangalore",
    proformaDate: "2025-01-11",
    baseFreight: 25000,
    additionalCharges: {
      detention: 1500,
      toll: 1200,
      unloading: 500,
    },
    gstAmount: 5040,
  },
  {
    proformaId: "PFR-1003",
    clientId: "CNR-001",
    branchId: "BR-001",
    transporterId: "TRN-001",
    vehicleNumber: "MH12EF9012",
    tripId: "TRIP-003",
    lrNumber: "LR-003",
    origin: "Pune",
    destination: "Hyderabad",
    proformaDate: "2025-01-12",
    baseFreight: 18000,
    additionalCharges: {
      detention: 800,
      toll: 900,
      unloading: 400,
      others: 300,
    },
    gstAmount: 5352,
  },
];

