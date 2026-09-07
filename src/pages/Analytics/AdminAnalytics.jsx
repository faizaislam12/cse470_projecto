import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FaUsers,
  FaTruck,
  FaBuilding,
  FaLeaf,
  FaCheckCircle,
  FaMoneyBillWave,
  FaStar,
  FaBullhorn,
  FaChartPie,
  FaTimesCircle,
  FaTrophy,
  FaRecycle,
} from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import GlassPanel from "../../components/ui/GlassPanel";

const ROLE_COLORS = {
  Household: "#34d399",
  Collector: "#38bdf8",
  Business: "#fbbf24",
  Company: "#c084fc",
};

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

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosPublic
      .get("/admin-analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 eco-muted">
        Couldn't load analytics right now.
      </div>
    );
  }

  const {
    totals,
    topPerformers,
    userGrowth,
    wasteByMaterial,
    userDistribution,
    transactionsByMonth,
    campaignPerformance,
  } = data;

  const pickupOutcome = [
    { name: "Completed", value: totals.completedPickups },
    { name: "Cancelled", value: totals.cancelledPickups },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Analytics Dashboard"
        subtitle="A full overview of GreenLoop — users, waste, campaigns, and revenue."
        icon={<FaChartPie />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <StatCard label="Users" value={totals.users} icon={<FaUsers />} accent="emerald" delay={0} />
        <StatCard label="Collectors" value={totals.collectors} icon={<FaTruck />} accent="blue" delay={0.03} />
        <StatCard label="Businesses" value={totals.businesses} icon={<FaBuilding />} accent="amber" delay={0.06} />

        <StatCard label="Total Waste" value={`${totals.totalWaste} kg`} icon={<FaLeaf />} accent="emerald" delay={0.09} />
        <StatCard label="Completed Pickups" value={totals.completedPickups} icon={<FaCheckCircle />} accent="cyan" delay={0.12} />
        <StatCard label="Cancelled Pickups" value={totals.cancelledPickups} icon={<FaTimesCircle />} accent="rose" delay={0.13} />
        <StatCard label="Transactions" value={totals.transactions} icon={<FaMoneyBillWave />} accent="violet" delay={0.15} />

        <StatCard label="EcoPoints Issued" value={totals.ecoPointsIssued.toLocaleString()} sub="estimated" icon={<FaStar />} accent="amber" delay={0.18} />
        <StatCard label="Active Campaigns" value={totals.activeCampaigns} icon={<FaBullhorn />} accent="rose" delay={0.21} />
        <StatCard label="Revenue" value={`৳${totals.revenue.toLocaleString()}`} icon={<FaMoneyBillWave />} accent="emerald" delay={0.24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <ChartCard title="User Growth">
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="users" stroke="#34d399" strokeWidth={2.5} dot={{ fill: "#34d399" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyNote />
          )}
        </ChartCard>

        <ChartCard title="Waste Collected by Material">
          {wasteByMaterial.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={wasteByMaterial}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="material" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="weightKg" radius={[6, 6, 0, 0]}>
                  {wasteByMaterial.map((entry) => (
                    <Cell
                      key={entry.material}
                      fill={MATERIAL_COLORS[entry.material] || "#38bdf8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyNote />
          )}
        </ChartCard>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <ChartCard title="User Distribution">
          {userDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.role} ${entry.percent}%`}
                  labelLine={{ stroke: "rgba(233,253,245,0.3)" }}
                >
                  {userDistribution.map((entry) => (
                    <Cell
                      key={entry.role}
                      fill={ROLE_COLORS[entry.role] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "rgba(233,253,245,0.7)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyNote />
          )}
        </ChartCard>

        <ChartCard title="Transactions (Monthly)">
          {transactionsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={transactionsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyNote />
          )}
        </ChartCard>

      </div>

      <ChartCard title="Campaign Performance (Target vs Collected)">
        {campaignPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="title" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "rgba(233,253,245,0.7)" }} />
              <Bar dataKey="targetWeight" name="Target (kg)" fill="rgba(148,163,184,0.5)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="currentWeight" name="Collected (kg)" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyNote />
        )}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <ChartCard title="Completed vs Cancelled Pickups">
          {totals.completedPickups + totals.cancelledPickups > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pickupOutcome}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#34d399" />
                  <Cell fill="#f87171" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "rgba(233,253,245,0.7)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyNote />
          )}
        </ChartCard>

        <ChartCard title="Top Performers">
          <div className="space-y-4">
            <TopPerformerRow
              icon={<FaTrophy />}
              label="Most Active Collector"
              value={
                topPerformers?.mostActiveCollector
                  ? `${topPerformers.mostActiveCollector.name} — ${topPerformers.mostActiveCollector.completedPickups} pickups`
                  : "No data yet"
              }
            />
            <TopPerformerRow
              icon={<FaBuilding />}
              label="Most Active Business"
              value={
                topPerformers?.mostActiveBusiness
                  ? `${topPerformers.mostActiveBusiness.name} — ${topPerformers.mostActiveBusiness.transactions} transactions`
                  : "No data yet"
              }
            />
            <TopPerformerRow
              icon={<FaRecycle />}
              label="Most Recycled Material"
              value={
                topPerformers?.mostRecycledMaterial
                  ? `${topPerformers.mostRecycledMaterial.material} — ${topPerformers.mostRecycledMaterial.weightKg} kg`
                  : "No data yet"
              }
            />
          </div>
        </ChartCard>

      </div>

    </div>
  );
};

const TopPerformerRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 eco-glass rounded-xl p-4">
    <span className="text-2xl text-emerald-400">{icon}</span>
    <div>
      <p className="text-xs eco-muted uppercase tracking-wide">{label}</p>
      <p className="text-white/90 font-semibold">{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <GlassPanel>
    <h2 className="text-lg font-semibold text-white/90 mb-2">{title}</h2>
    {children}
  </GlassPanel>
);

const EmptyNote = () => (
  <p className="text-center eco-muted text-sm py-20">No data yet.</p>
);

export default AdminAnalytics;
