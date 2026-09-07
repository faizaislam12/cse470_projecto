import React from "react";
import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaHome,
  FaBullhorn,
  FaBell,
  FaUsersCog,
  FaBuilding,
  FaTruck,
  FaChartPie,
  FaTachometerAlt,
  FaUserTie,
} from "react-icons/fa";
import useRole from "../hooks/useRole";

const NavItem = ({ to, icon, children, active }) => (
  <li>
    <Link
      to={to}
      className={`relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors duration-200 ${
        active
          ? "text-white"
          : "text-emerald-100/70 hover:text-white hover:bg-white/5"
      }`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl eco-gradient-btn"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10 text-lg">{icon}</span>
      <span className="relative z-10 font-medium">{children}</span>
    </Link>
  </li>
);

const SectionLabel = ({ children }) => (
  <p className="px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/50">
    {children}
  </p>
);

const Sidebar = () => {
  const [role, loading] = useRole();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <div className="eco-dark eco-glass w-72 min-h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  return (
    <div className="eco-dark eco-glass w-72 min-h-full flex flex-col">

      <div className="flex items-center gap-2 px-6 py-6 border-b border-white/10">
        <FaLeaf className="text-2xl text-emerald-400" />
        <h2 className="text-2xl font-extrabold eco-gradient-text">
          GreenLoop
        </h2>
      </div>

      <ul className="menu p-4 flex-1">

        <NavItem to="/" icon={<FaHome />} active={isActive("/")}>
          Home
        </NavItem>

        <NavItem to="/campaigns" icon={<FaBullhorn />} active={isActive("/campaigns")}>
          Campaigns
        </NavItem>

        <NavItem to="/dashboard" icon={<FaTachometerAlt />} active={isActive("/dashboard")}>
          Dashboard
        </NavItem>

        {role === "Admin" && (
          <>
            <SectionLabel>Admin</SectionLabel>

            <NavItem to="/dashboard/users" icon={<FaUsersCog />} active={isActive("/dashboard/users")}>
              User Management
            </NavItem>

            <NavItem to="/dashboard/businesses" icon={<FaBuilding />} active={isActive("/dashboard/businesses")}>
              Business Accounts
            </NavItem>

            <NavItem to="/dashboard/collector-performance" icon={<FaTruck />} active={isActive("/dashboard/collector-performance")}>
              Collector Performance
            </NavItem>

            <NavItem to="/dashboard/campaigns" icon={<FaBullhorn />} active={isActive("/dashboard/campaigns")}>
              Community Campaigns
            </NavItem>

            <NavItem to="/dashboard/notifications" icon={<FaBell />} active={isActive("/dashboard/notifications")}>
              Notification Center
            </NavItem>

            <NavItem to="/dashboard/analytics" icon={<FaChartPie />} active={isActive("/dashboard/analytics")}>
              Admin Analytics
            </NavItem>
          </>
        )}

        {role === "Business" && (
          <>
            <SectionLabel>Business</SectionLabel>

            <NavItem to="/dashboard/business-dashboard" icon={<FaChartPie />} active={isActive("/dashboard/business-dashboard")}>
              My Dashboard
            </NavItem>

            <NavItem to="/dashboard/add-business" icon={<FaBuilding />} active={isActive("/dashboard/add-business")}>
              My Business Profile
            </NavItem>
          </>
        )}

        {role === "Collector" && (
          <>
            <SectionLabel>Collector</SectionLabel>

            <NavItem to="/dashboard/my-performance" icon={<FaTruck />} active={isActive("/dashboard/my-performance")}>
              My Performance
            </NavItem>
          </>
        )}

        {(role === "Household" || role === "Company") && (
          <>
            <SectionLabel>{role}</SectionLabel>

            <NavItem to="/dashboard" icon={<FaUserTie />} active={false}>
              My Dashboard
            </NavItem>
          </>
        )}

      </ul>

    </div>
  );
};

export default Sidebar;
