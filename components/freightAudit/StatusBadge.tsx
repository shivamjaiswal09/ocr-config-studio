"use client";

import { TripCategory } from "@/types/freightAudit";

interface StatusBadgeProps {
  category: TripCategory;
  matched?: boolean;
}

export default function StatusBadge({ category, matched = true }: StatusBadgeProps) {
  if (!matched) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
        Unmatched
      </span>
    );
  }

  switch (category) {
    case "EXACT_MATCH":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          Matched
        </span>
      );
    case "BASE_FREIGHT_DIFF":
    case "ADDITIONAL_CHARGES_DIFF":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
          Partially Matched
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          Mismatched
        </span>
      );
  }
}

