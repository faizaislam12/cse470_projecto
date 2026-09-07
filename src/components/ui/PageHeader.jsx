import React from "react";
import { motion } from "framer-motion";

const PageHeader = ({ title, subtitle, icon }) => (
  <motion.div
    className="mb-8 flex items-center gap-3"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {icon && (
      <span className="text-3xl text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
        {icon}
      </span>
    )}
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold eco-gradient-text">
        {title}
      </h1>
      {subtitle && (
        <p className="eco-muted text-sm mt-1">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

export default PageHeader;
