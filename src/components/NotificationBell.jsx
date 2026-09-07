import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { FaBell } from "react-icons/fa";
import axiosPublic from "../api/axiosPublic";
import useAuth from "../hooks/useAuth";
import { timeAgo } from "../utils/timeAgo";

const NotificationBell = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    axiosPublic
      .get(`/notifications/user/${user.uid}`)
      .then((res) => setNotifications(res.data))
      .catch((err) => console.log(err));
    // Refetch whenever the route changes so the badge stays fresh without
    // needing a websocket connection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]);

  if (!user) return null;

  const unread = notifications.filter((n) => !n.isRead).length;
  const latest = notifications.slice(0, 5);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-11 h-11 flex items-center justify-center rounded-full eco-glass hover:border-emerald-400/50 hover:text-emerald-300 transition-colors"
      >
        <FaBell className="text-lg text-emerald-300/80" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            ></div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 mt-2 w-80 eco-glass-strong rounded-2xl py-2 z-50 eco-scrollbar"
            >
              <div className="px-4 py-2 font-semibold border-b border-white/10 text-white/90">
                Notifications
              </div>

              {latest.length === 0 && (
                <p className="px-4 py-6 text-center eco-muted text-sm">
                  No notifications yet.
                </p>
              )}

              {latest.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-white/5 ${
                    n.isRead ? "" : "bg-emerald-500/10"
                  }`}
                >
                  <p className="font-medium text-sm text-white/90">{n.title}</p>
                  <p className="text-xs eco-muted">{n.message}</p>
                  <p className="text-xs text-emerald-400/50 mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              ))}

              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-semibold text-emerald-400 py-2 hover:bg-white/5"
              >
                View All
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
