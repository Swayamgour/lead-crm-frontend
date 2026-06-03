import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'http://localhost:5000/api'; // your backend URL

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            // If you have token stored in localStorage
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Category'],
    endpoints: (builder) => ({


        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Category'],
        }),


        // Add to your existing api.js

        // Banner endpoints
        getBanners: builder.query({
            query: () => '/banners',
            providesTags: ['Banner'],
            transformResponse: (response) => response,
        }),

        getActiveBanners: builder.query({
            query: () => '/banners/active',
            providesTags: ['Banner'],
            transformResponse: (response) => response,
        }),

        getBannerById: builder.query({
            query: (id) => `/banners/${id}`,
            providesTags: ['Banner'],
            transformResponse: (response) => response,
        }),

        createBanner: builder.mutation({
            query: (bannerData) => ({
                url: '/banners',
                method: 'POST',
                body: bannerData,
            }),
            invalidatesTags: ['Banner'],
        }),

        updateBanner: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/banners/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Banner'],
        }),

        deleteBanner: builder.mutation({
            query: (id) => ({
                url: `/banners/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Banner'],
        }),



        // Get nested menu (tree)
        getMenu: builder.query({
            query: () => '/category/menu',
            providesTags: ['Category'],
            transformResponse: (response) => response.data,
        }),
        // Get flat list for dropdown parent selection
        getFlatList: builder.query({
            query: () => '/category/flat',
            providesTags: ['Category'],
            transformResponse: (response) => response.data,
        }),
        // Create category
        createCategory: builder.mutation({
            query: (newCategory) => ({
                url: '/category',
                method: 'POST',
                body: newCategory,
            }),
            invalidatesTags: ['Category'],
        }),
        // Update category
        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/category/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),
        // Delete category
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/category/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
        // Reorder categories (bulk)
        reorderCategories: builder.mutation({
            query: (updates) => ({
                url: '/category/reorder',
                method: 'POST',
                body: { updates },
            }),
            invalidatesTags: ['Category'],
        }),


        // ==========================
        // PRODUCTS
        // ==========================

        // Get All Products
        getProducts: builder.query({
            query: (params = {}) => ({
                url: '/products',
                params,
            }),
            providesTags: ['Product'],
        }),

        // Featured Products
        getFeaturedProducts: builder.query({
            query: () => '/products/featured',
            providesTags: ['Product'],
        }),

        // Product By Slug
        getProductBySlug: builder.query({
            query: (slug) => `/products/slug/${slug}`,
            providesTags: ['Product'],
        }),

        // Product By Id
        getProductById: builder.query({
            query: (id) => `/products/${id}`,
            providesTags: ['Product'],
        }),

        // Related Products
        getRelatedProducts: builder.query({
            query: (id) => `/products/${id}/related`,
            providesTags: ['Product'],
        }),

        // Create Product
        createProduct: builder.mutation({
            query: (formData) => ({
                url: '/products',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Product'],
        }),

        // Update Product
        updateProduct: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/products/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Product'],
        }),

        // Delete Product
        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),

        // Product Reviews
        getProductReviews: builder.query({
            query: (id) => `/products/${id}/reviews`,
            providesTags: ['Review'],
        }),

        // Add Review
        addReview: builder.mutation({
            query: ({ id, rating, comment }) => ({
                url: `/products/${id}/review`,
                method: 'POST',
                body: {
                    rating,
                    comment,
                },
            }),
            invalidatesTags: ['Review', 'Product'],
        }),
    }),
});

export const {
    useLoginMutation,

    useGetBannersQuery,
    useGetActiveBannersQuery,
    useGetBannerByIdQuery,
    useCreateBannerMutation,
    useUpdateBannerMutation,
    useDeleteBannerMutation,


    useGetMenuQuery,
    useGetFlatListQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useReorderCategoriesMutation,


    useGetProductsQuery,
    useGetFeaturedProductsQuery,
    useGetProductBySlugQuery,
    useGetProductByIdQuery,
    useGetRelatedProductsQuery,

    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,

    // Reviews
    useGetProductReviewsQuery,
    useAddReviewMutation,
} = api;