import type { PayrollRunStatus, PayrollTotals } from "../../@types";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatPeriod } from "../../utils/formatDate";

export interface PayrollTotalsCardProps {
  period: { month: number; year: number };
  status: PayrollRunStatus;
  totals: PayrollTotals;
}

const STATUS_LABEL: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  paid: "Paid",
};

/** Exported for reuse on payroll run list pages, not just the detail view. */
export function PayrollStatusBadge({ status }: { status: PayrollRunStatus }) {
  const styles: Record<PayrollRunStatus, string> = {
    draft: "border border-gray-300 text-gray-600",
    approved: "bg-gray-200 text-gray-800",
    paid: "bg-gray-900 text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${styles[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-1.5 text-xs text-gray-500">{label}</div>
      <div className="font-mono text-lg text-gray-900">{value}</div>
    </div>
  );
}

export default function PayrollTotalsCard({
  period,
  status,
  totals,
}: PayrollTotalsCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900">
          {formatPeriod(period.month, period.year)}
        </h2>
        <PayrollStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Employees" value={String(totals.employeeCount)} />
        <Metric label="Gross pay" value={formatCurrency(totals.totalGross)} />
        <Metric label="PAYE" value={formatCurrency(totals.totalPAYE)} />
        <Metric label="Net pay" value={formatCurrency(totals.totalNetPay)} />
        <Metric
          label="Employee pension"
          value={formatCurrency(totals.totalEmployeePension)}
        />
        <Metric
          label="Employer pension"
          value={formatCurrency(totals.totalEmployerPension)}
        />
        <Metric label="NHF" value={formatCurrency(totals.totalNHF)} />
        <Metric
          label="ITF + NSITF"
          value={formatCurrency(totals.itf + totals.nsitf)}
        />
      </div>
    </div>
  );
}
