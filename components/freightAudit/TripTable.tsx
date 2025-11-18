"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FreightAuditResult } from "@/types/freightAudit";
import StatusBadge from "./StatusBadge";
import VarianceCell from "./VarianceCell";
import { ChevronRight } from "lucide-react";

interface TripTableProps {
  result: FreightAuditResult;
  onTripClick: (index: number) => void;
}

export default function TripTable({ result, onTripClick }: TripTableProps) {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Trip Review</CardTitle>
          <div className="text-sm text-slate-600">
            {result.trips.length} trips available
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Trip ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Vehicle Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Base Freight
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Additional Charges
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  GST Variance
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {result.trips.map((trip, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onTripClick(index)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {trip.tripId || `TRIP-${index + 1}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{trip.vehicleNumber}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {trip.origin || "—"} → {trip.destination || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <VarianceCell
                      contracted={trip.proformaBaseFreight}
                      invoice={trip.invoiceBaseFreight}
                      variance={trip.baseDiff}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <VarianceCell
                      contracted={trip.proformaAdditionalTotal}
                      invoice={trip.invoiceAdditionalTotal}
                      variance={trip.additionalDiff}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {trip.proformaGstAmount !== null ? (
                      <div className="space-y-0.5">
                        <div className="text-xs text-slate-500 line-through">
                          ₹{trip.proformaGstAmount.toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          ₹{trip.invoiceGstAmount.toLocaleString()}
                        </div>
                        {trip.totalDiff !== null && trip.totalDiff !== 0 && (
                          <div
                            className={`text-xs font-medium ${
                              trip.totalDiff > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {trip.totalDiff > 0 ? "+" : ""}₹{Math.abs(trip.totalDiff).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-slate-900">
                        ₹{trip.invoiceGstAmount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge category={trip.category} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTripClick(index);
                      }}
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

