import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaTruck, FaUserCheck, FaBoxes, FaCheckCircle, FaStar, FaWeightHanging, FaTimesCircle, FaChartLine } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import Swal from "sweetalert2";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import GlassPanel from "../../components/ui/GlassPanel";

const materialTypes = ["Plastic", "Paper", "Metal", "Glass", "E-waste"];
const pickupStatuses = ["Completed", "Pending", "Cancelled"];

const emptyPickupForm = {
  materialType: "Plastic",
  weightKg: "",
  earnings: "",
  status: "Completed",
  pickupDate: new Date().toISOString().slice(0, 10),
};

const CollectorPerformance = () => {
  const [collectors, setCollectors] = useState([]);
  const [statsById, setStatsById] = useState({});
  const [overview, setOverview] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [selected, setSelected] = useState(null);
  const [pickupForm, setPickupForm] = useState(emptyPickupForm);
  const modalRef = useRef(null);

  const loadAll = async () => {
    try {
      const [collectorsRes, overviewRes] = await Promise.all([
        axiosPublic.get("/collectors"),
        axiosPublic.get("/collector-stats-overview"),
      ]);

      setCollectors(collectorsRes.data);
      setOverview(overviewRes.data);

      const statsEntries = await Promise.all(
        collectorsRes.data.map(async (c) => {
          const res = await axiosPublic.get(`/collectors/${c._id}/stats`);
          return [c._id, res.data];
        })
      );

      setStatsById(Object.fromEntries(statsEntries));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const visibleCollectors = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = collectors.filter(
      (collector) => !term || collector.name?.toLowerCase().includes(term)
    );

    const sorted = [...filtered].sort((a, b) => {
      const statsA = statsById[a._id] || {};
      const statsB = statsById[b._id] || {};

      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "pickups")
        return (statsB.completed || 0) - (statsA.completed || 0);
      if (sortBy === "weight")
        return (statsB.totalWeight || 0) - (statsA.totalWeight || 0);
      if (sortBy === "earnings")
        return (statsB.totalEarnings || 0) - (statsA.totalEarnings || 0);
      return 0;
    });

    return sorted;
  }, [collectors, search, sortBy, statsById]);

  const handleAddCollector = async (e) => {
    e.preventDefault();

    const form = e.target;

    const collector = {
      name: form.name.value,
      email: form.email.value,
      rating: Number(form.rating.value),
      status: "Active",
    };

    const res = await axiosPublic.post("/collectors", collector);

    if (res.data.insertedId) {
      Swal.fire({
        icon: "success",
        title: "Collector Added",
        timer: 1500,
        showConfirmButton: false,
      });

      form.reset();
      loadAll();
    }
  };

  const openLogPickup = (collector) => {
    setSelected(collector);
    setPickupForm(emptyPickupForm);
    modalRef.current?.showModal();
  };

  const handleLogPickup = async (e) => {
    e.preventDefault();

    try {
      await axiosPublic.post("/pickups", {
        collectorId: selected._id,
        materialType: pickupForm.materialType,
        weightKg: Number(pickupForm.weightKg),
        earnings: Number(pickupForm.earnings),
        status: pickupForm.status,
        pickupDate: pickupForm.pickupDate,
      });

      Swal.fire({
        icon: "success",
        title: "Pickup Logged",
        timer: 1200,
        showConfirmButton: false,
      });

      setPickupForm(emptyPickupForm);
      loadAll();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>

      <PageHeader title="Collector Performance" subtitle="Fleet-wide pickup statistics and leaderboard." icon={<FaTruck />} />

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Collectors" value={overview.totalCollectors} icon={<FaTruck />} accent="emerald" delay={0} />
          <StatCard label="Active Collectors" value={overview.activeCollectors} icon={<FaUserCheck />} accent="blue" delay={0.03} />
          <StatCard label="Total Pickups" value={overview.totalPickups} icon={<FaBoxes />} accent="amber" delay={0.06} />
          <StatCard label="Completed" value={overview.completedPickups} icon={<FaCheckCircle />} accent="cyan" delay={0.09} />
          <StatCard label="Cancelled" value={overview.cancelledPickups} icon={<FaTimesCircle />} accent="rose" delay={0.1} />
          <StatCard label="Success Rate" value={`${overview.successRate}%`} icon={<FaChartLine />} accent="blue" delay={0.11} />
          <StatCard label="Avg Rating" value={`${overview.avgRating} ⭐`} icon={<FaStar />} accent="violet" delay={0.12} />
          <StatCard label="Total Waste" value={`${overview.totalWaste} kg`} icon={<FaWeightHanging />} accent="rose" delay={0.15} />
        </div>
      )}

      {overview?.leaderboard?.length > 0 && (
        <GlassPanel className="mb-8" delay={0.2}>
          <h2 className="text-xl font-bold text-white/90 mb-3">Top Collectors</h2>
          <div className="overflow-x-auto">
            <table className="table eco-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Completed Pickups</th><th>Success Rate</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {overview.leaderboard.map((c, i) => (
                  <tr key={c._id}>
                    <td>{i + 1}</td>
                    <td>{c.name}</td>
                    <td>{c.completedPickups}</td>
                    <td>{c.successRate}%</td>
                    <td>{c.rating} ⭐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      <GlassPanel className="mb-8">
        <h2 className="text-xl font-bold text-white/90 mb-3">Add Collector</h2>

        <form
          onSubmit={handleAddCollector}
          className="grid grid-cols-2 gap-4"
        >

          <input
            name="name"
            className="input input-bordered"
            placeholder="Collector Name"
            required
          />

          <input
            name="email"
            type="email"
            className="input input-bordered"
            placeholder="Email (optional, for self-login linking)"
          />

          <input
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            className="input input-bordered col-span-2"
            placeholder="Initial Rating (0-5)"
            required
          />

          <button className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold col-span-2">
            Add Collector
          </button>

        </form>
      </GlassPanel>

      <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center md:justify-between">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full md:w-72"
          placeholder="Search by collector name"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="select select-bordered w-full md:w-56"
        >
          <option value="rating">Sort: Rating (High to Low)</option>
          <option value="pickups">Sort: Completed Pickups</option>
          <option value="weight">Sort: Total Weight</option>
          <option value="earnings">Sort: Total Earnings</option>
        </select>

      </div>

      <GlassPanel className="overflow-x-auto">

        <table className="table eco-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Completed</th>
              <th>Pending</th>
              <th>Cancelled</th>
              <th>Weight</th>
              <th>Earnings</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {visibleCollectors.map((collector, index) => {
              const stats = statsById[collector._id] || {};

              return (
                <tr key={collector._id}>
                  <td>{index + 1}</td>
                  <td>{collector.name}</td>
                  <td>{stats.completed || 0}</td>
                  <td>{stats.pending || 0}</td>
                  <td>{stats.cancelled || 0}</td>
                  <td>{stats.totalWeight || 0} kg</td>
                  <td>৳{stats.totalEarnings || 0}</td>
                  <td>{collector.rating} ⭐</td>
                  <td>
                    <button
                      onClick={() => openLogPickup(collector)}
                      className="btn btn-success btn-xs"
                    >
                      Log Pickup
                    </button>
                  </td>
                </tr>
              );
            })}

            {visibleCollectors.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center eco-muted py-6">
                  No collectors match your search.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </GlassPanel>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          {selected && (
            <>
              <h3 className="font-bold text-xl mb-4 text-white">
                Log Pickup — {selected.name}
              </h3>

              <form onSubmit={handleLogPickup} className="space-y-3">

                <select
                  value={pickupForm.materialType}
                  onChange={(e) =>
                    setPickupForm({ ...pickupForm, materialType: e.target.value })
                  }
                  className="select select-bordered w-full"
                >
                  {materialTypes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <input
                  value={pickupForm.weightKg}
                  onChange={(e) =>
                    setPickupForm({ ...pickupForm, weightKg: e.target.value })
                  }
                  type="number"
                  placeholder="Weight (kg)"
                  className="input input-bordered w-full"
                  required
                />

                <input
                  value={pickupForm.earnings}
                  onChange={(e) =>
                    setPickupForm({ ...pickupForm, earnings: e.target.value })
                  }
                  type="number"
                  placeholder="Earnings (৳)"
                  className="input input-bordered w-full"
                  required
                />

                <select
                  value={pickupForm.status}
                  onChange={(e) =>
                    setPickupForm({ ...pickupForm, status: e.target.value })
                  }
                  className="select select-bordered w-full"
                >
                  {pickupStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <input
                  value={pickupForm.pickupDate}
                  onChange={(e) =>
                    setPickupForm({ ...pickupForm, pickupDate: e.target.value })
                  }
                  type="date"
                  className="input input-bordered w-full"
                  required
                />

                <button className="eco-gradient-btn text-white rounded-xl w-full py-3 font-semibold">
                  Log Pickup
                </button>

              </form>
            </>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default CollectorPerformance;
