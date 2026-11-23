import { CheckCircle2, Clock, Check } from "lucide-react";
import type { PayrollRunStatus, PayrollTotals } from "../../@types";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatPeriod } from "../../utils/formatDate";

export interface PayrollTotalsCardProps {
  period: { month: number; year: number };
  status: PayrollRunStatus;
  totals: PayrollTotals;
}

const STATUS_CONFIG: Record<
  PayrollRunStatus,
  { label: string; style: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    style: "bg-amber-50 text-amber-800 border-amber-200/80",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    style: "bg-blue-50 text-blue-800 border-blue-200/80",
    icon: Check,
  },
  paid: {
    label: "Paid & Disbursed",
    style: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    icon: CheckCircle2,
  },
};

/** Exported for reuse across payroll run tables, headers, and detail views. */
export function PayrollStatusBadge({ status }: { status: PayrollRunStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${config.style}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {config.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  highlight = false,
  isMono = true,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  isMono?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-2xs transition-colors ${
        highlight
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200/80 bg-white text-neutral-900"
      }`}
    >
      <div
        className={`text-xs font-medium ${
          highlight ? "text-neutral-400" : "text-neutral-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-2 font-bold ${
          highlight ? "text-xl text-white" : "text-base text-neutral-900"
        } ${isMono ? "font-mono" : ""}`}
      >
        {value}
      </div>
      {subtext && (
        <div
          className={`mt-1 text-[11px] ${
            highlight ? "text-neutral-400" : "text-neutral-400"
          }`}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}

export default function PayrollTotalsCard({
  period,
  status,
  totals,
}: PayrollTotalsCardProps) {
  const totalPension =
    (totals.totalEmployeePension || 0) + (totals.totalEmployerPension || 0);
  const totalLevies = (totals.itf || 0) + (totals.nsitf || 0);

  return (
    <div className="space-y-4 text-neutral-900 antialiased">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-neutral-900">
            {formatPeriod(period.month, period.year)}
          </h2>
          <p className="text-xs text-neutral-500">
            Payroll summary totals and statutory remittance breakdown
          </p>
        </div>
        <PayrollStatusBadge status={status} />
      </div>

      {/* Primary Metrics Deck */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Staff Headcount"
          value={`${totals.employeeCount} Employees`}
          subtext="Included in batch"
          isMono={false}
        />
        <MetricCard
          label="Total Monthly Gross Pay"
          value={formatCurrency(totals.totalGross)}
          subtext="Pre-deduction baseline"
        />
        <MetricCard
          label="PAYE Income Tax Withholding"
          value={formatCurrency(totals.totalPAYE)}
          subtext="State IRS remittance liability"
        />
        <MetricCard
          label="Total Net Disbursement"
          value={formatCurrency(totals.totalNetPay)}
          subtext="Direct bank payout"
          highlight
        />
      </div>

      {/* Secondary Statutory Liabilities Deck */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <MetricCard
          label="Total Pension Remittance"
          value={formatCurrency(totalPension)}
          subtext={`Employee: ${formatCurrency(
            totals.totalEmployeePension,
          )} | Employer: ${formatCurrency(totals.totalEmployerPension)}`}
        />
        <MetricCard
          label="National Housing Fund (NHF)"
          value={formatCurrency(totals.totalNHF)}
          subtext="2.5% basic salary employee deduction"
        />
        <MetricCard
          label="Employer Statutory Levies (ITF + NSITF)"
          value={formatCurrency(totalLevies)}
          subtext={`ITF: ${formatCurrency(
            totals.itf,
          )} | NSITF: ${formatCurrency(totals.nsitf)}`}
        />
      </div>
    </div>
  );
}
