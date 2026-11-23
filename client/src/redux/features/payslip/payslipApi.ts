import type { Payslip } from "../../../@types";
import { apiSlice } from "../api/apiSlice";

export const payslipApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listPayslips: builder.query<Payslip[], string | void>({
      query: (payrollRunId) => ({
        url: "payslips",
        method: "GET",
        params: payrollRunId ? { payrollRun: payrollRunId } : undefined,
        credentials: "include" as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Payslip" as const, id: p._id })),
              { type: "Payslip" as const, id: "LIST" },
            ]
          : [{ type: "Payslip" as const, id: "LIST" }],
    }),
    getPayslip: builder.query<Payslip, string>({
      query: (id) => ({
        url: `payslip/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      transformResponse: (response: { success: boolean; payslip: Payslip }) =>
        response.payslip,
      providesTags: (_result, _error, id) => [{ type: "Payslip", id }],
    }),
    getPayslipPdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `payslip/${id}/pdf`,
        method: "GET",
        credentials: "include" as const,
        responseHandler: (response: Response) => response.blob(),
      }),
      providesTags: (_result, _error, id) => [{ type: "Payslip", id }],
    }),
  }),
});

export const {
  useListPayslipsQuery,
  useGetPayslipQuery,
  useGetPayslipPdfQuery,
  useLazyGetPayslipPdfQuery,
} = payslipApi;
