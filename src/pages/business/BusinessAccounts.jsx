import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBuilding } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import Swal from "sweetalert2";
import PageHeader from "../../components/ui/PageHeader";
import GlassPanel from "../../components/ui/GlassPanel";

const statusFilters = ["All", "Pending", "Approved", "Rejected", "Suspended"];
const materialTypes = ["Plastic", "Paper", "Metal", "Glass", "E-waste"];

const emptyTxForm = {
  materialType: "Plastic",
  weightKg: "",
  amount: "",
  collectorName: "",
};

const BusinessAccounts = () => {
  const [businesses, setBusinesses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txForm, setTxForm] = useState(emptyTxForm);
  const modalRef = useRef(null);

  const loadBusinesses = () => {
    axiosPublic
      .get("/businesses")
      .then((res) => setBusinesses(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const matchesStatus =
        statusFilter === "All" || business.status === statusFilter;

      const matchesSearch =
        !term ||
        business.businessName?.toLowerCase().includes(term) ||
        business.email?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [businesses, statusFilter, search]);

  const updateStatus = async (id, status, confirmTitle, confirmColor) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: confirmTitle,
      showCancelButton: true,
      confirmButtonText: status,
      confirmButtonColor: confirmColor,
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axiosPublic.patch(`/businesses/${id}`, { status });

      if (res.data.modifiedCount > 0) {
        Swal.fire({
          icon: "success",
          title: `Business ${status}!`,
          timer: 1500,
          showConfirmButton: false,
        });

        loadBusinesses();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete this business permanently?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axiosPublic.delete(`/businesses/${id}`);

      if (res.data.deletedCount > 0) {
        Swal.fire({
          icon: "success",
          title: "Business Deleted",
          timer: 1500,
          showConfirmButton: false,
        });

        loadBusinesses();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openDetails = async (business) => {
    setSelected(business);
    setTxForm(emptyTxForm);

    try {
      const res = await axiosPublic.get(
        `/businesses/${business._id}/transactions`
      );
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
      setTransactions([]);
    }

    modalRef.current?.showModal();
  };

  const handleLogTransaction = async (e) => {
    e.preventDefault();

    try {
      await axiosPublic.post("/transactions", {
        businessId: selected._id,
        materialType: txForm.materialType,
        weightKg: Number(txForm.weightKg),
        amount: Number(txForm.amount),
        collectorName: txForm.collectorName,
      });

      const [txRes, businessRes] = await Promise.all([
        axiosPublic.get(`/businesses/${selected._id}/transactions`),
        axiosPublic.get(`/businesses/user/${selected.userId}`),
      ]);

      setTransactions(txRes.data);
      setSelected(businessRes.data);
      setTxForm(emptyTxForm);
      loadBusinesses();

      Swal.fire({
        icon: "success",
        title: "Transaction Logged",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>

      <PageHeader title="Business Accounts" subtitle="Review, approve, and manage registered businesses." icon={<FaBuilding />} />

      <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center md:justify-between">

        <div className="tabs tabs-boxed w-fit flex-wrap">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`tab ${statusFilter === status ? "tab-active" : ""}`}
            >
              {status}
              {status !== "All" && (
                <span className="ml-1 text-xs opacity-70">
                  ({businesses.filter((b) => b.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full md:w-72"
          placeholder="Search by business or email"
        />

      </div>

      <GlassPanel className="overflow-x-auto">

        <table className="table table-zebra eco-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Business</th>
              <th>Type</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredBusinesses.map((business, index) => (
              <tr key={business._id}>

                <td>{index + 1}</td>
                <td>{business.businessName}</td>
                <td>{business.businessType || "—"}</td>
                <td>{business.email}</td>

                <td>
                  <span
                    className={`badge ${
                      business.status === "Pending"
                        ? "badge-warning"
                        : business.status === "Approved"
                        ? "badge-success"
                        : business.status === "Suspended"
                        ? "badge-neutral"
                        : "badge-error"
                    }`}
                  >
                    {business.status}
                  </span>
                </td>

                <td>
                  <div className="flex flex-wrap gap-2">

                    <button
                      onClick={() => openDetails(business)}
                      className="btn btn-info btn-xs"
                    >
                      View
                    </button>

                    {business.status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(
                              business._id,
                              "Approved",
                              "Approve this business?",
                              "#16a34a"
                            )
                          }
                          className="btn btn-success btn-xs"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              business._id,
                              "Rejected",
                              "Reject this business?",
                              "#dc2626"
                            )
                          }
                          className="btn btn-error btn-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {business.status === "Approved" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            business._id,
                            "Suspended",
                            "Suspend this business?",
                            "#ca8a04"
                          )
                        }
                        className="btn btn-warning btn-xs"
                      >
                        Suspend
                      </button>
                    )}

                    {business.status === "Suspended" && (
                      <button
                        onClick={() =>
                          updateStatus(
                            business._id,
                            "Approved",
                            "Reinstate this business?",
                            "#16a34a"
                          )
                        }
                        className="btn btn-success btn-xs"
                      >
                        Reinstate
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(business._id)}
                      className="btn btn-outline btn-error btn-xs"
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>
            ))}

            {filteredBusinesses.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center eco-muted py-6">
                  No businesses match this filter.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </GlassPanel>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-2xl">
          {selected && (
            <>
              <h3 className="font-bold text-2xl mb-1 text-white">
                {selected.businessName}
              </h3>

              <p className="eco-muted mb-4">
                {selected.businessType} • {selected.email}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div><span className="font-semibold">Phone:</span> {selected.phone || "—"}</div>
                <div><span className="font-semibold">Status:</span> {selected.status}</div>
                <div className="col-span-2"><span className="font-semibold">Address:</span> {selected.address || "—"}</div>
                <div className="col-span-2"><span className="font-semibold">Description:</span> {selected.description || "—"}</div>
                <div><span className="font-semibold">Total Recycled:</span> {selected.totalRecycled || 0} kg</div>
              </div>

              <h4 className="font-bold mb-2">Log a Transaction</h4>

              <form
                onSubmit={handleLogTransaction}
                className="grid grid-cols-2 gap-2 mb-6"
              >
                <select
                  value={txForm.materialType}
                  onChange={(e) =>
                    setTxForm({ ...txForm, materialType: e.target.value })
                  }
                  className="select select-bordered select-sm"
                >
                  {materialTypes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <input
                  value={txForm.weightKg}
                  onChange={(e) =>
                    setTxForm({ ...txForm, weightKg: e.target.value })
                  }
                  type="number"
                  placeholder="Weight (kg)"
                  className="input input-bordered input-sm"
                  required
                />

                <input
                  value={txForm.amount}
                  onChange={(e) =>
                    setTxForm({ ...txForm, amount: e.target.value })
                  }
                  type="number"
                  placeholder="Amount (৳)"
                  className="input input-bordered input-sm"
                  required
                />

                <input
                  value={txForm.collectorName}
                  onChange={(e) =>
                    setTxForm({ ...txForm, collectorName: e.target.value })
                  }
                  placeholder="Collector (optional)"
                  className="input input-bordered input-sm"
                />

                <button className="btn btn-success btn-sm col-span-2">
                  Log Transaction
                </button>
              </form>

              <h4 className="font-bold mb-2 text-white/90">Transaction History</h4>

              <div className="overflow-x-auto max-h-48 overflow-y-auto eco-scrollbar">
                <table className="table table-xs eco-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Weight</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t._id}>
                        <td>{t.materialType}</td>
                        <td>{t.weightKg} kg</td>
                        <td>৳{t.amount}</td>
                        <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}

                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center eco-muted py-3">
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

export default BusinessAccounts;
