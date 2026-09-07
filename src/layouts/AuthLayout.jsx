import React from "react";
import { Outlet, Link } from "react-router";
import { motion } from "framer-motion";
import { FaRecycle } from "react-icons/fa";
import authImage from "../assets/1.png";
import FloatingLeaves from "../components/FloatingLeaves";

const AuthLayout = () => {
  return (
    <div className="eco-dark relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10">
      <FloatingLeaves />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link to="/" className="flex items-center gap-2 justify-center lg:justify-start mb-6">
            <FaRecycle className="text-3xl text-emerald-400" />
            <span className="text-2xl font-extrabold eco-gradient-text">
              GreenLoop
            </span>
          </Link>

          <Outlet />
        </motion.div>

        <motion.div
          className="hidden lg:flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <div className="eco-glass rounded-3xl p-6">
            <img src={authImage} alt="" className="rounded-2xl max-w-sm" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AuthLayout;
