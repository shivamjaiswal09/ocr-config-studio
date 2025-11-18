"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FreightAuditResult } from "@/types/freightAudit";
import { Package, AlertCircle, DollarSign, TrendingUp } from "lucide-react";

interface SummaryPanelProps {
  result: FreightAuditResult;
}

export default function SummaryPanel({ result }: SummaryPanelProps) {
  const { summary } = result;

  // Calculate percentages
  const totalTrips = summary.totalTrips;
  const baseDiffPercentage = totalTrips > 0 ? (summary.baseDiffTrips / totalTrips) * 100 : 0;
  const additionalDiffPercentage = totalTrips > 0 ? (summary.additionalDiffTrips / totalTrips) * 100 : 0;
  const exactMatchPercentage = totalTrips > 0 ? (summary.exactMatchTrips / totalTrips) * 100 : 0;

  // Calculate total amounts
  const totalInvoiceAmount = result.trips.reduce(
    (sum, trip) => sum + trip.invoiceBaseFreight + trip.invoiceAdditionalTotal + trip.invoiceGstAmount,
    0
  );
  const totalProformaAmount = result.trips.reduce(
    (sum, trip) =>
      sum +
      (trip.proformaBaseFreight || 0) +
      (trip.proformaAdditionalTotal || 0) +
      (trip.proformaGstAmount || 0),
    0
  );

  const breakdownData = [
    {
      category: "Exact Match",
      trips: summary.exactMatchTrips,
      amount: result.trips
        .filter((t) => t.category === "EXACT_MATCH")
        .reduce((sum, t) => sum + (t.totalDiff || 0), 0),
      percentage: exactMatchPercentage,
      color: "green",
    },
    {
      category: "Base Freight Mismatch",
      trips: summary.baseDiffTrips,
      amount: result.trips
        .filter((t) => t.category === "BASE_FREIGHT_DIFF")
        .reduce((sum, t) => sum + (t.totalDiff || 0), 0),
      percentage: baseDiffPercentage,
      color: "yellow",
    },
    {
      category: "Additional Charges Mismatch",
      trips: summary.additionalDiffTrips,
      amount: result.trips
        .filter((t) => t.category === "ADDITIONAL_CHARGES_DIFF")
        .reduce((sum, t) => sum + (t.totalDiff || 0), 0),
      percentage: additionalDiffPercentage,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Trips</p>
                <p className="text-2xl font-bold text-slate-900">{summary.totalTrips}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <Package className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Base Freight Mismatch</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.baseDiffTrips}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Additional Charges Mismatch</p>
                <p className="text-2xl font-bold text-orange-600">{summary.additionalDiffTrips}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Difference</p>
                <p
                  className={`text-2xl font-bold ${
                    summary.totalDifferenceAmount >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₹{Math.abs(summary.totalDifferenceAmount).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Trips
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    % Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {breakdownData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">{item.trips}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                      ₹{Math.abs(item.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

