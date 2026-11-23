import type { Employee } from "../../../@types";
import { apiSlice } from "../api/apiSlice";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ListEmployeesResponse {
  employees: Employee[];
  pagination: Pagination;
}

interface ListEmployeesQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export const employeeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEmployee: builder.mutation({
      query: (data) => ({
        url: "create/employee",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    listEmployees: builder.query<
      ListEmployeesResponse,
      ListEmployeesQuery | void
    >({
      query: (args) => {
        const { search, page, limit } = args ?? {};

        const params: Record<string, string | number> = {};

        if (search) params.search = search;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        return {
          url: "employees",
          method: "GET",
          params,
          credentials: "include" as const,
        };
      },

      transformResponse: (response: {
        success: boolean;
        employees: Employee[];
        pagination: Pagination;
      }) => ({
        employees: response.employees,
        pagination: response.pagination,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.employees.map((employee) => ({
                type: "Employee" as const,
                id: employee._id,
              })),
              { type: "Employee" as const, id: "LIST" },
            ]
          : [{ type: "Employee" as const, id: "LIST" }],
    }),

    getEmployee: builder.query<Employee, string>({
      query: (id) => ({
        url: `employee/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      transformResponse: (response: { success: boolean; employee: Employee }) =>
        response.employee,
      providesTags: (_result, _error, id) => [{ type: "Employee", id }],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, data }) => ({
        url: `employee/${id}/update`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Employee", id: "LIST" },
        { type: "Employee", id },
      ],
    }),

    deactivateEmployee: builder.mutation({
      query: (id: string) => ({
        url: `employee/${id}/deactivate`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Employee", id: "LIST" },
        { type: "Employee", id },
      ],
    }),
  }),
});

export const {
  useCreateEmployeeMutation,
  useListEmployeesQuery,
  useGetEmployeeQuery,
  useUpdateEmployeeMutation,
  useDeactivateEmployeeMutation,
} = employeeApi;
