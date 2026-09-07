import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaTruck, FaBoxes, FaCheckCircle, FaClock, FaTimesCircle, FaWeightHanging, FaMoneyBillWave, FaStar, FaChartLine } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import GlassPanel from "../../components/ui/GlassPanel";

const STATUS_COLORS = ["#34d399", "#fbbf24", "#f87171"];
const MATERIAL_COLORS = {
  Plastic: "#38bdf8",
  Paper: "#fbbf24",
  Metal: "#94a3b8",
  Glass: "#22d3ee",
  "E-waste": "#c084fc",
};

const gridStroke = "rgba(255,255,255,0.08)";
const axisTick = { fill: "rgba(233,253,245,0.55)", fontSize: 12 };
const tooltipStyle = {
  background: "#06231a",
  border: "1px solid rgba(52,211,153,0.3)",
  borderRadius: 12,
  color: "#e9fdf5",
};

const MyPerformance = () => {
  const { user } = useAuth();
  const [collector, setCollector] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    axiosPublic
      .get(`/collectors/email/${user.email}`)
      .then(async (res) => {
        setCollector(res.data);

        if (res.data?._id) {
          const statsRes = await axiosPublic.get(
            `/collectors/${res.data._id}/stats`
          );
          setStats(statsRes.data);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  if (!collector) {
    return (
      <div className="text-center py-16">
        <p className="text-xl eco-muted">
          No collector profile linked to your account yet. Contact an admin
          to get set up.
        </p>
      </div>
    );
  }

  const pieData = [
    { name: "Completed", value: stats?.completed || 0 },
    { name: "Pending", value: stats?.pending || 0 },
    { name: "Cancelled", value: stats?.cancelled || 0 },
  ];

  const earningsData = (stats?.monthlyEarnings || []).map((m) => ({
    month: m.month,
    earnings: m.earnings,
  }));

  const wasteData = (stats?.wasteByMaterial || []).map((w) => ({
    material: w.material,
    weightKg: w.weightKg,
  }));

  return (
    <div>
      <PageHeader title="Collector Performance" subtitle={collector.name} icon={<FaTruck />} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Pickups" value={stats?.totalPickups || 0} icon={<FaBoxes />} accent="emerald" delay={0} />
        <StatCard label="Completed" value={stats?.completed || 0} icon={<FaCheckCircle />} accent="blue" delay={0.05} />
        <StatCard label="Pending" value={stats?.pending || 0} icon={<FaClock />} accent="amber" delay={0.1} />
        <StatCard label="Cancelled" value={stats?.cancelled || 0} icon={<FaTimesCircle />} accent="rose" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Success Rate" value={`${stats?.successRate || 0}%`} icon={<FaChartLine />} accent="blue" delay={0.18} />
        <StatCard label="Total Weight" value={`${stats?.totalWeight || 0} kg`} icon={<FaWeightHanging />} accent="cyan" delay={0.2} />
        <StatCard label="Total Earnings" value={`৳${stats?.totalEarnings || 0}`} icon={<FaMoneyBillWave />} accent="emerald" delay={0.25} />
        <StatCard label="Average Rating" value={`${collector.rating} ⭐`} icon={<FaStar />} accent="violet" delay={0.3} />
      </div>

      <GlassPanel className="mb-8" delay={0.35}>
        <h2 className="text-xl font-bold text-white/90 mb-4">This Month</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm eco-muted">Pickups</p>
            <p className="text-2xl font-bold text-white">{stats?.thisMonth?.pickups || 0}</p>
          </div>
          <div>
            <p className="text-sm eco-muted">Weight</p>
            <p className="text-2xl font-bold text-white">{stats?.thisMonth?.weight || 0} kg</p>
          </div>
          <div>
            <p className="text-sm eco-muted">Earnings</p>
            <p className="text-2xl font-bold text-white">৳{stats?.thisMonth?.earnings || 0}</p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <GlassPanel delay={0.4}>
          <h2 className="text-lg font-semibold text-white/90 mb-2">Pickup Statistics</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "rgba(233,253,245,0.7)" }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassPanel>

        <GlassPanel delay={0.45}>
          <h2 className="text-lg font-semibold text-white/90 mb-2">Monthly Earnings</h2>
          {earningsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="earnings" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center eco-muted text-sm py-16">
              No earnings data yet.
            </p>
          )}
        </GlassPanel>

        <GlassPanel delay={0.5}>
          <h2 className="text-lg font-semibold text-white/90 mb-2">Waste Collected</h2>
          {wasteData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={wasteData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis type="number" tick={axisTick} />
                <YAxis type="category" dataKey="material" width={70} tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="weightKg" radius={[0, 6, 6, 0]}>
                  {wasteData.map((entry) => (
                    <Cell
                      key={entry.material}
                      fill={MATERIAL_COLORS[entry.material] || "#38bdf8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center eco-muted text-sm py-16">
              No waste data yet.
            </p>
          )}
        </GlassPanel>

      </div>

    </div>
  );
};

export default MyPerformance;
