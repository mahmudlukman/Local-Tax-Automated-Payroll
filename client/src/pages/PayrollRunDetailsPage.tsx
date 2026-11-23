import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  AlertCircle,
  Building2,
  PieChart,
  Users,
  Check,
} from "lucide-react";
import PayrollTotalsCard from "../components/payroll/PayrollTotalsCard";
import PayslipTable from "../components/payroll/PayslipTable";
import ExportFormatPicker from "../components/payroll/ExportFormatPicker";
import Button from "../components/ui/Button";
import type { Payslip } from "../@types";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPeriod } from "../utils/formatDate";
import {
  useGetPayrollRunQuery,
  useGetExportFormatsQuery,
  useApprovePayrollRunMutation,
  useMarkPayrollRunPaidMutation,
} from "../redux/features/payroll/payrollApi";
import { useLazyGetPayslipPdfQuery } from "../redux/features/payslip/payslipApi";

type DetailTab = "payslips" | "statutory" | "audit";

export default function PayrollRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>("payslips");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportFormat, setExportFormat] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetPayrollRunQuery(
    id!,
    {
      skip: !id,
    },
  );

  const run = data?.payrollRun;
  const payslips = useMemo(() => data?.payslips ?? [], [data?.payslips]);

  const { data: exportFormats = [] } = useGetExportFormatsQuery(undefined);

  const [approvePayrollRun, { isLoading: isApproving }] =
    useApprovePayrollRunMutation();
  const [markPayrollRunPaid, { isLoading: isMarkingPaid }] =
    useMarkPayrollRunPaidMutation();
  const [fetchPayslipPdf] = useLazyGetPayslipPdfQuery();

  // Filter payslips based on active search
  const filteredPayslips = useMemo(() => {
    if (!searchQuery.trim()) return payslips;
    const query = searchQuery.toLowerCase();
    return payslips.filter((slip) => {
      const employee =
        typeof slip.employee === "object" && slip.employee !== null
          ? slip.employee
          : undefined;
      const name =
        `${employee?.firstName || ""} ${employee?.lastName || ""}`.toLowerCase();
      const code = (employee?.employeeId || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [payslips, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6 antialiased">
        <div className="h-8 w-48 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="h-32 rounded-2xl bg-neutral-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !run) {
    const message =
      (error as { data?: { message?: string } })?.data?.message ??
      "Payroll run not found.";
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center shadow-xs">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
        <h3 className="mt-3 text-sm font-semibold text-red-900">
          Unable to Load Payroll Execution
        </h3>
        <p className="mt-1 text-xs text-red-700">{message}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-red-300 bg-white px-3.5 py-2 text-xs font-semibold text-red-800 shadow-2xs hover:bg-red-50"
          >
            Retry Loading
          </button>
          <Link
            to="/payroll"
            className="rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800"
          >
            Return to List
          </Link>
        </div>
      </div>
    );
  }

  async function handleApprove() {
    try {
      await approvePayrollRun(id!).unwrap();
    } catch {
      // surface via mutation error state
    }
  }

  async function handleMarkPaid() {
    try {
      await markPayrollRunPaid(id!).unwrap();
    } catch {
      // surface via mutation error state
    }
  }

  function handleExport() {
    setIsExporting(true);
    // TODO: hit GET /payroll-run/:id/export?format=...
    setTimeout(() => setIsExporting(false), 600);
  }

  async function handleDownloadPdf(payslip: Payslip) {
    try {
      const blob = await fetchPayslipPdf(payslip._id).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const employeeName =
        typeof payslip.employee === "object" && payslip.employee !== null
          ? payslip.employee.firstName
          : "employee";
      a.download = `payslip-${employeeName || "employee"}-${payslip._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handle pdf download error
    }
  }

  const statusNormalized = run.status?.toLowerCase() || "draft";
  const totalPension =
    (run.totals as unknown as { totalPension?: number })?.totalPension ?? 0;
  const totalOtherDeductions =
    (run.totals as unknown as { totalOtherDeductions?: number })
      ?.totalOtherDeductions ?? 0;

  return (
    <div className="space-y-6 text-neutral-900 antialiased">
      {/* Back Navigation & Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5">
        <div>
          <Link
            to="/payroll"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Payroll Runs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              Payroll Period: {formatPeriod(run.period.month, run.period.year)}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {statusNormalized === "draft" && (
            <Button
              onClick={handleApprove}
              isLoading={isApproving}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
            >
              <ShieldCheck className="h-4 w-4" /> Approve Payroll
            </Button>
          )}

          {statusNormalized === "approved" && (
            <Button
              onClick={handleMarkPaid}
              isLoading={isMarkingPaid}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark Disbursed & Paid
            </Button>
          )}

          {statusNormalized !== "draft" && (
            <ExportFormatPicker
              formats={exportFormats}
              selected={exportFormat}
              onSelect={(fmtId) => setExportFormat(fmtId)}
              onExport={handleExport}
              isExporting={isExporting}
            />
          )}
        </div>
      </div>

      {/* Main Totals Card Header */}
      <PayrollTotalsCard
        period={run.period}
        status={run.status}
        totals={run.totals}
      />

      {/* Navigation Tabs & Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("payslips")}
            className={`pb-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === "payslips"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Payslips ({payslips.length})
          </button>
          <button
            onClick={() => setActiveTab("statutory")}
            className={`pb-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === "statutory"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Statutory & Deductions
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === "audit"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Lifecycle Audit Log
          </button>
        </div>

        {activeTab === "payslips" && (
          <div className="relative mb-2 sm:mb-0 w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search employee or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "payslips" && (
        <div className="space-y-4">
          <PayslipTable
            payslips={filteredPayslips}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>
      )}

      {activeTab === "statutory" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">PAYE Income Tax</span>
              <Building2 className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900">
              {formatCurrency(run.totals?.totalPAYE || 0)}
            </div>
            <p className="text-[11px] text-neutral-500">
              Remitted directly to State Internal Revenue Service.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">
                Pension Contributions
              </span>
              <PieChart className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900">
              {formatCurrency(totalPension)}
            </div>
            <p className="text-[11px] text-neutral-500">
              Combined Employer (10%) + Employee (8%) pension deductions.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">
                Other Deductions & NHF
              </span>
              <Users className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold font-mono text-neutral-900">
              {formatCurrency(totalOtherDeductions)}
            </div>
            <p className="text-[11px] text-neutral-500">
              Voluntary contributions, loans, and housing fund deductions.
            </p>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-semibold text-neutral-900">
            Execution Timeline & Approvals
          </h3>
          <div className="relative border-l border-neutral-200 ml-3 space-y-6 pl-5">
            <div className="relative">
              <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white text-white">
                <Check className="h-2.5 w-2.5" />
              </span>
              <p className="text-xs font-semibold text-neutral-900">
                Payroll Period Generated
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Draft batch initiated for {run.totals?.employeeCount ?? 0}{" "}
                active employees.
              </p>
            </div>

            <div className="relative">
              <span
                className={`absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                  statusNormalized === "approved" || statusNormalized === "paid"
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-300 text-neutral-600"
                }`}
              >
                {statusNormalized === "approved" ||
                statusNormalized === "paid" ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <Clock className="h-2.5 w-2.5" />
                )}
              </span>
              <p className="text-xs font-semibold text-neutral-900">
                Financial Audit & Verification
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {statusNormalized === "draft"
                  ? "Awaiting manager approval."
                  : "Approved by finance administrator."}
              </p>
            </div>

            <div className="relative">
              <span
                className={`absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                  statusNormalized === "paid"
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-300 text-neutral-600"
                }`}
              >
                {statusNormalized === "paid" ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <Clock className="h-2.5 w-2.5" />
                )}
              </span>
              <p className="text-xs font-semibold text-neutral-900">
                Bank Disbursement & Slip Delivery
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {statusNormalized === "paid"
                  ? "Funds transferred and digital payslips distributed."
                  : "Pending final payment execution."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
