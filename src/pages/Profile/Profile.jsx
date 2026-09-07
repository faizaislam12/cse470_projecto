import React, { useState } from "react";
import Swal from "sweetalert2";
import { FaUser } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";
import axiosPublic from "../../api/axiosPublic";
import { getAuthErrorMessage } from "../../utils/firebaseErrors";
import PageHeader from "../../components/ui/PageHeader";
import GlassPanel from "../../components/ui/GlassPanel";
import FloatingLeaves from "../../components/FloatingLeaves";

const roleBadgeColor = {
  Admin: "badge-error",
  Business: "badge-info",
  Collector: "badge-warning",
  Household: "badge-success",
  Company: "badge-secondary",
};

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [role, roleLoading] = useRole();
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    setSaving(true);

    try {
      await updateUserProfile({ displayName: name.trim() });

      // Keep the Mongo profile document in sync with the Firebase name.
      try {
        const res = await axiosPublic.get(`/users/${user.email}`);
        if (res.data?._id) {
          await axiosPublic.patch(`/users/name/${res.data._id}`, {
            name: name.trim(),
          });
        }
      } catch (syncError) {
        console.log(syncError);
      }

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        timer: 1500,
        showConfirmButton: false,
      });
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

  return (
    <div className="eco-dark relative min-h-screen overflow-hidden">
      <FloatingLeaves />

      <div className="max-w-2xl mx-auto p-6 relative z-10">

        <PageHeader title="My Profile" icon={<FaUser />} />

        <GlassPanel>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {(user?.displayName || user?.email || "?")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <p className="text-xl font-semibold text-white/90">
                {user?.displayName || "Unnamed User"}
              </p>
              <p className="eco-muted">{user?.email}</p>

              {!roleLoading && role && (
                <span
                  className={`badge ${roleBadgeColor[role] || "badge-neutral"} mt-2`}
                >
                  {role}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="eco-glass rounded-xl p-4">
              <div className="text-xs eco-muted uppercase tracking-wide">Member Since</div>
              <div className="text-lg font-bold text-white mt-1">{memberSince}</div>
            </div>

            <div className="eco-glass rounded-xl p-4">
              <div className="text-xs eco-muted uppercase tracking-wide">Account Type</div>
              <div className="text-lg font-bold text-white mt-1">{role || "—"}</div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">

            <div>
              <label className="label">
                <span className="label-text font-semibold">
                  Display Name
                </span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                value={user?.email || ""}
                disabled
                className="input input-bordered w-full opacity-60"
              />
              <p className="text-xs eco-muted mt-1">
                Email address cannot be changed here.
              </p>
            </div>

            <button
              className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>

        </GlassPanel>

      </div>
    </div>
  );
};

export default Profile;
