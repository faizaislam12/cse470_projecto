import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { FaRecycle, FaExchangeAlt, FaMoneyBillWave, FaLeaf, FaBuilding } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import GlassPanel from "../../components/ui/GlassPanel";

// Estimated kg of CO2 saved per kg recycled — a placeholder until a real
// environmental-impact model exists.
const CO2_FACTOR = 0.5;

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    axiosPublic
      .get(`/businesses/user/${user.uid}`)
      .then(async (res) => {
        setBusiness(res.data);

        if (res.data?._id) {
          const txRes = await axiosPublic.get(
            `/businesses/${res.data._id}/transactions`
          );
          setTransactions(txRes.data);
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

  if (!business) {
    return (
      <div className="text-center py-16">
        <p className="text-xl eco-muted mb-4">
          You haven't registered a business profile yet.
        </p>
        <Link to="/dashboard/add-business" className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold inline-block">
          Register Business
        </Link>
      </div>
    );
  }

  const totalSpent = transactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const co2Saved = Math.round((business.totalRecycled || 0) * CO2_FACTOR);

  return (
    <div>
      <PageHeader title="Business Dashboard" subtitle={business.businessName} icon={<FaBuilding />} />

      {business.status !== "Approved" && (
        <div className="eco-glass rounded-xl px-5 py-3 mb-6 text-amber-300 text-sm">
          Your business profile is currently <b>{business.status}</b>.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Recycled" value={`${business.totalRecycled || 0} kg`} icon={<FaRecycle />} accent="emerald" delay={0} />
        <StatCard label="Total Transactions" value={transactions.length} icon={<FaExchangeAlt />} accent="blue" delay={0.05} />
        <StatCard label="Total Spent" value={`৳${totalSpent}`} icon={<FaMoneyBillWave />} accent="cyan" delay={0.1} />
        <StatCard label="CO₂ Saved" value={`${co2Saved} kg`} sub="estimated" icon={<FaLeaf />} accent="amber" delay={0.15} />
      </div>

      <GlassPanel delay={0.2}>
        <h2 className="text-xl font-bold text-white/90 mb-4">Recent Transactions</h2>

        <div className="overflow-x-auto">
          <table className="table eco-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Material</th>
                <th>Weight</th>
                <th>Amount</th>
                <th>Collector</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td>{t.materialType}</td>
                  <td>{t.weightKg} kg</td>
                  <td>৳{t.amount}</td>
                  <td>{t.collectorName || "—"}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center eco-muted py-6">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>

    </div>
  );
};

export default BusinessDashboard;
