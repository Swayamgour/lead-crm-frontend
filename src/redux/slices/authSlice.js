import { createSlice } from '@reduxjs/toolkit';

// Rehydrate from localStorage on app load, so a page refresh
// doesn't lose the session before the next login.
const loadStoredUser = () => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const initialState = {
    user: loadStoredUser(),
    token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Called on successful login with { user, token } from the API response.
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        // Called on logout, or when a protected request comes back unauthorized.
        logout: (state) => {
            state.user = null;
            state.token = null;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
