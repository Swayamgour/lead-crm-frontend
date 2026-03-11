import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const BASE_URL = "https://lead-crm-backend-1cq8.onrender.com/api";
const BASE_URL = "http://localhost:5000/api";

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {

        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        headers.set("Content-Type", "application/json");

        return headers;
    },
});

export const api = createApi({
    reducerPath: "api",
    baseQuery,
    tagTypes: [
        "Auth",
        "Users",
        "Leads",
        "Followups",
        "Customers",
        "Products",
        "Quotations",
        "Dashboard",
        "Timeline",
    ],

    endpoints: (builder) => ({

        // ================= AUTH =================

        login: builder.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
        }),

        register: builder.mutation({
            query: (data) => ({
                url: "/auth/register",
                method: "POST",
                body: data,
            }),
        }),

        getProfile: builder.query({
            query: () => "/auth/profile",
            providesTags: ["Auth"],
        }),

        // ================= USERS =================

        getUsers: builder.query({
            query: () => "/users",
            providesTags: ["Users"],
        }),

        createUser: builder.mutation({
            query: (data) => ({
                url: "/users",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Users"],
        }),

        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Users"],
        }),

        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Users"],
        }),

        // ================= LEADS =================

        getLeads: builder.query({
            query: () => "/leads",
            providesTags: ["Leads"],
        }),

        getLeadById: builder.query({
            query: (id) => `/leads/${id}`,
        }),

        createLead: builder.mutation({
            query: (data) => ({
                url: "/leads",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Leads"],
        }),

        updateLead: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/leads/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Leads"],
        }),

        deleteLead: builder.mutation({
            query: (id) => ({
                url: `/leads/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Leads"],
        }),

        changeLeadStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/leads/${id}/status`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: ["Leads"],
        }),

        // ================= FOLLOWUPS =================

        getFollowUps: builder.query({
            query: () => "/followups",
            providesTags: ["Followups" , "Leads"],
        }),

        getTodayFollowUps: builder.query({
            query: () => "/followups/today",
            providesTags: ["Followups"],
        }),

        createFollowUp: builder.mutation({
            query: (data) => ({
                url: "/followups",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Followups"],
        }),

        updateFollowUp: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/followups/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Followups"],
        }),

        deleteFollowUp: builder.mutation({
            query: (id) => ({
                url: `/followups/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Followups"],
        }),

        // ================= CUSTOMERS =================

        getCustomers: builder.query({
            query: () => "/customers",
            providesTags: ["Customers"],
        }),

        getCustomerById: builder.query({
            query: (id) => `/customers/${id}`,
        }),

        createCustomer: builder.mutation({
            query: (data) => ({
                url: "/customers",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Customers"],
        }),

        updateCustomer: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/customers/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Customers"],
        }),

        deleteCustomer: builder.mutation({
            query: (id) => ({
                url: `/customers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Customers"],
        }),

        // ================= PRODUCTS =================

        getProducts: builder.query({
            query: () => "/products",
            providesTags: ["Products"],
        }),

        createProduct: builder.mutation({
            query: (data) => ({
                url: "/products",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Products"],
        }),

        updateProduct: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/products/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Products"],
        }),

        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Products"],
        }),

        // ================= QUOTATIONS =================

        getQuotations: builder.query({
            query: () => "/quotations",
            providesTags: ["Quotations"],
        }),

        getQuotationById: builder.query({
            query: (id) => `/quotations/${id}`,
        }),

        createQuotation: builder.mutation({
            query: (data) => ({
                url: "/quotations",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Quotations"],
        }),

        updateQuotation: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/quotations/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Quotations"],
        }),

        deleteQuotation: builder.mutation({
            query: (id) => ({
                url: `/quotations/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Quotations"],
        }),

        // ================= DASHBOARD =================

        getDashboardStats: builder.query({
            query: () => "/dashboard/stats",
            providesTags: ["Dashboard"],
        }),

        // ================= TIMELINE =================

        getTimeline: builder.query({
            query: () => `/TimeLine`,
            providesTags: ["Timeline"],
        }),
        getTimelineGrouped: builder.query({
            query: () => `/TimeLine/Grouped`,
            providesTags: ["Timeline" , "Leads"],
        }),

    }),
});

export const {

    // AUTH
    useLoginMutation,
    useRegisterMutation,
    useGetProfileQuery,

    // USERS
    useGetUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,

    // LEADS
    useGetLeadsQuery,
    useGetLeadByIdQuery,
    useCreateLeadMutation,
    useUpdateLeadMutation,
    useDeleteLeadMutation,
    useChangeLeadStatusMutation,

    // FOLLOWUPS
    useGetFollowUpsQuery,
    useGetTodayFollowUpsQuery,
    useCreateFollowUpMutation,
    useUpdateFollowUpMutation,
    useDeleteFollowUpMutation,

    // CUSTOMERS
    useGetCustomersQuery,
    useGetCustomerByIdQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,

    // PRODUCTS
    useGetProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,

    // QUOTATIONS
    useGetQuotationsQuery,
    useGetQuotationByIdQuery,
    useCreateQuotationMutation,
    useUpdateQuotationMutation,
    useDeleteQuotationMutation,

    // DASHBOARD
    useGetDashboardStatsQuery,

    // TIMELINE
    useGetTimelineQuery,
    useGetTimelineGroupedQuery

} = api;