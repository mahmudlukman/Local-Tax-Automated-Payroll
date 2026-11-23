import type { TaxConfig, TaxConfigFormValues } from "../../../@types";
import { apiSlice } from "../api/apiSlice";

export const taxConfigApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveTaxConfig: builder.query<TaxConfig, void>({
      query: () => ({
        url: "tax-config/active",
        method: "GET",
        credentials: "include" as const,
      }),
      transformResponse: (response: {
        success: boolean;
        taxConfig: TaxConfig;
      }) => response.taxConfig,
      providesTags: [{ type: "TaxConfig", id: "ACTIVE" }],
    }),
    createTaxConfig: builder.mutation<TaxConfig, TaxConfigFormValues>({
      query: (data) => ({
        url: "create/tax-config",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [
        { type: "TaxConfig", id: "LIST" },
        { type: "TaxConfig", id: "ACTIVE" },
      ],
    }),
    listTaxConfigs: builder.query<TaxConfig[], void>({
      query: () => ({
        url: "tax-configs",
        method: "GET",
        credentials: "include" as const,
      }),
      transformResponse: (response: {
        success: boolean;
        taxConfigs: TaxConfig[];
      }) => response.taxConfigs,
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "TaxConfig" as const, id: c._id })),
              { type: "TaxConfig" as const, id: "LIST" },
            ]
          : [{ type: "TaxConfig" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetActiveTaxConfigQuery,
  useCreateTaxConfigMutation,
  useListTaxConfigsQuery,
} = taxConfigApi;
