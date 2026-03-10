import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ==================== BASE API CONFIGURATION ====================

const BASE_URL = 'http://localhost:5000/api';

// Base query with token handling
const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        // Get token from auth state (localStorage or sessionStorage)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }

        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

// Base query with refresh token logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // Handle 401 Unauthorized - token expired
    if (result.error?.status === 401) {
        console.log('Token expired, attempting refresh...');

        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: '/auth/refresh-token',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                // Store new token
                const { token, refreshToken: newRefreshToken } = refreshResult.data;
                localStorage.setItem('token', token);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                // Retry original request with new token
                result = await baseQuery(args, api, extraOptions);
            } else {
                // Refresh failed - logout
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
            }
        } else {
            // No refresh token - logout
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }
    }

    return result;
};

// ==================== CREATE API ====================

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        // Auth
        'Auth', 'User',

        // Leads
        'Lead', 'Leads',

        // Executives
        'Executive', 'Executives',

        // Follow-ups
        'FollowUp', 'FollowUps',

        // Timeline
        'Timeline', 'Timelines',

        // Pipeline
        'Pipeline',

        // Dashboard
        'Dashboard',

        // Notifications
        'Notification', 'Notifications',
    ],
    endpoints: (builder) => ({

        // ==================== AUTH ENDPOINTS ====================

        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            transformResponse: (response) => ({
                user: response.user,
                token: response.token,
                refreshToken: response.refreshToken,
            }),
            invalidatesTags: ['Auth'],
        }),

        executiveLogin: builder.mutation({
            query: (credentials) => ({
                url: '/auth/executive-login',
                method: 'POST',
                body: credentials,
            }),
            transformResponse: (response) => ({
                user: response.user,
                token: response.token,
                refreshToken: response.refreshToken,
            }),
            invalidatesTags: ['Auth'],
        }),

        getProfile: builder.query({
            query: () => '/auth/profile',
            providesTags: ['Auth', 'User'],
        }),

        updateProfile: builder.mutation({
            query: (data) => ({
                url: '/auth/profile',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        changePassword: builder.mutation({
            query: (data) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: data,
            }),
        }),

        forgotPassword: builder.mutation({
            query: (email) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: { email },
            }),
        }),

        resetPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: { token, password },
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        refreshToken: builder.mutation({
            query: (refreshToken) => ({
                url: '/auth/refresh-token',
                method: 'POST',
                body: { refreshToken },
            }),
        }),

        // ==================== LEAD ENDPOINTS ====================

        getLeads: builder.query({
            query: (params) => ({
                url: '/leads',
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    status: params?.status,
                    source: params?.source,
                    assignedTo: params?.assignedTo,
                    priority: params?.priority,
                    search: params?.search,
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                    sortBy: params?.sortBy,
                    sortOrder: params?.sortOrder,
                    ...params,
                },
            }),
            providesTags: (result) =>
                result?.leads
                    ? [
                        ...result.leads.map(({ id }) => ({ type: 'Lead', id })),
                        { type: 'Leads', id: 'LIST' },
                    ]
                    : [{ type: 'Leads', id: 'LIST' }],
        }),

        getLeadById: builder.query({
            query: (id) => `/leads/${id}`,
            providesTags: (result, error, id) => [{ type: 'Lead', id }],
        }),

        createLead: builder.mutation({
            query: (leadData) => ({
                url: '/leads',
                method: 'POST',
                body: leadData,
            }),
            invalidatesTags: [{ type: 'Leads', id: 'LIST' }],
        }),

        updateLead: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/leads/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Lead', id },
                { type: 'Leads', id: 'LIST' },
            ],
        }),

        deleteLead: builder.mutation({
            query: (id) => ({
                url: `/leads/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Leads', id: 'LIST' }],
        }),

        bulkImportLeads: builder.mutation({
            query: (leads) => ({
                url: '/leads/bulk-import',
                method: 'POST',
                body: { leads },
            }),
            invalidatesTags: [{ type: 'Leads', id: 'LIST' }],
        }),

        exportLeads: builder.query({
            query: (params) => ({
                url: '/leads/export',
                params: {
                    format: params?.format || 'csv',
                    ...params,
                },
            }),
        }),

        getLeadStats: builder.query({
            query: (params) => ({
                url: '/leads/stats',
                params,
            }),
            providesTags: ['Leads'],
        }),

        // ==================== EXECUTIVE ENDPOINTS ====================

        getExecutives: builder.query({
            query: (params) => ({
                url: '/executives',
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    // status: params?.status,
                    // role: params?.role,
                    // search: params?.search,
                    // team: params?.team,
                    // sortBy: params?.sortBy,
                    // sortOrder: params?.sortOrder,
                    ...params,
                },
            }),
            providesTags: (result) =>
                result?.executives
                    ? [
                        ...result.executives.map(({ id }) => ({ type: 'Executive', id })),
                        { type: 'Executives', id: 'LIST' },
                    ]
                    : [{ type: 'Executives', id: 'LIST' }],
        }),

        getExecutiveById: builder.query({
            query: (id) => `/leads/executive/${id}`,
            providesTags: (result, error, id) => [{ type: 'Executive', id }],
        }),

        createExecutive: builder.mutation({
            query: (formData) => ({
                url: "/executives",
                method: "POST",
                body: formData
            }),
            invalidatesTags: [{ type: "Executives", id: "LIST" }],
        }),

        updateExecutive: builder.mutation({
            query: ({ id, ...data }) => {
                const formData = new FormData();
                Object.keys(data).forEach(key => {
                    if (key === 'avatar' && data[key]) {
                        formData.append('avatar', data[key]);
                    } else if (data[key] !== null && data[key] !== undefined) {
                        formData.append(key, data[key]);
                    }
                });

                return {
                    url: `/executives/${id}`,
                    method: 'PUT',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Executive', id },
                { type: 'Executives', id: 'LIST' },
            ],
        }),

        // updateExecutiveStatus: builder.mutation({
        //     query: ({ id, status }) => ({
        //         url: `/executives/${id}/status`,
        //         method: 'PATCH',
        //         body: { status },
        //     }),
        //     invalidatesTags: (result, error, { id }) => [
        //         { type: 'Executive', id },
        //         { type: 'Executives', id: 'LIST' },
        //     ],
        // }),

        deleteExecutive: builder.mutation({
            query: (id) => ({
                url: `/executives/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Executives', id: 'LIST' }],
        }),

        getExecutivePerformance: builder.query({
            query: ({ id, ...params }) => ({
                url: `/executives/${id}/performance`,
                params,
            }),
            providesTags: (result, error, { id }) => [{ type: 'Executive', id }],
        }),

        getExecutiveTeam: builder.query({
            query: (managerId) => `/executives/team/${managerId}`,
            providesTags: ['Executives'],
        }),

        bulkImportExecutives: builder.mutation({
            query: (executives) => ({
                url: '/executives/bulk-import',
                method: 'POST',
                body: { executives },
            }),
            invalidatesTags: [{ type: 'Executives', id: 'LIST' }],
        }),

        // ==================== FOLLOW-UP ENDPOINTS ====================

        getFollowUps: builder.query({
            query: (params) => ({
                url: '/followups',

            }),
            providesTags: (result) =>
                result?.followUps
                    ? [
                        ...result.followUps.map(({ id }) => ({ type: 'FollowUp', id })),
                        { type: 'FollowUps', id: 'LIST' },
                    ]
                    : [{ type: 'FollowUps', id: 'LIST' }],
        }),

        getTodaysFollowUps: builder.query({
            query: () => '/followups/today',
            providesTags: ['FollowUps'],
        }),

        getUpcomingFollowUps: builder.query({
            query: (params) => ({
                url: '/followups/upcoming',
                params: { days: params?.days || 7 },
            }),
            providesTags: ['FollowUps'],
        }),

        getOverdueFollowUps: builder.query({
            query: () => '/followups/overdue',
            providesTags: ['FollowUps'],
        }),

        getFollowUpsByExecutive: builder.query({
            query: ({ executiveId, ...params }) => ({
                url: `/followups/executive/${executiveId}`,
                params,
            }),
            providesTags: ['FollowUps'],
        }),

        getFollowUpsByLead: builder.query({
            query: (leadId) => ({
                url: `/followups/lead/${leadId}`,

            }),
            providesTags: ['FollowUps'],
        }),

        getFollowUpById: builder.query({
            query: (id) => `/followups/${id}`,
            providesTags: (result, error, id) => [{ type: 'FollowUp', id }],
        }),

        createFollowUp: builder.mutation({
            query: (followUpData) => ({
                url: '/followups',
                method: 'POST',
                body: followUpData,
            }),
            invalidatesTags: [{ type: 'FollowUps', id: 'LIST' }],
        }),

        updateFollowUp: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/followups/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'FollowUp', id },
                { type: 'FollowUps', id: 'LIST' },
            ],
        }),

        completeFollowUp: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/followups/${id}/complete`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'FollowUp', id },
                { type: 'FollowUps', id: 'LIST' },
            ],
        }),

        rescheduleFollowUp: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/followups/${id}/reschedule`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'FollowUp', id },
                { type: 'FollowUps', id: 'LIST' },
            ],
        }),

        deleteFollowUp: builder.mutation({
            query: (id) => ({
                url: `/followups/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'FollowUps', id: 'LIST' }],
        }),

        bulkCreateFollowUps: builder.mutation({
            query: (followUps) => ({
                url: '/followups/bulk',
                method: 'POST',
                body: { followUps },
            }),
            invalidatesTags: [{ type: 'FollowUps', id: 'LIST' }],
        }),

        getFollowUpStats: builder.query({
            query: (params) => ({
                url: '/followups/stats',
                params,
            }),
            providesTags: ['FollowUps'],
        }),

        getFollowUpCalendar: builder.query({
            query: (params) => ({
                url: '/followups/calendar',
                params: {
                    month: params?.month,
                    year: params?.year,
                    executiveId: params?.executiveId,
                },
            }),
            providesTags: ['FollowUps'],
        }),

        // ==================== TIMELINE ENDPOINTS ====================

        getLeadTimeline: builder.query({
            query: ({ leadId, ...params }) => ({
                url: `/timeline/lead/${leadId}`,
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    type: params?.type,
                    sortBy: params?.sortBy,
                    sortOrder: params?.sortOrder,
                    ...params,
                },
            }),
            providesTags: (result, error, { leadId }) => [
                { type: 'Timelines', id: leadId },
            ],
        }),

        getTimelineEntry: builder.query({
            query: (id) => `/timeline/${id}`,
            providesTags: (result, error, id) => [{ type: 'Timeline', id }],
        }),

        createTimelineEntry: builder.mutation({
            query: (entryData) => ({
                url: '/timeline',
                method: 'POST',
                body: entryData,
            }),
            invalidatesTags: (result, error, { leadId }) => [
                { type: 'Timelines', id: leadId },
            ],
        }),

        updateTimelineEntry: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/timeline/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id, leadId }) => [
                { type: 'Timeline', id },
                { type: 'Timelines', id: leadId },
            ],
        }),

        deleteTimelineEntry: builder.mutation({
            query: ({ id, leadId }) => ({
                url: `/timeline/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { leadId }) => [
                { type: 'Timelines', id: leadId },
            ],
        }),

        addTimelineAttachment: builder.mutation({
            query: ({ id, file }) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: `/timeline/${id}/attachments`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Timeline', id },
            ],
        }),

        removeTimelineAttachment: builder.mutation({
            query: ({ id, attachmentId }) => ({
                url: `/timeline/${id}/attachments/${attachmentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Timeline', id },
            ],
        }),

        getTimelineByType: builder.query({
            query: ({ type, ...params }) => ({
                url: `/timeline/type/${type}`,
                params,
            }),
            providesTags: ['Timelines'],
        }),

        getTimelineByDate: builder.query({
            query: (params) => ({
                url: '/timeline/date-range',
                params: {
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                    leadId: params?.leadId,
                    executiveId: params?.executiveId,
                },
            }),
            providesTags: ['Timelines'],
        }),

        searchTimeline: builder.query({
            query: (params) => ({
                url: '/timeline/search',
                params: {
                    q: params?.q,
                    leadId: params?.leadId,
                    limit: params?.limit || 20,
                },
            }),
        }),

        exportTimeline: builder.query({
            query: (params) => ({
                url: '/timeline/export',
                params: {
                    leadId: params?.leadId,
                    format: params?.format || 'csv',
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
        }),

        getTimelineStats: builder.query({
            query: (params) => ({
                url: '/timeline/stats',
                params: {
                    leadId: params?.leadId,
                    executiveId: params?.executiveId,
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Timelines'],
        }),

        getRecentActivity: builder.query({
            query: (params) => ({
                url: '/timeline/recent',
                params: {
                    limit: params?.limit || 20,
                },
            }),
            providesTags: ['Timelines'],
        }),

        // ==================== PIPELINE ENDPOINTS ====================

        getPipeline: builder.query({
            query: (params) => ({
                url: '/pipeline',
                params: {
                    stage: params?.stage,
                    assignedTo: params?.assignedTo,
                    priority: params?.priority,
                    search: params?.search,
                },
            }),
            providesTags: ['Pipeline'],
        }),

        getPipelineStage: builder.query({
            query: ({ stage, ...params }) => ({
                url: `/pipeline/stage/${stage}`,
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    sortBy: params?.sortBy,
                    sortOrder: params?.sortOrder,
                },
            }),
            providesTags: ['Pipeline'],
        }),

        getStageMetrics: builder.query({
            query: ({ stage, ...params }) => ({
                url: `/pipeline/stage/${stage}/metrics`,
                params: {
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Pipeline'],
        }),

        moveLead: builder.mutation({
            query: (data) => ({
                url: '/pipeline/move',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Pipeline', 'Leads'],
        }),

        bulkMoveLeads: builder.mutation({
            query: (data) => ({
                url: '/pipeline/bulk-move',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Pipeline', 'Leads'],
        }),

        getPipelineAnalytics: builder.query({
            query: (params) => ({
                url: '/pipeline/analytics',
                params: {
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Pipeline'],
        }),

        getPipelineForecast: builder.query({
            query: () => '/pipeline/forecast',
            providesTags: ['Pipeline'],
        }),

        getConversionRates: builder.query({
            query: (params) => ({
                url: '/pipeline/conversion-rates',
                params: {
                    period: params?.period || 'monthly',
                },
            }),
            providesTags: ['Pipeline'],
        }),

        getVelocityMetrics: builder.query({
            query: (params) => ({
                url: '/pipeline/velocity',
                params: {
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Pipeline'],
        }),

        getLeadPipelineHistory: builder.query({
            query: (leadId) => `/pipeline/lead/${leadId}/history`,
            providesTags: (result, error, leadId) => [
                { type: 'Pipeline', id: leadId },
            ],
        }),

        getPipelineSettings: builder.query({
            query: () => '/pipeline/settings',
            providesTags: ['Pipeline'],
        }),

        updatePipelineSettings: builder.mutation({
            query: (settings) => ({
                url: '/pipeline/settings',
                method: 'PUT',
                body: settings,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        // ==================== DASHBOARD ENDPOINTS ====================

        getDashboardStats: builder.query({
            query: (params) => ({
                url: '/dashboard/stats',
                params: {
                    period: params?.period || 'month',
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getManagerDashboard: builder.query({
            query: (params) => ({
                url: '/dashboard/manager',
                params: {
                    teamId: params?.teamId,
                    period: params?.period || 'month',
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getExecutiveDashboard: builder.query({
            query: () => '/dashboard/executive',
            providesTags: ['Dashboard'],
        }),

        getKpiData: builder.query({
            query: (params) => ({
                url: '/dashboard/kpis',
                params: {
                    type: params?.type,
                    period: params?.period || 'month',
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getActivityFeed: builder.query({
            query: (params) => ({
                url: '/dashboard/activities',
                params: {
                    limit: params?.limit || 20,
                    type: params?.type || 'all',
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getChartData: builder.query({
            query: ({ chartType, ...params }) => ({
                url: `/dashboard/charts/${chartType}`,
                params: {
                    period: params?.period || 'monthly',
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getRevenueChart: builder.query({
            query: (params) => ({
                url: '/dashboard/charts/revenue',
                params: {
                    period: params?.period || 'monthly',
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getLeadDistribution: builder.query({
            query: (params) => ({
                url: '/dashboard/charts/lead-distribution',
                params: {
                    groupBy: params?.groupBy || 'status',
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getConversionFunnel: builder.query({
            query: () => '/dashboard/charts/conversion-funnel',
            providesTags: ['Dashboard'],
        }),

        getRecentLeads: builder.query({
            query: (params) => ({
                url: '/dashboard/recent-leads',
                params: {
                    limit: params?.limit || 10,
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getUpcomingActivities: builder.query({
            query: (params) => ({
                url: '/dashboard/upcoming',
                params: {
                    days: params?.days || 7,
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getTeamPerformance: builder.query({
            query: (params) => ({
                url: '/dashboard/team-performance',
                params: {
                    period: params?.period || 'month',
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getDailyStats: builder.query({
            query: (params) => ({
                url: '/dashboard/daily',
                params: {
                    date: params?.date,
                },
            }),
            providesTags: ['Dashboard'],
        }),

        getPerformanceMetrics: builder.query({
            query: (params) => ({
                url: '/dashboard/performance',
                params: {
                    period: params?.period || 'monthly',
                    metric: params?.metric || 'leads',
                },
            }),
            providesTags: ['Dashboard'],
        }),

        createCustomReport: builder.mutation({
            query: (reportData) => ({
                url: '/dashboard/reports/custom',
                method: 'POST',
                body: reportData,
            }),
        }),

        exportDashboardData: builder.query({
            query: (params) => ({
                url: '/dashboard/export',
                params: {
                    format: params?.format || 'pdf',
                    period: params?.period || 'month',
                },
            }),
        }),

        // ==================== NOTIFICATION ENDPOINTS ====================

        getNotifications: builder.query({
            query: (params) => ({
                url: '/dashboard/notifications',
                params: {
                    limit: params?.limit || 20,
                    unreadOnly: params?.unreadOnly || false,
                },
            }),
            providesTags: (result) =>
                result?.notifications
                    ? [
                        ...result.notifications.map(({ id }) => ({ type: 'Notification', id })),
                        { type: 'Notifications', id: 'LIST' },
                    ]
                    : [{ type: 'Notifications', id: 'LIST' }],

            transformResponse: (response) => ({
                notifications: response.notifications,
                unreadCount: response.unreadCount,
            }),
        }),

        markNotificationRead: builder.mutation({
            query: (id) => ({
                url: `/dashboard/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Notification', id },
                { type: 'Notifications', id: 'LIST' },
            ],
        }),

        markAllNotificationsRead: builder.mutation({
            query: () => ({
                url: '/dashboard/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),

        getUnreadCount: builder.query({
            query: () => '/dashboard/notifications/unread-count',
            providesTags: ['Notifications'],
            pollingInterval: 30000, // Poll every 30 seconds
        }),
    }),
});

// ==================== EXPORT ALL HOOKS ====================

// Auth Hooks
export const {
    useLoginMutation,
    useExecutiveLoginMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
} = api;

// Lead Hooks
export const {
    useGetLeadsQuery,
    useGetLeadByIdQuery,
    useCreateLeadMutation,
    useUpdateLeadMutation,
    useDeleteLeadMutation,
    useBulkImportLeadsMutation,
    useExportLeadsQuery,
    useGetLeadStatsQuery,
    useLazyGetLeadsQuery,
    useLazyGetLeadByIdQuery,
    useLazyExportLeadsQuery,
    useLazyGetLeadStatsQuery,
} = api;

// Executive Hooks
export const {
    useGetExecutivesQuery,
    useGetExecutiveByIdQuery,
    useCreateExecutiveMutation,
    useUpdateExecutiveMutation,
    // useUpdateExecutiveStatusMutation,
    useDeleteExecutiveMutation,
    useGetExecutivePerformanceQuery,
    useGetExecutiveTeamQuery,
    useBulkImportExecutivesMutation,
    useLazyGetExecutivesQuery,
    useLazyGetExecutiveByIdQuery,
    useLazyGetExecutivePerformanceQuery,
    useLazyGetExecutiveTeamQuery,
} = api;

// Follow-up Hooks
export const {
    useGetFollowUpsQuery,
    useGetTodaysFollowUpsQuery,
    useGetUpcomingFollowUpsQuery,
    useGetOverdueFollowUpsQuery,
    useGetFollowUpsByExecutiveQuery,
    useGetFollowUpsByLeadQuery,
    useGetFollowUpByIdQuery,
    useCreateFollowUpMutation,
    useUpdateFollowUpMutation,
    useCompleteFollowUpMutation,
    useRescheduleFollowUpMutation,
    useDeleteFollowUpMutation,
    useBulkCreateFollowUpsMutation,
    useGetFollowUpStatsQuery,
    useGetFollowUpCalendarQuery,
    useLazyGetFollowUpsQuery,
    useLazyGetTodaysFollowUpsQuery,
    useLazyGetUpcomingFollowUpsQuery,
    useLazyGetOverdueFollowUpsQuery,
    useLazyGetFollowUpsByExecutiveQuery,
    useLazyGetFollowUpsByLeadQuery,
    useLazyGetFollowUpByIdQuery,
    useLazyGetFollowUpStatsQuery,
    useLazyGetFollowUpCalendarQuery,
} = api;

// Timeline Hooks
export const {
    useGetLeadTimelineQuery,
    useGetTimelineEntryQuery,
    useCreateTimelineEntryMutation,
    useUpdateTimelineEntryMutation,
    useDeleteTimelineEntryMutation,
    useAddTimelineAttachmentMutation,
    useRemoveTimelineAttachmentMutation,
    useGetTimelineByTypeQuery,
    useGetTimelineByDateQuery,
    useSearchTimelineQuery,
    useExportTimelineQuery,
    useGetTimelineStatsQuery,
    useGetRecentActivityQuery,
    useLazyGetLeadTimelineQuery,
    useLazyGetTimelineEntryQuery,
    useLazyGetTimelineByTypeQuery,
    useLazyGetTimelineByDateQuery,
    useLazySearchTimelineQuery,
    useLazyExportTimelineQuery,
    useLazyGetTimelineStatsQuery,
    useLazyGetRecentActivityQuery,
} = api;

// Pipeline Hooks
export const {
    useGetPipelineQuery,
    useGetPipelineStageQuery,
    useGetStageMetricsQuery,
    useMoveLeadMutation,
    useBulkMoveLeadsMutation,
    useGetPipelineAnalyticsQuery,
    useGetPipelineForecastQuery,
    useGetConversionRatesQuery,
    useGetVelocityMetricsQuery,
    useGetLeadPipelineHistoryQuery,
    useGetPipelineSettingsQuery,
    useUpdatePipelineSettingsMutation,
    useLazyGetPipelineQuery,
    useLazyGetPipelineStageQuery,
    useLazyGetStageMetricsQuery,
    useLazyGetPipelineAnalyticsQuery,
    useLazyGetPipelineForecastQuery,
    useLazyGetConversionRatesQuery,
    useLazyGetVelocityMetricsQuery,
    useLazyGetLeadPipelineHistoryQuery,
    useLazyGetPipelineSettingsQuery,
} = api;

// Dashboard Hooks
export const {
    useGetDashboardStatsQuery,
    useGetManagerDashboardQuery,
    useGetExecutiveDashboardQuery,
    useGetKpiDataQuery,
    useGetActivityFeedQuery,
    useGetChartDataQuery,
    useGetRevenueChartQuery,
    useGetLeadDistributionQuery,
    useGetConversionFunnelQuery,
    useGetRecentLeadsQuery,
    useGetUpcomingActivitiesQuery,
    useGetTeamPerformanceQuery,
    useGetDailyStatsQuery,
    useGetPerformanceMetricsQuery,
    useCreateCustomReportMutation,
    useExportDashboardDataQuery,
    useLazyGetDashboardStatsQuery,
    useLazyGetManagerDashboardQuery,
    useLazyGetExecutiveDashboardQuery,
    useLazyGetKpiDataQuery,
    useLazyGetActivityFeedQuery,
    useLazyGetChartDataQuery,
    useLazyGetRevenueChartQuery,
    useLazyGetLeadDistributionQuery,
    useLazyGetConversionFunnelQuery,
    useLazyGetRecentLeadsQuery,
    useLazyGetUpcomingActivitiesQuery,
    useLazyGetTeamPerformanceQuery,
    useLazyGetDailyStatsQuery,
    useLazyGetPerformanceMetricsQuery,
    useLazyExportDashboardDataQuery,
} = api;

// Notification Hooks
export const {
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    useGetUnreadCountQuery,
    useLazyGetNotificationsQuery,
    useLazyGetUnreadCountQuery,
} = api;

// ==================== DEFAULT EXPORT ====================

export default api;