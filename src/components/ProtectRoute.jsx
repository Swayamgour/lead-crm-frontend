import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useGetProfileQuery } from "../redux/api";

function ProtectRoute() {

    const token = localStorage.getItem("token")

    const { data, isLoading } = useGetProfileQuery(undefined, {
        skip: !token
    })

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!data) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectRoute