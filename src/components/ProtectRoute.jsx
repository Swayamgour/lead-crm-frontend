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

        dispatch(logout());

        return <Navigate to="/login" replace />;
    }

    // Authorized
    return <Outlet />;
}

export default ProtectRoute;