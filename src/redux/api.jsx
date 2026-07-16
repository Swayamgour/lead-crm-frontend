import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "https://daryoo.lead.crm.amaxjobs.com/api";
// const BASE_URL = "http://localhost:5009/api";

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
        "Remarks",
        "WhatsappTemplates",
        "WhatsappLogs"
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

        // getUsers: builder.query({
        //     query: () => "/users",
        //     providesTags: ["Users"],
        // }),

        // In your API slice
        getUsers: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `/users?page=${page}&limit=${limit}`,
            providesTags: ["Users"],
        }),

        getUserById: builder.query({
            query: (id) => `/users/${id}`,
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
            query: ({ id, data }) => ({
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


        getLeadsPaginated: builder.query({
            query: ({ page, limit, status, search, startDate, endDate }) => ({
                url: "/leads/paginated",
                params: {
                    page,
                    limit,
                    status,
                    search,
                    startDate,
                    endDate
                }
            }),
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
            providesTags: ["Followups", "Leads"],
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
            providesTags: ["Timeline", "Leads"],
        }),

        getTimelineGroupedById: builder.query({
            query: (id) => `/TimeLine/lead/${id}`,
            providesTags: ["Timeline", "Leads"],
        }),


        // report 

        getLeadReport: builder.query({
            query: (params) => ({ url: `/reports/leads`, params }),
            providesTags: ["Leads"],
        }),

        // ================= SALES REPORT =================

        getSalesReport: builder.query({
            query: (params) => ({ url: `/reports/sales`, params }),
            providesTags: ["Leads", "Timeline"],
        }),

        // ================= CONVERSION REPORT =================

        getConversionReport: builder.query({
            query: (params) => ({ url: `/reports/conversion`, params }),
            providesTags: ["Leads"],
        }),

        // ================= SALES PERFORMANCE =================

        getSalesPerformance: builder.query({
            query: (params) => ({ url: `/reports/sales-performance`, params }),
            providesTags: ["Leads", "Users"],
        }),

        // ================= EXECUTIVE SALES REPORT =================

        getExecutiveSalesReport: builder.query({
            query: (params) => ({ url: `/reports/executive-sales`, params }),
            providesTags: ["Leads", "Users"],
        }),

        // getWhSalesReport: builder.query({
        //     query: () => `/reports/sales`,
        //     providesTags: ["Timeline", "Leads"],
        // }),


        // Remark

        // getQuotations: builder.query({
        //     query: () => "/quotations",
        //     providesTags: ["Quotations"],
        // }),

        // Correct way to write RTK Query endpoints for remarks

        // If you have multiple remark endpoints
        getLeadRemarks: builder.query({
            query: (leadId) => `/leads/${leadId}/remarks`,
            providesTags: (result, error, leadId) => [
                { type: "Remarks", id: leadId },
                ...(result?.remarks?.map(({ _id }) => ({ type: "Remarks", id: _id })) || [])
            ],
        }),



        addRemark: builder.mutation({
            query: ({ leadId, text }) => {
                console.log("Sending remark:", { leadId, text }); // Debug log
                return {
                    url: `/leads/${leadId}/remarks`,
                    method: "POST",
                    body: { text }, // Send only text, backend adds createdBy
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
            },
            invalidatesTags: (result, error, { leadId }) => [
                { type: "Remarks", id: leadId },
                "Leads"
            ],
        }),

        editRemark: builder.mutation({
            query: ({ leadId, remarkId, text }) => ({
                url: `/leads/${leadId}/remarks/${remarkId}`,
                method: "PUT",
                body: { text },
            }),
            invalidatesTags: (result, error, { leadId, remarkId }) => [
                { type: "Remarks", id: leadId },
                { type: "Remarks", id: remarkId }
            ],
        }),

        deleteRemark: builder.mutation({
            query: ({ leadId, remarkId }) => ({
                url: `/leads/${leadId}/remarks/${remarkId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { leadId }) => [
                { type: "Remarks", id: leadId }
            ],
        }),

        // ================= WHATSAPP TEMPLATES =================

        getWhatsappTemplates: builder.query({
            query: (params) => ({ url: "/whatsapp/templates", params }),
            providesTags: ["WhatsappTemplates"],
        }),

        getWhatsappTemplateById: builder.query({
            query: (id) => `/whatsapp/templates/${id}`,
            providesTags: ["WhatsappTemplates"],
        }),

        createWhatsappTemplate: builder.mutation({
            query: (data) => ({
                url: "/whatsapp/templates",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["WhatsappTemplates"],
        }),

        updateWhatsappTemplate: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/whatsapp/templates/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["WhatsappTemplates"],
        }),

        deleteWhatsappTemplate: builder.mutation({
            query: (id) => ({
                url: `/whatsapp/templates/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["WhatsappTemplates"],
        }),

        deleteWhatsappTemplateImage: builder.mutation({
            query: ({ id, imageId }) => ({
                url: `/whatsapp/templates/${id}/images/${imageId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["WhatsappTemplates"],
        }),

        // ================= WHATSAPP SEND =================

        sendWhatsAppTemplate: builder.mutation({
            query: ({ leadId, templateId }) => ({
                url: "/whatsapp/send",
                method: "POST",
                body: { leadId, templateId },
            }),
            invalidatesTags: ["WhatsappLogs"],
        }),

        sendWhatsAppCustom: builder.mutation({
            query: ({ leadId, message }) => ({
                url: "/whatsapp/send-custom",
                method: "POST",
                body: { leadId, message },
            }),
            invalidatesTags: ["WhatsappLogs"],
        }),

        getWhatsappLogs: builder.query({
            query: (leadId) => `/whatsapp/logs/${leadId}`,
            providesTags: (result, error, leadId) => [
                { type: "WhatsappLogs", id: leadId }
            ],
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
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,

    // LEADS
    useGetLeadsQuery,
    useGetLeadsPaginatedQuery,
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
    useGetTimelineGroupedQuery,
    useGetTimelineGroupedByIdQuery,

    // report
    useGetLeadReportQuery,
    useGetSalesReportQuery,
    useGetConversionReportQuery,
    useGetSalesPerformanceQuery,
    useGetExecutiveSalesReportQuery,



    useDeleteRemarkMutation,
    useEditRemarkMutation,
    useAddRemarkMutation,
    useGetLeadRemarksQuery,

    // WHATSAPP TEMPLATES
    useGetWhatsappTemplatesQuery,
    useGetWhatsappTemplateByIdQuery,
    useCreateWhatsappTemplateMutation,
    useUpdateWhatsappTemplateMutation,
    useDeleteWhatsappTemplateMutation,
    useDeleteWhatsappTemplateImageMutation,

    // WHATSAPP SEND
    useSendWhatsAppTemplateMutation,
    useSendWhatsAppCustomMutation,
    useGetWhatsappLogsQuery,

} = api;