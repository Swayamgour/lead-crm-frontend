import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useGetProfileQuery } from "../redux/api";
import Loading from "./Loading";

function ProtectRoute() {

    const token = localStorage.getItem("token");

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

    // Loading
    if (isLoading || isFetching) {
        return <Loading data="Screen" />;
    }

    // Invalid token
    if (
        isError ||
        error?.status === 401 ||
        !data
    ) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    // Authorized
    return <Outlet />;
}

export default ProtectRoute;