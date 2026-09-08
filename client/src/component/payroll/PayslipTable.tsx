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
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
        Loading payslips…
      </div>
    );
  }

  if (payslips.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
        No payslips for this run yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-2.5 font-medium">Employee</th>
            <th className="px-4 py-2.5 text-right font-medium">Gross pay</th>
            <th className="px-4 py-2.5 text-right font-medium">PAYE</th>
            <th className="px-4 py-2.5 text-right font-medium">Pension</th>
            <th className="px-4 py-2.5 text-right font-medium">NHF</th>
            <th className="px-4 py-2.5 text-right font-medium">Net pay</th>
            {onDownloadPdf && <th className="px-4 py-2.5 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {payslips.map((payslip) => {
            const employee = getEmployeeRef(payslip);
            return (
              <tr
                key={payslip._id}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <div className="text-gray-900">
                    {employee
                      ? `${employee.firstName} ${employee.lastName}`
                      : "—"}
                  </div>
                  {employee && (
                    <div className="font-mono text-xs text-gray-500">
                      {employee.employeeId}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {formatCurrency(payslip.breakdown.monthlyGross)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {formatCurrency(payslip.breakdown.paye.monthly)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {formatCurrency(payslip.breakdown.pension.employeeMonthly)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {formatCurrency(payslip.breakdown.nhf.monthly)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">
                  {formatCurrency(payslip.netPay)}
                </td>
                {onDownloadPdf && (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(payslip)}
                      className="text-xs text-gray-600 underline decoration-gray-300 underline-offset-2 hover:text-gray-900"
                    >
                      Download PDF
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
