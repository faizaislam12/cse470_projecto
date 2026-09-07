import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaBullhorn,
  FaBell,
} from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";

const emptyStats = {
  totalUsers: 0,
  totalBusinesses: 0,
  pendingBusinesses: 0,
  approvedBusinesses: 0,
  totalCampaigns: 0,
  totalNotifications: 0,
};

const DashboardHome = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await axiosPublic.get("/dashboard-stats");
        setStats(res.data);
      } catch (error) {
        console.log(error);
        setStats(emptyStats);
      }
    };

    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="GreenLoop Admin Dashboard"
        subtitle="A quick snapshot of the whole platform."
        icon={<FaUsers />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} icon={<FaUsers />} accent="emerald" delay={0} />
        <StatCard label="Businesses" value={stats.totalBusinesses} icon={<FaBuilding />} accent="blue" delay={0.05} />
        <StatCard label="Pending" value={stats.pendingBusinesses} icon={<FaClock />} accent="amber" delay={0.1} />
        <StatCard label="Approved" value={stats.approvedBusinesses} icon={<FaCheckCircle />} accent="cyan" delay={0.15} />
        <StatCard label="Campaigns" value={stats.totalCampaigns} icon={<FaBullhorn />} accent="rose" delay={0.2} />
        <StatCard label="Notifications" value={stats.totalNotifications} icon={<FaBell />} accent="violet" delay={0.25} />
      </div>
    </div>
  );
};

export default DashboardHome;
