import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../hooks/useAuth";
import NotificationBell from "../../../components/NotificationBell";
import {
  FaRecycle,
  FaHome,
  FaTachometerAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaCog,
  FaSignOutAlt,
  FaBullhorn,
  FaBell,
} from "react-icons/fa";

const NavBar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutUser()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 eco-dark border-b border-emerald-500/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 group transition-all duration-300"
            >
              <div className="relative">
                <FaRecycle className="text-4xl text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-extrabold eco-gradient-text">
                  GreenLoop
                </span>
                <div className="text-xs eco-muted -mt-1 hidden md:block">
                  Recycle Smarter
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/" icon={<FaHome />} isActive={isActive("/")}>
                Home
              </NavLink>
              {user && (
                <NavLink
                  to="/campaigns"
                  icon={<FaBullhorn />}
                  isActive={isActive("/campaigns")}
                >
                  Campaigns
                </NavLink>
              )}
              <NavLink
                to="/dashboard"
                icon={<FaTachometerAlt />}
                isActive={isActive("/dashboard")}
              >
                Dashboard
              </NavLink>
            </div>

            {/* Right Section - Auth & Profile */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  {/* Profile Dropdown Trigger */}
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {(user.displayName || user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-left hidden xl:block">
                      <div className="font-semibold text-sm text-white/90">
                        {user.displayName || "User"}
                      </div>
                      <div className="text-xs eco-muted">
                        {user.email?.length > 20
                          ? user.email.substring(0, 20) + "..."
                          : user.email}
                      </div>
                    </div>
                    <FaChevronDown
                      className={`eco-muted transition-transform duration-300 ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        ></div>

                        {/* Dropdown Content */}
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-2 w-64 eco-glass-strong rounded-2xl py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-white/10">
                            <div className="font-semibold text-white/90">
                              {user.displayName || "User"}
                            </div>
                            <div className="text-sm eco-muted">
                              {user.email}
                            </div>
                          </div>

                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                          >
                            <FaUser className="text-emerald-400/80" />
                            <span className="text-white/80">My Profile</span>
                          </Link>

                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                          >
                            <FaCog className="text-emerald-400/80" />
                            <span className="text-white/80">Settings</span>
                          </Link>

                          <div className="border-t border-white/10 my-2"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 transition-colors text-rose-400"
                          >
                            <FaSignOutAlt />
                            <span className="font-semibold">Logout</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2.5 rounded-xl font-semibold text-white/80 hover:bg-white/5 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 rounded-xl font-semibold text-white eco-gradient-btn"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {user && <NotificationBell />}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-2xl text-white/80" />
              ) : (
                <FaBars className="text-2xl text-white/80" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Menu Content */}
        <div
          className={`absolute top-20 left-0 right-0 eco-glass-strong transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="px-4 py-6 space-y-1">
            <MobileNavLink
              to="/"
              icon={<FaHome />}
              isActive={isActive("/")}
            >
              Home
            </MobileNavLink>
            {user && (
              <MobileNavLink
                to="/campaigns"
                icon={<FaBullhorn />}
                isActive={isActive("/campaigns")}
              >
                Campaigns
              </MobileNavLink>
            )}
            <MobileNavLink
              to="/dashboard"
              icon={<FaTachometerAlt />}
              isActive={isActive("/dashboard")}
            >
              Dashboard
            </MobileNavLink>
            {user && (
              <MobileNavLink
                to="/notifications"
                icon={<FaBell />}
                isActive={isActive("/notifications")}
              >
                Notifications
              </MobileNavLink>
            )}

            {user ? (
              <>
                <div className="border-t border-white/10 my-4"></div>
                <div className="px-4 py-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white font-bold text-lg">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>
                          {(user.displayName || user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white/90">
                        {user.displayName || "User"}
                      </div>
                      <div className="text-sm eco-muted">{user.email}</div>
                    </div>
                  </div>
                </div>

                <MobileNavLink to="/profile" icon={<FaUser />}>
                  My Profile
                </MobileNavLink>
                <MobileNavLink to="/settings" icon={<FaCog />}>
                  Settings
                </MobileNavLink>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-white/10 my-4"></div>
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 rounded-xl text-center font-semibold text-white/80 hover:bg-white/5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-3 rounded-xl text-center font-semibold text-white eco-gradient-btn"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ to, icon, children, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
      isActive
        ? "eco-gradient-btn text-white"
        : "text-white/70 hover:bg-white/5"
    }`}
  >
    <span className={isActive ? "text-emerald-100" : "text-emerald-400/60"}>
      {icon}
    </span>
    <span>{children}</span>
  </Link>
);

// Mobile Navigation Link Component
const MobileNavLink = ({ to, icon, children, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
      isActive
        ? "eco-gradient-btn text-white"
        : "text-white/70 hover:bg-white/5"
    }`}
  >
    <span className={`text-xl ${isActive ? "text-emerald-100" : "text-emerald-400/60"}`}>
      {icon}
    </span>
    <span>{children}</span>
  </Link>
);

export default NavBar;
