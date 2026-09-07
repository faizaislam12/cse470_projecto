import React from "react";
import { motion } from "framer-motion";

/**
 * A glassy dark panel used to wrap forms, tables, and modals-worth of
 * content throughout the dashboard.
 */
const GlassPanel = ({ children, className = "", delay = 0, as: Tag = "div" }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
  >
    <Tag className={`eco-glass rounded-2xl p-6 ${className}`}>
      {children}
    </Tag>
  </motion.div>
);

export default GlassPanel;
