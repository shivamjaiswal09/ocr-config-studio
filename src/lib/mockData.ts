import { OcrConfig } from "@/types/config";

export const PAYLOAD_FIELDS = [
  { value: "invoice_number", label: "Invoice Number" },
  { value: "invoice_date", label: "Invoice Date" },
  { value: "due_date", label: "Due Date" },
  { value: "consignor_name", label: "Consignor Name" },
  { value: "consignee_name", label: "Consignee Name" },
  { value: "transporter_name", label: "Transporter Name" },
  { value: "total_amount", label: "Total Amount" },
  { value: "tax_amount", label: "Tax Amount" },
  { value: "lr_number", label: "LR Number" },
  { value: "vehicle_number", label: "Vehicle Number" },
  { value: "origin_location", label: "Origin Location" },
  { value: "destination_location", label: "Destination Location" },
  { value: "line_items[]", label: "Line Items (Array)" },
  { value: "none", label: "None / Not Mapped" },
];

export const DOCUMENT_TYPES = [
  "Freight Invoice",
  "POD",
  "LR",
  "Delivery Challan",
  "Bill of Lading",
];

export const mockConfigs: OcrConfig[] = [
  {
    id: "config-1",
    documentType: "Freight Invoice",
    companyId: "COMP001",
    transporterCompanyId: "TRANS001",
    fields: [
      {
        id: "field-1",
        label: "Invoice Number",
        key: "invoice_number",
        dataType: "string",
        required: true,
        exampleValue: "INV-2024-001",
        mappedPayloadKey: "invoice_number",
      },
      {
        id: "field-2",
        label: "Invoice Date",
        key: "invoice_date",
        dataType: "date",
        required: true,
        exampleValue: "2024-01-15",
        mappedPayloadKey: "invoice_date",
      },
      {
        id: "field-3",
        label: "Total Amount",
        key: "total_amount",
        dataType: "number",
        required: true,
        exampleValue: "45000.00",
        mappedPayloadKey: "total_amount",
      },
      {
        id: "field-4",
        label: "Consignor Name",
        key: "consignor_name",
        dataType: "string",
        required: true,
        exampleValue: "ABC Logistics Ltd",
        mappedPayloadKey: "consignor_name",
      },
    ],
    prompt: "You are an OCR assistant specialized in extracting data from freight invoices. Extract the following fields and return JSON matching the mapped payload structure.",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "config-2",
    documentType: "POD",
    companyId: "COMP001",
    fields: [
      {
        id: "field-5",
        label: "LR Number",
        key: "lr_number",
        dataType: "string",
        required: true,
        exampleValue: "LR-2024-123",
        mappedPayloadKey: "lr_number",
      },
      {
        id: "field-6",
        label: "Consignee Name",
        key: "consignee_name",
        dataType: "string",
        required: true,
        exampleValue: "XYZ Corp",
        mappedPayloadKey: "consignee_name",
      },
    ],
    prompt: "Extract proof of delivery information from the document.",
    updatedAt: "2024-01-14T09:15:00Z",
  },
  {
    id: "config-3",
    documentType: "Freight Invoice",
    companyId: "COMP002",
    fields: [
      {
        id: "field-7",
        label: "Invoice Number",
        key: "invoice_number",
        dataType: "string",
        required: true,
        mappedPayloadKey: "invoice_number",
      },
    ],
    prompt: "Extract freight invoice details for Company 002.",
    updatedAt: "2024-01-10T14:20:00Z",
  },
];
