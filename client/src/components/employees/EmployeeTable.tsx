import type { Employee, EmploymentStatus } from "../../@types";

export interface EmployeeTableProps {
  employees: Employee[];
  isLoading?: boolean;
  onRowClick?: (employee: Employee) => void;
}

const STATUS_LABEL: Record<EmploymentStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  terminated: "Terminated",
};

function StatusBadge({ status }: { status: EmploymentStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
        isActive
          ? "bg-gray-900 text-white"
          : "border border-gray-300 text-gray-600"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function EmployeeTable({
  employees,
  isLoading = false,
  onRowClick,
}: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
        Loading employees…
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm font-medium text-gray-900">No employees yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Add your first employee to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-2.5 font-medium">Employee ID</th>
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Department</th>
            <th className="px-4 py-2.5 font-medium">Job title</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr
              key={employee._id}
              onClick={() => onRowClick?.(employee)}
              className={`border-b border-gray-100 last:border-b-0 ${
                onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
            >
              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {employee.employeeId}
              </td>
              <td className="px-4 py-3 text-gray-900">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {employee.department || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {employee.jobTitle || "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={employee.employmentStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
