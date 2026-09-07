import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  FaRecycle,
  FaTruck,
  FaChartLine,
  FaLeaf,
  FaUsers,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
  FaAward,
} from "react-icons/fa";
import FloatingLeaves from "../../../components/FloatingLeaves";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const Home = () => {
  return (
    <div className="w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800 text-white py-32 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        <FloatingLeaves />

        <motion.div
          className="max-w-7xl mx-auto text-center relative z-10"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
          >
            🌱 Join 50,000+ eco-conscious users
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            Smart Recycling Starts with{" "}
            <span className="text-yellow-300 inline-block animate-bounce">
              GreenLoop
            </span>
            <span className="text-6xl ml-2">♻️</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-xl md:text-2xl max-w-4xl mx-auto mb-10 text-green-50 leading-relaxed"
          >
            Connect households, collectors, and businesses in one powerful
            recycling marketplace. Earn rewards, track impact, and build a
            greener future together.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          >
            <Link
              to="/register"
              className="group bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-green-800 transition-all duration-300 shadow-2xl hover:shadow-yellow-300/50 hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 backdrop-blur-sm">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
          >
            <StatCard number="50K+" label="Active Users" />
            <StatCard number="2.5M+" label="Kg Recycled" />
            <StatCard number="150+" label="Partner Companies" />
            <StatCard number="98%" label="Satisfaction Rate" />
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="eco-dark relative py-24 px-6 overflow-hidden">
        <FloatingLeaves />

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionIntro
            badge="✨ PLATFORM FEATURES"
            title="Everything You Need to"
            highlight="Recycle Smarter"
            subtitle="Powerful tools designed to make recycling effortless and rewarding"
          />

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <FeatureCard
              icon={<FaRecycle size={40} />}
              title="Waste Marketplace"
              description="List recyclable materials and receive competitive offers from verified collectors in real-time."
            />
            <FeatureCard
              icon={<FaTruck size={40} />}
              title="Smart Pickup Scheduling"
              description="Schedule and track pickups with live GPS tracking and instant notifications."
            />
            <FeatureCard
              icon={<FaChartLine size={40} />}
              title="Market Price Dashboard"
              description="Access real-time recycling market analytics and price trends to maximize your returns."
            />
            <FeatureCard
              icon={<FaLeaf size={40} />}
              title="EcoPoints Rewards"
              description="Earn points for every recycling action and redeem for exclusive rewards and discounts."
            />
            <FeatureCard
              icon={<FaUsers size={40} />}
              title="Community Campaigns"
              description="Join local sustainability drives, compete on leaderboards, and make a collective impact."
            />
            <FeatureCard
              icon={<FaBuilding size={40} />}
              title="Business Solutions"
              description="Enterprise-grade tools for bulk recycling with compliance certificates and reporting."
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="eco-dark py-24 px-6 border-t border-emerald-500/10">
        <div className="max-w-7xl mx-auto">
          <SectionIntro
            badge="🚀 SIMPLE PROCESS"
            title="How GreenLoop Works"
          />

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <StepCard number="01" title="Sign Up" description="Create your free account in under 2 minutes" icon={<FaUsers />} />
            <StepCard number="02" title="List Items" description="Post your recyclable materials with photos" icon={<FaRecycle />} />
            <StepCard number="03" title="Get Offers" description="Receive competitive bids from collectors" icon={<FaChartLine />} />
            <StepCard number="04" title="Earn Rewards" description="Get paid and earn EcoPoints instantly" icon={<FaAward />} />
          </motion.div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section className="eco-dark relative py-24 px-6 border-t border-emerald-500/10 overflow-hidden">
        <FloatingLeaves />

        <div className="max-w-7xl mx-auto relative z-10">
          <SectionIntro
            badge="👥 FOR EVERYONE"
            title="Built for Every Stakeholder"
            subtitle="Tailored solutions for each role in the recycling ecosystem"
          />

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <RoleCard
              emoji="🏠"
              title="Households"
              features={["Easy waste listing", "Doorstep pickup", "Instant payments", "Reward points"]}
            />
            <RoleCard
              emoji="🚛"
              title="Collectors"
              features={["Route optimization", "Bulk purchasing", "Payment gateway", "Customer management"]}
            />
            <RoleCard
              emoji="🏭"
              title="Recycling Companies"
              features={["Material sourcing", "Quality assurance", "Analytics dashboard", "Supplier network"]}
            />
            <RoleCard
              emoji="🏢"
              title="Businesses"
              features={["CSR compliance", "Bulk contracts", "Carbon credits", "Impact reports"]}
            />
          </motion.div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="py-24 px-6 bg-gradient-to-r from-green-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Make a Real Environmental Impact 🌍
              </h2>
              <p className="text-xl mb-8 text-green-50">
                Every item you recycle through GreenLoop contributes to a
                healthier planet. Track your personal impact and see the
                difference you're making.
              </p>
              <div className="space-y-4">
                <ImpactItem icon={<FaCheckCircle />} text="Reduce landfill waste by up to 80%" />
                <ImpactItem icon={<FaCheckCircle />} text="Lower carbon emissions significantly" />
                <ImpactItem icon={<FaCheckCircle />} text="Support circular economy initiatives" />
                <ImpactItem icon={<FaCheckCircle />} text="Earn while protecting the environment" />
              </div>
            </motion.div>

            <motion.div
              className="eco-glass-strong rounded-2xl p-8"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold mb-6">
                Your Potential Monthly Impact
              </h3>
              <div className="space-y-6">
                <ImpactMetric label="CO₂ Saved" value="125 kg" />
                <ImpactMetric label="Trees Equivalent" value="6 trees" />
                <ImpactMetric label="Water Saved" value="3,500 L" />
                <ImpactMetric label="EcoPoints Earned" value="850 pts" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="eco-dark py-24 px-6 text-center relative overflow-hidden border-t border-emerald-500/10">
        <FloatingLeaves />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          className="max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold">
            🎉 LIMITED TIME OFFER
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">
            Join the Green Revolution Today! 🌍
          </h2>
          <p className="mb-10 text-xl eco-muted max-w-2xl mx-auto">
            Start recycling smarter, earn rewards, and become part of a
            community committed to sustainable living.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 flex items-center justify-center gap-2"
            >
              Create Free Account
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-white/70 px-10 py-5 rounded-xl font-bold text-lg text-white hover:bg-white hover:text-green-900 transition-all duration-300">
              Schedule a Demo
            </button>
          </div>
          <p className="mt-6 text-sm eco-muted">
            ✓ No credit card required ✓ 500 EcoPoints welcome bonus ✓ Cancel
            anytime
          </p>
        </motion.div>
      </section>

    </div>
  );
};

// COMPONENT: SectionIntro
const SectionIntro = ({ badge, title, highlight, subtitle }) => (
  <motion.div variants={fadeUp} className="text-center mb-16">
    <div className="inline-block px-4 py-2 eco-glass rounded-full text-sm font-semibold mb-4 text-emerald-300">
      {badge}
    </div>
    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
      {title}{" "}
      {highlight && <span className="eco-gradient-text">{highlight}</span>}
    </h2>
    {subtitle && (
      <p className="text-xl eco-muted max-w-2xl mx-auto">{subtitle}</p>
    )}
  </motion.div>
);

// COMPONENT: StatCard
const StatCard = ({ number, label }) => (
  <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
    <div className="text-3xl md:text-4xl font-extrabold text-yellow-300 mb-1">
      {number}
    </div>
    <div className="text-sm text-green-50">{label}</div>
  </div>
);

// COMPONENT: FeatureCard
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -6 }}
    className="group eco-glass rounded-2xl p-8 transition-shadow duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
  >
    <div className="inline-flex p-4 rounded-xl eco-gradient-btn text-white mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
    <p className="eco-muted leading-relaxed">{description}</p>
  </motion.div>
);

// COMPONENT: StepCard
const StepCard = ({ number, title, description, icon }) => (
  <motion.div variants={fadeUp} className="relative text-center group">
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-black text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
      {number}
    </div>
    <div className="relative eco-glass rounded-2xl p-8 transition-all duration-300 hover:shadow-xl">
      <div className="text-4xl text-emerald-400 mb-4 relative z-10">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="eco-muted text-sm">{description}</p>
    </div>
  </motion.div>
);

// COMPONENT: RoleCard
const RoleCard = ({ emoji, title, features }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -6 }}
    className="group eco-glass rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
  >
    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
      {emoji}
    </div>
    <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 eco-muted">
          <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

// COMPONENT: ImpactItem
const ImpactItem = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="text-yellow-300 text-xl flex-shrink-0">{icon}</div>
    <p className="text-lg">{text}</p>
  </div>
);

// COMPONENT: ImpactMetric
const ImpactMetric = ({ label, value }) => (
  <div className="flex justify-between items-center pb-4 border-b border-white/20">
    <span className="text-green-100">{label}</span>
    <span className="text-2xl font-bold text-yellow-300">{value}</span>
  </div>
);

export default Home;
