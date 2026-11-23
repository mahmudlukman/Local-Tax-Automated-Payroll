import type { PayrollRun, Payslip } from "../../../@types";
import { apiSlice } from "../api/apiSlice";

interface PayrollRunWithPayslips {
  payrollRun: PayrollRun;
  payslips: Payslip[];
}

export const payrollApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    runPayroll: builder.mutation<PayrollRun, { month: number; year: number }>({
      query: (data) => ({
        url: "run/payroll",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Payroll", id: "LIST" }],
    }),
    listPayrollRuns: builder.query<PayrollRun[], void>({
      query: () => ({
        url: "payroll-runs",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((run) => ({
                type: "Payroll" as const,
                id: run._id,
              })),
              { type: "Payroll" as const, id: "LIST" },
            ]
          : [{ type: "Payroll" as const, id: "LIST" }],
    }),
    getPayrollRun: builder.query<PayrollRunWithPayslips, string>({
      query: (id) => ({
        url: `payroll-run/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result, _error, id) =>
        result
          ? [
              { type: "Payroll", id },
              ...result.payslips.map((p) => ({
                type: "Payslip" as const,
                id: p._id,
              })),
            ]
          : [{ type: "Payroll", id }],
    }),
    getExportFormats: builder.query({
      query: () => ({
        url: "export-formats",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: [{ type: "Payroll", id: "LIST" }],
    }),
    approvePayrollRun: builder.mutation<PayrollRun, string>({
      query: (id) => ({
        url: `payroll-run/${id}/approve`,
        method: "POST",
        credentials: "include" as const,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id },
      ],
    }),
    markPayrollRunPaid: builder.mutation<PayrollRun, string>({
      query: (id) => ({
        url: `payroll-run/${id}/mark-paid`,
        method: "POST",
        credentials: "include" as const,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id },
      ],
    }),
    exportPayrollRun: builder.query({
      query: (id) => ({
        url: `payroll-run/${id}/export`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: [{ type: "Payroll", id: "LIST" }],
    }),
  }),
});

export const {
  useRunPayrollMutation,
  useListPayrollRunsQuery,
  useGetPayrollRunQuery,
  useExportPayrollRunQuery,
  useGetExportFormatsQuery,
  useApprovePayrollRunMutation,
  useMarkPayrollRunPaidMutation,
} = payrollApi;
