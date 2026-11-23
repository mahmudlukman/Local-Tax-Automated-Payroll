import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Search,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Banknote,
  Users,
  CalendarCheck2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Button from "../components/ui/Button";
import RunPayrollModal from "../components/payroll/RunPayrollModal";
import { PayrollStatusBadge } from "../components/payroll/PayrollTotalsCard";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPeriod } from "../utils/formatDate";
import {
  useListPayrollRunsQuery,
  useRunPayrollMutation,
} from "../redux/features/payroll/payrollApi";

type StatusFilter = "ALL" | "DRAFT" | "APPROVED" | "PAID";

export default function PayrollRunListPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const {
    data: payrollRuns = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListPayrollRunsQuery();

  const [runPayroll, { isLoading: isRunning, error: runMutationError }] =
    useRunPayrollMutation();

  async function handleRunPayroll(values: { month: number; year: number }) {
    try {
      await runPayroll(values).unwrap();
      setIsModalOpen(false);
    } catch {
      // Handled via runError below
    }
  }

  const runError = runMutationError
    ? ((runMutationError as { data?: { message?: string } })?.data?.message ??
      "Failed to initiate payroll run. Please try again.")
    : null;

  // Key KPI Metrics computed from backend payload
  const metrics = useMemo(() => {
    if (!payrollRuns.length) {
      return { totalNet: 0, totalEmployees: 0, avgRunNet: 0, totalRuns: 0 };
    }

    const totalNet = payrollRuns.reduce(
      (acc, run) => acc + (run.totals?.totalNetPay || 0),
      0,
    );
    const totalEmployees = payrollRuns[0]?.totals?.employeeCount || 0;
    const avgRunNet = totalNet / payrollRuns.length;

    return {
      totalNet,
      totalEmployees,
      avgRunNet,
      totalRuns: payrollRuns.length,
    };
  }, [payrollRuns]);

  // Filtered Payroll Runs
  const filteredRuns = useMemo(() => {
    return payrollRuns.filter((run) => {
      const periodLabel = formatPeriod(
        run.period.month,
        run.period.year,
      ).toLowerCase();
      const matchesSearch = periodLabel.includes(
        searchQuery.toLowerCase().trim(),
      );
      const matchesStatus =
        statusFilter === "ALL" || run.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payrollRuns, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 text-neutral-900 antialiased">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Payroll Runs
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Manage company payroll executions, tax withholdings, and salary
            disbursement schedules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-neutral-800"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Total Net Disbursed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-neutral-900 font-mono">
            {formatCurrency(metrics.totalNet)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
            <TrendingUp className="h-3 w-3 text-emerald-600" /> Across{" "}
            {metrics.totalRuns} processed periods
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Active Workforce
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-neutral-900 font-mono">
            {metrics.totalEmployees}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Employees included in latest cycle
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Average Net Run
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-neutral-900 font-mono">
            {formatCurrency(metrics.avgRunNet)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Average payroll expenditure per month
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Payroll Health
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> All Systems
            Synced
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Automated statutory rules applied
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by period..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50/60 p-1 shadow-2xs">
          <SlidersHorizontal className="ml-2 mr-1 h-3.5 w-3.5 text-neutral-400" />
          {(["ALL", "DRAFT", "APPROVED", "PAID"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  statusFilter === status
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
          <div className="divide-y divide-neutral-100 p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between pt-2">
                <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-neutral-200 animate-pulse" />
                <div className="h-4 w-12 rounded bg-neutral-200 animate-pulse" />
                <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200/80 bg-red-50/50 p-8 text-center shadow-2xs">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <h3 className="mt-3 text-sm font-semibold text-red-900">
            Failed to Load Payroll Records
          </h3>
          <p className="mt-1 text-xs text-red-700">
            {(error as { data?: { message?: string } })?.data?.message ??
              "There was a network issue retrieving payroll history."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 shadow-2xs hover:bg-red-50"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <CalendarCheck2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-neutral-900">
            No Payroll Runs Found
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            {searchQuery || statusFilter !== "ALL"
              ? "No payroll period matched your current filters."
              : "Get started by processing your organization's first payroll run."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold">
                <th className="px-5 py-3">Payroll Period</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Employees</th>
                <th className="px-5 py-3 text-right">Total Net Pay</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredRuns.map((run) => (
                <tr
                  key={run._id}
                  onClick={() => navigate(`/payroll/${run._id}`)}
                  className="group cursor-pointer transition-colors hover:bg-neutral-50/80"
                >
                  <td className="px-5 py-3.5 font-semibold text-neutral-900">
                    {formatPeriod(run.period.month, run.period.year)}
                  </td>
                  <td className="px-5 py-3.5">
                    <PayrollStatusBadge status={run.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-neutral-600">
                    {run.totals?.employeeCount ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-neutral-900">
                    {formatCurrency(run.totals?.totalNetPay || 0)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-neutral-400 group-hover:text-neutral-900">
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal execution trigger */}
      <RunPayrollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRunPayroll}
        isLoading={isRunning}
        error={runError}
      />
    </div>
  );
}
