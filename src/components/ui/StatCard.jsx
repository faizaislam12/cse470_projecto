import React from "react";
import { motion } from "framer-motion";

const accentMap = {
  emerald: { icon: "text-emerald-300", ring: "group-hover:shadow-emerald-500/20" },
  blue: { icon: "text-sky-300", ring: "group-hover:shadow-sky-500/20" },
  amber: { icon: "text-amber-300", ring: "group-hover:shadow-amber-500/20" },
  rose: { icon: "text-rose-300", ring: "group-hover:shadow-rose-500/20" },
  violet: { icon: "text-violet-300", ring: "group-hover:shadow-violet-500/20" },
  cyan: { icon: "text-cyan-300", ring: "group-hover:shadow-cyan-500/20" },
};

/**
 * A glassy, dark-themed stat tile with a subtle icon watermark and a
 * fade-up entrance. Used across every Member 4 dashboard page.
 */
const StatCard = ({ label, value, sub, icon, accent = "emerald", delay = 0 }) => {
  const colors = accentMap[accent] || accentMap.emerald;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl eco-glass p-5 transition-shadow duration-300 hover:shadow-xl ${colors.ring}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      {icon && (
        <div className={`absolute -right-3 -top-3 text-6xl opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 ${colors.icon}`}>
          {icon}
        </div>
      )}

      <h2 className="relative z-10 text-xs font-semibold uppercase tracking-wider eco-muted">
        {label}
      </h2>

      <p className="relative z-10 text-3xl font-bold text-white mt-2">
        {value}
      </p>

      {sub && (
        <p className="relative z-10 text-xs eco-muted mt-1">{sub}</p>
      )}
    </motion.div>
  );
};

export default StatCard;
