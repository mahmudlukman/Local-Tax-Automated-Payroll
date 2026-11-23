import { useRef, type ReactNode } from "react";
import { useReactToPrint } from "react-to-print";
import { Link, useParams } from "react-router-dom";
import {
  Download,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import Button from "../components/ui/Button";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPeriod } from "../utils/formatDate";
import {
  useGetPayslipQuery,
  useLazyGetPayslipPdfQuery,
} from "../redux/features/payslip/payslipApi";

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-xs font-semibold text-neutral-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-neutral-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  isBold = false,
  isNegative = false,
  badge,
}: {
  label: string;
  value: ReactNode;
  isBold?: boolean;
  isNegative?: boolean;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 text-xs">
      <div className="flex items-center gap-2">
        <span
          className={
            isBold
              ? "font-semibold text-neutral-900"
              : "text-neutral-600 font-normal"
          }
        >
          {label}
        </span>
        {badge}
      </div>
      <span
        className={`font-mono text-xs ${
          isBold
            ? "font-bold text-neutral-900"
            : isNegative
              ? "text-red-600 font-medium"
              : "text-neutral-800 font-medium"
        }`}
      >
        {isNegative && "- "}
        {value}
      </span>
    </div>
  );
}

export default function PayslipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const printRef = useRef<HTMLDivElement>(null);

  const {
    data: payslip,
    isLoading,
    isError,
    error,
  } = useGetPayslipQuery(id!, { skip: !id });

  const [fetchPayslipPdf, { isFetching: isDownloading }] =
    useLazyGetPayslipPdfQuery();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: payslip
      ? `Payslip-${formatPeriod(payslip.period.month, payslip.period.year)}`
      : "Payslip",
  });

  async function handleDownload() {
    try {
      const blob = await fetchPayslipPdf(id!).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // surface error notification if needed
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4 antialiased">
        <div className="h-6 w-32 rounded bg-neutral-200 animate-pulse" />
        <div className="h-32 w-full rounded-xl bg-neutral-100 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !payslip) {
    const message =
      (error as { data?: { message?: string } })?.data?.message ??
      "Payslip statement was not found.";
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-2xs antialiased">
        <AlertCircle className="mx-auto h-8 w-8 text-neutral-400" />
        <h3 className="mt-3 text-sm font-semibold text-neutral-900">
          Statement Unavailable
        </h3>
        <p className="mt-1 text-xs text-neutral-500">{message}</p>
        <Link
          to="/payslips"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Payslips
        </Link>
      </div>
    );
  }

  const { breakdown } = payslip;
  const employee =
    typeof payslip.employee === "string" ? null : payslip.employee;

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-neutral-900 antialiased">
      {/* Top Bar / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/payslips"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all payslips
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => handlePrint()}
            className="text-xs font-semibold"
          >
            <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
            Print
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownload}
            isLoading={isDownloading}
            className="text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Payslip Statement Canvas — only this ref'd node gets printed */}
      <div
        ref={printRef}
        className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs space-y-6"
      >
        {/* Header Metadata */}
        <div className="flex items-start justify-between border-b border-neutral-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                <CheckCircle2 className="h-3 w-3" /> Paid Statement
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                #{id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {formatPeriod(payslip.period.month, payslip.period.year)}
            </h1>
            {employee && (
              <p className="text-xs font-medium text-neutral-600">
                {employee.firstName} {employee.lastName}{" "}
                <span className="text-neutral-400">·</span> ID:{" "}
                <span className="font-mono">{employee.employeeId}</span>
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-xs">
              HR
            </div>
            <p className="mt-1 text-[11px] font-medium text-neutral-500">
              Salary Remittance
            </p>
          </div>
        </div>

        {/* High-Level Calculation Bar */}
        <div className="grid grid-cols-3 gap-3 rounded-lg bg-neutral-50 p-3.5 border border-neutral-200/60">
          <div>
            <span className="block text-[11px] font-medium text-neutral-500">
              Gross Pay
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-900">
              {formatCurrency(breakdown.monthlyGross)}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-neutral-500">
              Total Deductions
            </span>
            <span className="font-mono text-sm font-semibold text-red-600">
              -{formatCurrency(breakdown.totalMonthlyDeductions)}
            </span>
          </div>
          <div className="border-l border-neutral-200 pl-3">
            <span className="block text-[11px] font-semibold text-neutral-900">
              Net Disbursement
            </span>
            <span className="font-mono text-sm font-bold text-emerald-700">
              {formatCurrency(payslip.netPay)}
            </span>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="space-y-2">
          <SectionHeader
            icon={Receipt}
            title="Earnings Breakdown"
            subtitle="Base salary structure and statutory monthly allowances"
          />
          <div className="divide-y divide-neutral-100">
            <BreakdownRow
              label="Basic Salary"
              value={formatCurrency(breakdown.basic)}
            />
            <BreakdownRow
              label="Housing Allowance"
              value={formatCurrency(breakdown.housing)}
            />
            <BreakdownRow
              label="Transport Allowance"
              value={formatCurrency(breakdown.transport)}
            />
            {breakdown.taxableAllowances > 0 && (
              <BreakdownRow
                label="Other Taxable Allowances"
                value={formatCurrency(breakdown.taxableAllowances)}
              />
            )}
            {breakdown.nonTaxableAllowances > 0 && (
              <BreakdownRow
                label="Other Non-Taxable Allowances"
                value={formatCurrency(breakdown.nonTaxableAllowances)}
                badge={
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 font-medium">
                    Exempt
                  </span>
                }
              />
            )}
            <div className="pt-1">
              <BreakdownRow
                label="Total Monthly Gross Pay"
                value={formatCurrency(breakdown.monthlyGross)}
                isBold
              />
            </div>
          </div>
        </div>

        {/* Statutory Deductions */}
        <div className="space-y-2">
          <SectionHeader
            icon={FileSpreadsheet}
            title="Statutory Deductions & Taxes"
            subtitle="Itemized PAYE tax withholdings and employee pension contributions"
          />
          <div className="divide-y divide-neutral-100">
            <BreakdownRow
              label="PAYE Tax Withholding"
              value={formatCurrency(breakdown.paye.monthly)}
              isNegative
            />
            <BreakdownRow
              label="Pension Contribution (Employee)"
              value={formatCurrency(breakdown.pension.employeeMonthly)}
              isNegative
              badge={
                breakdown.pension.optedOut ? (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200/60">
                    Opted Out
                  </span>
                ) : undefined
              }
            />
            <BreakdownRow
              label="National Housing Fund (NHF)"
              value={formatCurrency(breakdown.nhf.monthly)}
              isNegative
              badge={
                breakdown.nhf.optedOut ? (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200/60">
                    Opted Out
                  </span>
                ) : undefined
              }
            />
            <div className="pt-1">
              <BreakdownRow
                label="Total Monthly Deductions"
                value={formatCurrency(breakdown.totalMonthlyDeductions)}
                isBold
                isNegative
              />
            </div>
          </div>
        </div>

        {/* Net Take Home Hero Box */}
        <div className="rounded-xl bg-neutral-900 p-4 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-400">
                Total Net Salary Paid
              </span>
              <p className="text-[11px] text-neutral-400">
                Credited directly to bank account
              </p>
            </div>
            <span className="font-mono text-xl font-extrabold text-white">
              {formatCurrency(payslip.netPay)}
            </span>
          </div>
        </div>

        {/* Disbursement Destination & Employer Contributions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          {payslip.bankSnapshot && (
            <div className="rounded-lg border border-neutral-200/80 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                <CreditCard className="h-3.5 w-3.5 text-neutral-500" />
                Disbursement Account
              </div>
              <div className="text-xs space-y-1 text-neutral-600">
                <div className="flex justify-between">
                  <span>Bank:</span>
                  <span className="font-medium text-neutral-900">
                    {payslip.bankSnapshot.bankName ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number:</span>
                  <span className="font-mono font-medium text-neutral-900">
                    {payslip.bankSnapshot.accountNumber
                      ? `•••• ${payslip.bankSnapshot.accountNumber.slice(-4)}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-neutral-200/80 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
              <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
              Employer Contributions
            </div>
            <div className="text-xs space-y-1 text-neutral-600">
              <div className="flex justify-between">
                <span>Employer Pension Match:</span>
                <span className="font-mono font-medium text-neutral-900">
                  {formatCurrency(breakdown.pension.employerMonthly || 0)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                Employer match is remitted directly to your Pension Fund
                Administrator (PFA).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
