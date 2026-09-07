import React from "react";
import { Outlet } from "react-router";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import FloatingLeaves from "../components/FloatingLeaves";
import NotificationBell from "../components/NotificationBell";

const DashboardLayout = () => {
  return (
    <div className="drawer lg:drawer-open eco-dark relative overflow-hidden">
      <FloatingLeaves />

      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content min-h-screen relative z-10">

        {/* Top Bar */}
        <div className="navbar eco-glass sticky top-0 z-30">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="dashboard-drawer"
              className="btn btn-square btn-ghost text-emerald-300"
            >
              ☰
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold eco-gradient-text lg:hidden">
              GreenLoop Dashboard
            </h2>
          </div>

          <div className="flex-none">
            <NotificationBell />
          </div>
        </div>

        <motion.div
          className="p-4 md:p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>

      </div>

      {/* Sidebar */}
      <div className="drawer-side z-20">

        <label
          htmlFor="dashboard-drawer"
          className="drawer-overlay"
        ></label>

        <Sidebar />

      </div>
    </div>
  );
};

export default DashboardLayout;
