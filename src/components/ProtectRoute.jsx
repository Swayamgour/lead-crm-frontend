import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useGetProfileQuery } from "../redux/api";
import { selectCurrentToken, logout } from "../redux/slices/authSlice";
import Loading from "./Loading";

function ProtectRoute() {

    const token = useSelector(selectCurrentToken);
    const dispatch = useDispatch();

    // Skip API if no token
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error
    } = useGetProfileQuery(undefined, {
        skip: !token
    });

    // No token
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Loading — only block the whole screen on the FIRST fetch.
    // Background refetches (window focus, reconnect, etc.) shouldn't
    // yank the user back to a loading screen every time.
    if (isLoading || (isFetching && data === undefined)) {
        return <Loading data="Screen" />;
    }

    // Token actually invalid/expired (server explicitly rejected it) -> real logout case
    if (error?.status === 401) {
        dispatch(logout());
        return <Navigate to="/login" replace />;
    }

    // Any other failure (network glitch, server slow/down, timeout, CORS hiccup, etc.)
    // is NOT proof the session is invalid — a valid token exists locally, so let the
    // user through instead of bouncing them back to /login.
    return <Outlet />;
}

export default ProtectRoute;