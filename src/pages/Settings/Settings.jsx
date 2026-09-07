import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { FaCog } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { getAuthErrorMessage } from "../../utils/firebaseErrors";
import PageHeader from "../../components/ui/PageHeader";
import GlassPanel from "../../components/ui/GlassPanel";
import FloatingLeaves from "../../components/FloatingLeaves";

const Settings = () => {
  const { user, changeUserPassword, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const isGoogleUser = user?.providerData?.some(
    (p) => p.providerId === "google.com"
  );

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password too short",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords don't match",
      });
      return;
    }

    setSaving(true);

    try {
      await changeUserPassword(newPassword);

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        timer: 1500,
        showConfirmButton: false,
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: getAuthErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser()
      .then(() => navigate("/"))
      .catch((error) => console.log(error));
  };

  return (
    <div className="eco-dark relative min-h-screen overflow-hidden">
      <FloatingLeaves />

      <div className="max-w-2xl mx-auto p-6 relative z-10 space-y-6">

        <PageHeader title="Settings" icon={<FaCog />} />

        <GlassPanel>
          <h2 className="text-lg font-bold text-white/90 mb-1">Account</h2>
          <p className="eco-muted">{user?.email}</p>
        </GlassPanel>

        <GlassPanel delay={0.05}>
          <h2 className="text-lg font-bold text-white/90 mb-3">Change Password</h2>

          {isGoogleUser ? (
            <p className="eco-muted">
              You signed in with Google, so your password is managed by
              Google — there's nothing to change here.
            </p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    New Password
                  </span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Confirm New Password
                  </span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Re-enter new password"
                />
              </div>

              <button className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-60" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </button>

            </form>
          )}
        </GlassPanel>

        <GlassPanel delay={0.1} className="border border-rose-500/20">
          <h2 className="text-lg font-bold text-rose-400 mb-1">Session</h2>
          <p className="eco-muted mb-3">
            Sign out of GreenLoop on this device.
          </p>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-error w-fit"
          >
            Logout
          </button>
        </GlassPanel>

      </div>
    </div>
  );
};

export default Settings;
