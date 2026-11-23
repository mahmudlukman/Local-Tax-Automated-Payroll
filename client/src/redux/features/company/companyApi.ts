import type { Company, CompanyFormValues } from "../../../@types";
import { apiSlice } from "../api/apiSlice";

export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listCompanies: builder.query<Company[], void>({
      query: () => ({
        url: "companies",
        method: "GET",
        credentials: "include" as const,
      }),
      transformResponse: (response: {
        success: boolean;
        companies: Company[];
      }) => response.companies,
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Company" as const, id: c._id })),
              { type: "Company" as const, id: "LIST" },
            ]
          : [{ type: "Company" as const, id: "LIST" }],
    }),
    getCompany: builder.query<Company, string>({
      query: (id) => ({
        url: `company/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      transformResponse: (response: { success: boolean; company: Company }) =>
        response.company,
      providesTags: (_result, _error, id) => [{ type: "Company", id }],
    }),
    updateCompany: builder.mutation<
      Company,
      { id: string; data: CompanyFormValues }
    >({
      query: ({ id, data }) => ({
        url: `company/${id}/update`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        updatedCompany: Company;
      }) => response.updatedCompany,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Company", id: "LIST" },
        { type: "Company", id },
      ],
    }),
  }),
});

export const {
  useListCompaniesQuery,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
} = companyApi;
