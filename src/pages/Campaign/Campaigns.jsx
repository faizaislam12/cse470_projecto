import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBullhorn } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/ui/PageHeader";
import GlassPanel from "../../components/ui/GlassPanel";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  startDate: "",
  endDate: "",
  targetWeight: "",
};

const Campaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsFor, setParticipantsFor] = useState(null);
  const modalRef = useRef(null);

  const loadCampaigns = () => {
    axiosPublic
      .get("/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axiosPublic.patch(`/campaigns/${editingId}`, form);

        Swal.fire({
          icon: "success",
          title: "Campaign Updated",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        const res = await axiosPublic.post("/campaigns", {
          ...form,
          createdBy: user?.uid,
        });

        if (res.data.insertedId) {
          Swal.fire({
            icon: "success",
            title: "Campaign Created",
            timer: 1200,
            showConfirmButton: false,
          });
        }
      }

      resetForm();
      loadCampaigns();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (campaign) => {
    setEditingId(campaign._id);
    setForm({
      title: campaign.title,
      description: campaign.description,
      image: campaign.image || "",
      startDate: campaign.startDate?.slice(0, 10),
      endDate: campaign.endDate?.slice(0, 10),
      targetWeight: campaign.targetWeight,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = async (campaign) => {
    const nextStatus = campaign.status === "Active" ? "Ended" : "Active";

    await axiosPublic.patch(`/campaigns/${campaign._id}/status`, {
      status: nextStatus,
    });

    Swal.fire({
      icon: "success",
      title: `Campaign ${nextStatus}`,
      timer: 1200,
      showConfirmButton: false,
    });

    loadCampaigns();
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete this campaign?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    const res = await axiosPublic.delete(`/campaigns/${id}`);

    if (res.data.deletedCount > 0) {
      Swal.fire({
        icon: "success",
        title: "Campaign Deleted",
        timer: 1500,
        showConfirmButton: false,
      });

      loadCampaigns();
    }
  };

  const viewParticipants = async (campaign) => {
    setParticipantsFor(campaign);

    try {
      const res = await axiosPublic.get(
        `/campaigns/${campaign._id}/participants`
      );
      setParticipants(res.data);
    } catch (error) {
      console.log(error);
      setParticipants([]);
    }

    modalRef.current?.showModal();
  };

  const campaignRows = useMemo(
    () =>
      campaigns.map((c) => ({
        ...c,
        progress: c.targetWeight
          ? Math.min(100, Math.round((c.currentWeight / c.targetWeight) * 100))
          : 0,
      })),
    [campaigns]
  );

  return (
    <div>

      <PageHeader title="Community Campaigns" subtitle="Create, run, and track recycling campaigns." icon={<FaBullhorn />} />

      <GlassPanel className="mb-10">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4"
      >

        <input
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="input input-bordered col-span-2"
          placeholder="Campaign Title"
          required
        />

        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="textarea textarea-bordered col-span-2"
          placeholder="Description"
          required
        ></textarea>

        <input
          value={form.image}
          onChange={(e) => handleChange("image", e.target.value)}
          className="input input-bordered col-span-2"
          placeholder="Image URL (optional)"
        />

        <input
          type="date"
          value={form.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
          className="input input-bordered"
          required
        />

        <input
          type="date"
          value={form.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
          className="input input-bordered"
          required
        />

        <input
          type="number"
          value={form.targetWeight}
          onChange={(e) => handleChange("targetWeight", e.target.value)}
          className="input input-bordered col-span-2"
          placeholder="Target Weight (kg)"
          required
        />

        <div className="col-span-2 flex gap-2">
          <button className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold flex-1">
            {editingId ? "Save Changes" : "Add Campaign"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-ghost text-white/70"
            >
              Cancel
            </button>
          )}
        </div>

      </form>
      </GlassPanel>

      <GlassPanel className="overflow-x-auto">

        <table className="table eco-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Progress</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {campaignRows.map((campaign, index) => (
              <tr key={campaign._id}>

                <td>{index + 1}</td>

                <td>
                  <div className="font-semibold text-white/90">{campaign.title}</div>
                  <div className="text-xs eco-muted">
                    {campaign.startDate?.slice(0, 10)} → {campaign.endDate?.slice(0, 10)}
                  </div>
                </td>

                <td className="min-w-40">
                  <progress
                    className="progress progress-success w-full"
                    value={campaign.progress}
                    max="100"
                  ></progress>
                  <div className="text-xs eco-muted mt-1">
                    {campaign.currentWeight || 0} / {campaign.targetWeight} kg
                  </div>
                </td>

                <td>
                  <button
                    onClick={() => viewParticipants(campaign)}
                    className="btn btn-ghost btn-xs underline"
                  >
                    View
                  </button>
                </td>

                <td>
                  <span
                    className={`badge ${
                      campaign.status === "Active"
                        ? "badge-success"
                        : campaign.status === "Ended"
                        ? "badge-neutral"
                        : "badge-info"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </td>

                <td>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="btn btn-info btn-xs"
                    >
                      Edit
                    </button>

                    {campaign.status !== "Ended" && (
                      <button
                        onClick={() => toggleStatus(campaign)}
                        className="btn btn-warning btn-xs"
                      >
                        {campaign.status === "Active" ? "End" : "Start"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(campaign._id)}
                      className="btn btn-error btn-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>

              </tr>
            ))}

            {campaignRows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center eco-muted py-6">
                  No campaigns yet.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </GlassPanel>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4 text-white">
            Participants — {participantsFor?.title}
          </h3>

          <div className="overflow-x-auto max-h-96 overflow-y-auto eco-scrollbar">
            <table className="table table-sm eco-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Contribution</th>
                  <th>Sponsor</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.role}</td>
                    <td>{p.contributionKg || 0} kg</td>
                    <td>{p.isSponsor ? "Yes" : "—"}</td>
                  </tr>
                ))}

                {participants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center eco-muted py-4">
                      No participants yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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

export default Campaigns;
