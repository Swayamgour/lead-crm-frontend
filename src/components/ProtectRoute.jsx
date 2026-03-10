import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useGetProfileQuery } from "../redux/api";

function ProtectRoute() {

    const { data, isLoading, isError } = useGetProfileQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // agar profile nahi mili
    if (isError || !data) {
        return <Navigate to="/login" replace />;
    }

    // agar profile mil gayi
    return <Outlet />;
}

export default ProtectRoute;