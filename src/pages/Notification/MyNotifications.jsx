import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import useAuth from "../../hooks/useAuth";
import { timeAgo } from "../../utils/timeAgo";
import PageHeader from "../../components/ui/PageHeader";
import FloatingLeaves from "../../components/FloatingLeaves";

const typeIcons = {
  OFFER: "🔔",
  COUNTER_OFFER: "🔔",
  PICKUP: "🚛",
  CAMPAIGN: "📢",
  REWARD: "🌟",
  TRANSACTION: "💰",
  SYSTEM: "⚙️",
};

const MyNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user?.uid) return;

    axiosPublic
      .get(`/notifications/user/${user.uid}`)
      .then((res) => setNotifications(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAsRead = async (id) => {
    await axiosPublic.patch(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await axiosPublic.patch(`/notifications/read-all/${user.uid}`);
    load();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="eco-dark flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  return (
    <div className="eco-dark relative min-h-screen overflow-hidden">
      <FloatingLeaves />

      <div className="max-w-2xl mx-auto p-6 relative z-10">

        <div className="flex justify-between items-center mb-8">
          <PageHeader title="Notification Center" icon={<FaBell />} />

          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-sm btn-outline text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/10">
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-2">

          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.button
                key={n._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`w-full text-left rounded-2xl border p-4 flex items-start gap-3 transition-colors ${
                  n.isRead
                    ? "eco-glass border-white/5"
                    : "bg-emerald-500/10 border-emerald-400/30"
                }`}
              >
                <span className="text-xl mt-0.5">
                  {n.isRead ? "⚪" : "🔵"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[n.type] || "🔔"}</span>
                    <span className="font-semibold text-white/90">{n.title}</span>
                  </div>
                  <p className="text-sm eco-muted">{n.message}</p>
                  <p className="text-xs text-emerald-400/50 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {notifications.length === 0 && (
            <p className="text-center eco-muted py-16">
              No notifications yet.
            </p>
          )}

        </div>

      </div>
    </div>
  );
};

export default MyNotifications;
