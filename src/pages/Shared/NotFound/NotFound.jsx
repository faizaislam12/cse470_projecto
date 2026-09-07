import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FaLeaf } from "react-icons/fa";
import FloatingLeaves from "../../../components/FloatingLeaves";

const NotFound = () => {
  return (
    <div className="eco-dark relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      <FloatingLeaves />

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FaLeaf className="text-5xl text-emerald-400 mx-auto mb-4" />
        <h1 className="text-7xl font-extrabold eco-gradient-text mb-4">404</h1>
        <p className="text-xl eco-muted mb-8">
          This page seems to have blown away with the leaves.
        </p>
        <Link to="/" className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold inline-block">
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
