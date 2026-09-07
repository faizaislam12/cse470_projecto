import React from "react";
import { motion } from "framer-motion";

// A single stylised leaf silhouette, reused at different sizes/colors.
const Leaf = ({ className, style, fill }) => (
  <svg viewBox="0 0 64 64" className={className} style={style} fill="none">
    <path
      d="M32 4C14 4 4 20 4 34c0 16 12 26 28 26s28-10 28-26C60 20 50 4 32 4Z"
      fill={fill}
    />
    <path
      d="M32 8v50"
      stroke="rgba(0,0,0,0.15)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const leaves = [
  { top: "6%", left: "4%", size: 34, delay: 0, duration: 9, fill: "#34d399", dx: 28, dy: -22, rot: 25, opacity: 0.4 },
  { top: "14%", left: "92%", size: 42, delay: 1.2, duration: 11, fill: "#10b981", dx: -24, dy: 28, rot: -28, opacity: 0.35 },
  { top: "46%", left: "1%", size: 26, delay: 2.4, duration: 8, fill: "#6ee7b7", dx: 20, dy: 24, rot: 18, opacity: 0.3 },
  { top: "70%", left: "95%", size: 32, delay: 0.6, duration: 10, fill: "#059669", dx: -26, dy: -20, rot: -22, opacity: 0.35 },
  { top: "88%", left: "8%", size: 24, delay: 3, duration: 9, fill: "#34d399", dx: 22, dy: -26, rot: 26, opacity: 0.28 },
  { top: "4%", left: "48%", size: 20, delay: 1.8, duration: 12, fill: "#a7f3d0", dx: -16, dy: 22, rot: -16, opacity: 0.22 },
  { top: "92%", left: "50%", size: 22, delay: 4.2, duration: 10.5, fill: "#6ee7b7", dx: 18, dy: -20, rot: 20, opacity: 0.25 },
];

/**
 * Decorative, non-interactive floating leaves for glassy dark backgrounds.
 * Absolutely positioned within the nearest `relative` ancestor.
 */
const FloatingLeaves = ({ className = "" }) => (
  <div
    className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    aria-hidden="true"
  >
    {leaves.map((leaf, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ top: leaf.top, left: leaf.left, opacity: leaf.opacity }}
        animate={{
          x: [0, leaf.dx, 0],
          y: [0, leaf.dy, 0],
          rotate: [0, leaf.rot, 0],
        }}
        transition={{
          duration: leaf.duration,
          delay: leaf.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Leaf
          className="drop-shadow-lg"
          fill={leaf.fill}
          style={{ width: leaf.size, height: leaf.size }}
        />
      </motion.div>
    ))}
  </div>
);

export default FloatingLeaves;
