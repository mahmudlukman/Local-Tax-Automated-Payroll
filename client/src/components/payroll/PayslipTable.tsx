import { useState, useMemo } from "react";
import { Download, FileText, Search, Loader2 } from "lucide-react";
import type { Payslip, PayslipEmployeeRef } from "../../@types";
import { formatCurrency } from "../../utils/formatCurrency";

export interface PayslipTableProps {
  payslips: Payslip[];
  isLoading?: boolean;
  onDownloadPdf?: (payslip: Payslip) => void;
}

function getEmployeeRef(payslip: Payslip): PayslipEmployeeRef | null {
  return typeof payslip.employee === "string" ? null : payslip.employee;
}

export default function PayslipTable({
  payslips,
  isLoading = false,
  onDownloadPdf,
}: PayslipTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter payslips dynamically by name or employee ID
  const filteredPayslips = useMemo(() => {
    if (!searchQuery.trim()) return payslips;
    const query = searchQuery.toLowerCase().trim();

    return payslips.filter((p) => {
      const emp = getEmployeeRef(p);
      if (!emp) return false;
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const code = (emp.employeeId || "").toLowerCase();
      return fullName.includes(query) || code.includes(query);
    });
  }, [payslips, searchQuery]);

  async function handleDownload(payslip: Payslip) {
    if (!onDownloadPdf) return;
    try {
      setDownloadingId(payslip._id);
      await onDownloadPdf(payslip);
    } finally {
      setDownloadingId(null);
    }
  }

  // Skeleton row loader state
  if (isLoading) {
    return (
      <div className="space-y-3 antialiased">
        <div className="h-9 w-64 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-neutral-900 antialiased">
      {/* Search Header Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or staff ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs transition-colors"
          />
        </div>
        <span className="text-[11px] font-medium text-neutral-500">
          Showing {filteredPayslips.length} of {payslips.length} records
        </span>
      </div>

      {/* Main Payslip Breakdown Table */}
      {filteredPayslips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-neutral-300 stroke-[1.5]" />
          <p className="mt-2 text-xs font-semibold text-neutral-700">
            No payslips found
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            {searchQuery
              ? "No matching staff entries found for your filter."
              : "No payslip records available in this payroll batch."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500">
                <th className="px-4 py-3">Employee Details</th>
                <th className="px-4 py-3 text-right">Gross Salary</th>
                <th className="px-4 py-3 text-right">PAYE Tax</th>
                <th className="px-4 py-3 text-right">Pension (8%)</th>
                <th className="px-4 py-3 text-right">NHF (2.5%)</th>
                <th className="px-4 py-3 text-right">Net Take-Home</th>
                {onDownloadPdf && (
                  <th className="px-4 py-3 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-normal">
              {filteredPayslips.map((payslip) => {
                const employee = getEmployeeRef(payslip);
                const isDownloading = downloadingId === payslip._id;

                return (
                  <tr
                    key={payslip._id}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">
                        {employee
                          ? `${employee.firstName} ${employee.lastName}`
                          : "Unassigned"}
                      </div>
                      {employee?.employeeId && (
                        <div className="font-mono text-[10px] text-neutral-400">
                          {employee.employeeId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-700">
                      {formatCurrency(payslip.breakdown?.monthlyGross || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-700">
                      {formatCurrency(payslip.breakdown?.paye?.monthly || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-700">
                      {formatCurrency(
                        payslip.breakdown?.pension?.employeeMonthly || 0,
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-700">
                      {formatCurrency(payslip.breakdown?.nhf?.monthly || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                      {formatCurrency(payslip.netPay || 0)}
                    </td>
                    {onDownloadPdf && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={isDownloading}
                          onClick={() => handleDownload(payslip)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none disabled:opacity-60 transition-colors"
                        >
                          {isDownloading ? (
                            <Loader2 className="h-3 w-3 animate-spin text-neutral-500" />
                          ) : (
                            <Download className="h-3 w-3 text-neutral-400" />
                          )}
                          <span>PDF</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
