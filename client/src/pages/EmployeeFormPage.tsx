import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import EmployeeForm from "../components/employees/EmployeeForm";
import { EMPTY_EMPLOYEE_FORM_VALUES, type EmployeeFormValues } from "../@types";
import {
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../redux/features/employee/employeeApi";

export default function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const {
    data: existing,
    isLoading: isLoadingEmployee,
    isError,
    refetch,
  } = useGetEmployeeQuery(id!, { skip: !isEditing });

  const [createEmployee, { isLoading: isCreating, error: createError }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating, error: updateError }] =
    useUpdateEmployeeMutation();

  const initialValues = useMemo<EmployeeFormValues>(() => {
    if (!existing) {
      return EMPTY_EMPLOYEE_FORM_VALUES;
    }

    return {
      employeeId: existing.employeeId,
      firstName: existing.firstName,
      lastName: existing.lastName,
      email: existing.email,
      phone: existing.phone,
      dateOfHire: existing.dateOfHire,
      jobTitle: existing.jobTitle,
      department: existing.department,
      tin: existing.tin,
      pensionPIN: existing.pensionPIN,
      pensionFundAdministrator: existing.pensionFundAdministrator,
      stateOfResidence: existing.stateOfResidence,
      salary: existing.salary,
      pensionOptOut: existing.pensionOptOut,
      nhfOptOut: existing.nhfOptOut,
      annualRentPaid: existing.annualRentPaid,
      bank: existing.bank,
    };
  }, [existing]);

  async function handleSubmit(values: EmployeeFormValues) {
    try {
      if (isEditing && existing) {
        await updateEmployee({ id: existing._id, data: values }).unwrap();
        navigate(`/employees/${existing._id}`);
      } else {
        const created = await createEmployee(values).unwrap();
        navigate(`/employees/${created._id}`);
      }
    } catch {
      // API error handled via mutationError state below
    }
  }

  const handleCancel = () => {
    if (isEditing && existing) {
      navigate(`/employees/${existing._id}`);
    } else {
      navigate("/employees");
    }
  };

  // Skeleton Loading State
  if (isEditing && isLoadingEmployee) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="h-5 w-32 rounded bg-neutral-200 animate-pulse" />
        <div className="h-8 w-64 rounded bg-neutral-200 animate-pulse" />
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs space-y-6">
          <div className="h-10 w-full rounded-md bg-neutral-100 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded-md bg-neutral-100 animate-pulse" />
            <div className="h-10 rounded-md bg-neutral-100 animate-pulse" />
          </div>
          <div className="h-32 w-full rounded-md bg-neutral-50 animate-pulse" />
        </div>
      </div>
    );
  }

  // Not Found Error State
  if (isEditing && (isError || !existing)) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900">
            Employee Record Not Found
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            The requested employee record could not be loaded or may have been
            deleted.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              Try Again
            </button>
            <Link
              to="/employees"
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mutationError = isEditing ? updateError : createError;
  const errorMessage = mutationError
    ? ((mutationError as { data?: { message?: string } })?.data?.message ??
      "An error occurred while saving employee details. Please verify inputs and try again.")
    : null;

  const isSubmitting = isEditing ? isUpdating : isCreating;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 text-neutral-900 antialiased">
      {/* Top Breadcrumb Navigation */}
      <div>
        <button
          onClick={handleCancel}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isEditing
            ? `Back to ${existing?.firstName}'s Profile`
            : "Back to Employees"}
        </button>
      </div>

      {/* Form Page Header */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
            {isEditing ? (
              <UserCheck className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <UserPlus className="h-5 w-5" strokeWidth={1.75} />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              {isEditing
                ? `Edit ${existing?.firstName} ${existing?.lastName}`
                : "Add New Employee"}
            </h1>
            <p className="text-xs text-neutral-500">
              {isEditing
                ? "Update employment details, statutory information, and salary breakdown."
                : "Fill out personal details, statutory settings, and bank breakdown for onboarding."}
            </p>
          </div>
        </div>
      </div>

      {/* Mutation Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/60 p-4 text-xs text-red-800 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <span className="font-semibold">Action Failed: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Employee Form Shell */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs">
        <EmployeeForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          error={errorMessage}
          submitLabel={
            isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Employee"
            )
          }
        />
      </div>
    </div>
  );
}
