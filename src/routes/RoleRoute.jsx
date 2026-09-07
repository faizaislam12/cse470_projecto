import React from "react";
import { Navigate } from "react-router";
import useRole from "../hooks/useRole";

const RoleRoute = ({ allowedRoles, children }) => {
  const [role, loading] = useRole();

  if (loading) {
    return (
      <div className="eco-dark flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
