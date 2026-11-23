import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserX,
  Loader2,
} from "lucide-react";
import Button from "../components/ui/Button";
import EmployeeTable from "../components/employees/EmployeeTable";
import { useListEmployeesQuery } from "../redux/features/employee/employeeApi";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input by 300ms to reduce RTK Query calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListEmployeesQuery({
      search,
      page,
    });

  const employees = data?.employees ?? [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 text-neutral-900 antialiased">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Employees
            </h1>
            {pagination?.total !== undefined && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                {pagination.total} total
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Manage team members, view roles, and update employment profiles.
          </p>
        </div>

        <Button
          onClick={() => navigate("/employee/new")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add employee
        </Button>
      </div>

      {/* Control Bar: Search & Status indicator */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search by name, email, or role…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-neutral-200/90 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-xs transition-colors focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
          )}
        </div>

        {search && (
          <div className="text-xs text-neutral-500">
            Showing results for{" "}
            <span className="font-semibold text-neutral-900">"{search}"</span>
          </div>
        )}
      </div>

      {/* Skeleton Loading State */}
      {isLoading && (
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs space-y-3">
          <div className="h-10 w-full rounded-md bg-neutral-100 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-full rounded-md bg-neutral-50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="rounded-xl border border-red-200/80 bg-red-50/50 p-6 text-center shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-red-900">
            Unable to load employees
          </h3>
          <p className="mt-1 text-xs text-red-600">
            {(error as { data?: { message?: string } })?.data?.message ??
              "An unexpected error occurred while fetching employee records."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-2xs hover:bg-red-50 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Data Table & Empty States */}
      {!isLoading && !isError && (
        <>
          {employees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 py-12 text-center">
              <UserX
                className="mx-auto h-8 w-8 text-neutral-400"
                strokeWidth={1.5}
              />
              <h3 className="mt-3 text-sm font-semibold text-neutral-900">
                No employees found
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                {search
                  ? "No results matched your search criteria. Try a different query."
                  : "Get started by adding your first employee to the system."}
              </p>
              {search && (
                <button
                  onClick={() => setSearchInput("")}
                  className="mt-4 text-xs font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
              <EmployeeTable
                employees={employees}
                onRowClick={(employee) => navigate(`/employee/${employee._id}`)}
              />

              {/* Pagination Footer */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-neutral-200/80 bg-neutral-50/50 px-5 py-3">
                  <p className="text-xs font-medium text-neutral-500">
                    Showing{" "}
                    <span className="text-neutral-900">
                      {(pagination.page - 1) * 10 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="text-neutral-900">
                      {Math.min(pagination.page * 10, pagination.total)}
                    </span>{" "}
                    of{" "}
                    <span className="text-neutral-900">{pagination.total}</span>{" "}
                    results
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </Button>
                    <div className="px-2 text-xs font-medium text-neutral-600">
                      {pagination.page} / {pagination.pages}
                    </div>
                    <Button
                      variant="secondary"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
