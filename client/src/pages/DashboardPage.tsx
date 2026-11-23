import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPeriod } from "../utils/formatDate";
import { PayrollStatusBadge } from "../components/payroll/PayrollTotalsCard";
import { useListEmployeesQuery } from "../redux/features/employee/employeeApi";
import { useListPayrollRunsQuery } from "../redux/features/payroll/payrollApi";

export default function DashboardPage() {
  const {
    data: employeeData,
    isLoading: isLoadingEmployees,
    isError: isEmployeesError,
  } = useListEmployeesQuery({ limit: 500 });
  const {
    data: payrollRuns = [],
    isLoading: isLoadingRuns,
    isError: isRunsError,
  } = useListPayrollRunsQuery();

  const activeEmployees = (employeeData?.employees ?? []).filter(
    (e) => e.employmentStatus === "active",
  );
  const latestRun = payrollRuns[0];
  const draftCount = payrollRuns.filter((r) => r.status === "draft").length;
  const approvedCount = payrollRuns.filter(
    (r) => r.status === "approved",
  ).length;
  const paidCount = payrollRuns.filter((r) => r.status === "paid").length;

  const isLoading = isLoadingEmployees || isLoadingRuns;
  const hasError = isEmployeesError || isRunsError;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 text-neutral-900 antialiased">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Payroll Overview
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Monitor employee counts, manage run statuses, and review total
            payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/payroll/new"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            + Create Payroll Run
          </Link>
        </div>
      </div>

      {hasError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some dashboard data failed to load. Figures below may be incomplete.
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Metric 1: Active Employees */}
        <Link
          to="/employees"
          className="group relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Active Employees
            </span>
            <div className="rounded-md bg-neutral-100 p-2 text-neutral-600 group-hover:bg-neutral-200/60 transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {isLoading ? "—" : activeEmployees.length}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center text-xs font-medium text-neutral-400 transition-colors group-hover:text-neutral-700">
            View employees &rarr;
          </span>
        </Link>

        {/* Metric 2: Latest Net Pay */}
        <Link
          to={latestRun ? `/payroll/${latestRun._id}` : "/payroll"}
          className="group relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Latest Net Pay
            </span>
            <div className="rounded-md bg-neutral-100 p-2 text-neutral-600 group-hover:bg-neutral-200/60 transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="font-mono text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {isLoading
                ? "—"
                : latestRun
                  ? formatCurrency(latestRun.totals.totalNetPay)
                  : "—"}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center text-xs font-medium text-neutral-400 transition-colors group-hover:text-neutral-700">
            {latestRun
              ? formatPeriod(latestRun.period.month, latestRun.period.year)
              : "View payroll runs"}{" "}
            &rarr;
          </span>
        </Link>

        {/* Metric 3: Payroll Run Status Breakdown */}
        <Link
          to="/payroll"
          className="group relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Pending Approval
            </span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-600 group-hover:bg-amber-100/80 transition-colors">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {isLoading ? "—" : draftCount}
            </span>
            {!isLoading && draftCount > 0 && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                Action required
              </span>
            )}
          </div>
          {!isLoading && (
            <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
              <span>{approvedCount} approved</span>
              <span className="text-neutral-300">·</span>
              <span>{paidCount} paid</span>
            </div>
          )}
        </Link>
      </div>

      {/* Recent Payroll Runs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Recent Payroll Runs
            </h2>
            <p className="text-xs text-neutral-500">
              View details and breakdown of past and ongoing disbursements.
            </p>
          </div>
          <Link
            to="/payroll"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
          >
            View all runs
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70 text-xs font-medium uppercase tracking-wider text-neutral-500">
                <th scope="col" className="px-5 py-3">
                  Pay Period
                </th>
                <th scope="col" className="px-5 py-3">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Total Net Pay
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-xs text-neutral-500"
                  >
                    Loading payroll runs…
                  </td>
                </tr>
              ) : payrollRuns.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-xs text-neutral-500"
                  >
                    No recent payroll runs found.
                  </td>
                </tr>
              ) : (
                payrollRuns.slice(0, 5).map((run) => (
                  <tr
                    key={run._id}
                    className="group transition-colors hover:bg-neutral-50/60"
                  >
                    <td className="px-5 py-4 font-medium text-neutral-900">
                      <Link
                        to={`/payroll/${run._id}`}
                        className="transition-colors hover:text-neutral-600 focus:outline-hidden"
                      >
                        {formatPeriod(run.period.month, run.period.year)}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <PayrollStatusBadge status={run.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm font-medium text-neutral-800 tabular-nums">
                      {formatCurrency(run.totals.totalNetPay)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/payroll/${run._id}`}
                        className="inline-flex items-center text-xs font-medium text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-900"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
