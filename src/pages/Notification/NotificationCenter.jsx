import React, { useEffect, useMemo, useState } from "react";
import { FaBell } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import Swal from "sweetalert2";
import PageHeader from "../../components/ui/PageHeader";
import GlassPanel from "../../components/ui/GlassPanel";

const notificationTypes = [
  "SYSTEM",
  "OFFER",
  "COUNTER_OFFER",
  "PICKUP",
  "CAMPAIGN",
  "REWARD",
  "TRANSACTION",
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    recipient: "broadcast",
    title: "",
    message: "",
    type: "SYSTEM",
  });

  const loadNotifications = () => {
    axiosPublic
      .get("/notifications")
      .then((res) => setNotifications(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadNotifications();

    axiosPublic
      .get("/all-users")
      .then((res) => setUsers(res.data.filter((u) => u.uid)))
      .catch((err) => console.log(err));
  }, []);

  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase();

    return notifications.filter(
      (item) =>
        !term ||
        item.title?.toLowerCase().includes(term) ||
        item.message?.toLowerCase().includes(term)
    );
  }, [notifications, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      message: form.message,
      type: form.type,
    };

    if (form.recipient === "broadcast") {
      payload.broadcast = true;
    } else {
      payload.userId = form.recipient;
    }

    try {
      await axiosPublic.post("/notifications", payload);

      Swal.fire({
        icon: "success",
        title: "Notification Sent",
        timer: 1500,
        showConfirmButton: false,
      });

      setForm({ recipient: "broadcast", title: "", message: "", type: "SYSTEM" });
      loadNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete this notification?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    const res = await axiosPublic.delete(`/notifications/${id}`);

    if (res.data.deletedCount > 0) {
      Swal.fire({
        icon: "success",
        title: "Deleted Successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      loadNotifications();
    }
  };

  return (
    <div>

      <PageHeader title="Notification Center" subtitle="Broadcast or target a message to your users." icon={<FaBell />} />

      <GlassPanel className="mb-8 max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <div className="grid grid-cols-2 gap-4">

          <select
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            className="select select-bordered"
          >
            <option value="broadcast">All Users (Broadcast)</option>
            {users.map((u) => (
              <option key={u._id} value={u.uid}>{u.name} ({u.email})</option>
            ))}
          </select>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="select select-bordered"
          >
            {notificationTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

        </div>

        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input input-bordered w-full"
          placeholder="Notification Title"
          required
        />

        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="textarea textarea-bordered w-full"
          placeholder="Notification Message"
          required
        ></textarea>

        <button className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold">
          Send Notification
        </button>

      </form>
      </GlassPanel>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input input-bordered w-full md:w-72 mb-6"
        placeholder="Search by title or message"
      />

      <GlassPanel className="overflow-x-auto">

        <table className="table eco-table">

          <thead>

            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Message</th>
              <th>Type</th>
              <th>Read</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {filteredNotifications.map((item, index) => (
              <tr key={item._id}>

                <td>{index + 1}</td>
                <td>{item.title}</td>
                <td>{item.message}</td>
                <td><span className="badge badge-ghost badge-sm">{item.type}</span></td>
                <td>{item.isRead ? "✅" : "—"}</td>

                <td>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn btn-error btn-xs"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}

            {filteredNotifications.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center eco-muted py-6">
                  No notifications match your search.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </GlassPanel>

    </div>
  );
};

export default NotificationCenter;
