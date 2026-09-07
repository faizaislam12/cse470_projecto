import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaBullhorn } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";
import PageHeader from "../../components/ui/PageHeader";
import FloatingLeaves from "../../components/FloatingLeaves";

const CampaignsPublic = () => {
  const { user } = useAuth();
  const [role] = useRole();
  const [campaigns, setCampaigns] = useState([]);
  const [participantsByCampaign, setParticipantsByCampaign] = useState({});
  const [sponsorFlags, setSponsorFlags] = useState({});
  const [contributionInputs, setContributionInputs] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const res = await axiosPublic.get("/campaigns");
      setCampaigns(res.data);

      const entries = await Promise.all(
        res.data.map(async (c) => {
          const pRes = await axiosPublic.get(`/campaigns/${c._id}/participants`);
          return [c._id, pRes.data];
        })
      );

      setParticipantsByCampaign(Object.fromEntries(entries));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const myParticipation = (campaignId) =>
    (participantsByCampaign[campaignId] || []).find(
      (p) => p.userId === user?.uid
    );

  const handleJoin = async (campaign) => {
    try {
      await axiosPublic.post(`/campaigns/${campaign._id}/join`, {
        userId: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        role,
        isSponsor: role === "Business" && !!sponsorFlags[campaign._id],
      });

      Swal.fire({
        icon: "success",
        title: `Joined ${campaign.title}`,
        timer: 1500,
        showConfirmButton: false,
      });

      loadAll();
    } catch (error) {
      console.log(error);
    }
  };

  const handleLeave = async (campaign) => {
    await axiosPublic.post(`/campaigns/${campaign._id}/leave`, {
      userId: user.uid,
    });

    Swal.fire({
      icon: "success",
      title: `Left ${campaign.title}`,
      timer: 1500,
      showConfirmButton: false,
    });

    loadAll();
  };

  const handleContribute = async (campaign) => {
    const weightKg = Number(contributionInputs[campaign._id]);

    if (!weightKg || weightKg <= 0) return;

    await axiosPublic.patch(`/campaigns/${campaign._id}/contribute`, {
      userId: user.uid,
      weightKg,
    });

    Swal.fire({
      icon: "success",
      title: "Contribution Logged",
      text: `Thanks for contributing ${weightKg} kg!`,
      timer: 1500,
      showConfirmButton: false,
    });

    setContributionInputs({ ...contributionInputs, [campaign._id]: "" });
    loadAll();
  };

  if (loading) {
    return (
      <div className="eco-dark flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  return (
    <div className="eco-dark relative min-h-screen overflow-hidden">
      <FloatingLeaves />

      <div className="max-w-6xl mx-auto p-6 relative z-10">

        <PageHeader title="Community Recycling Campaigns" subtitle="Join a campaign and track your impact." icon={<FaBullhorn />} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {campaigns.map((campaign, index) => {
            const participants = participantsByCampaign[campaign._id] || [];
            const mine = myParticipation(campaign._id);
            const progress = campaign.targetWeight
              ? Math.min(
                  100,
                  Math.round((campaign.currentWeight / campaign.targetWeight) * 100)
                )
              : 0;

            return (
              <motion.div
                key={campaign._id}
                className="eco-glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
                whileHover={{ y: -3 }}
              >

                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-white/90">{campaign.title}</h2>
                  <span
                    className={`badge ${
                      campaign.status === "Active"
                        ? "badge-success"
                        : campaign.status === "Ended"
                        ? "badge-neutral"
                        : "badge-info"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <p className="eco-muted text-sm mt-1">{campaign.description}</p>

                <p className="text-xs text-emerald-400/50 mt-1">
                  {campaign.startDate?.slice(0, 10)} → {campaign.endDate?.slice(0, 10)}
                </p>

                <progress
                  className="progress progress-success w-full mt-3"
                  value={progress}
                  max="100"
                ></progress>

                <div className="flex justify-between text-xs eco-muted">
                  <span>{campaign.currentWeight || 0} / {campaign.targetWeight} kg</span>
                  <span>{participants.length} participants</span>
                </div>

                {mine && (
                  <div className="mt-2 text-sm text-emerald-400 font-semibold">
                    Your contribution: {mine.contributionKg || 0} kg
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">

                  {mine ? (
                    <button
                      onClick={() => handleLeave(campaign)}
                      className="btn btn-outline btn-error btn-sm"
                    >
                      Leave
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {role === "Business" && (
                        <label className="label cursor-pointer gap-1">
                          <input
                            type="checkbox"
                            checked={!!sponsorFlags[campaign._id]}
                            onChange={(e) =>
                              setSponsorFlags({
                                ...sponsorFlags,
                                [campaign._id]: e.target.checked,
                              })
                            }
                            className="checkbox checkbox-sm"
                          />
                          <span className="label-text text-xs eco-muted">Sponsor</span>
                        </label>
                      )}
                      <button
                        onClick={() => handleJoin(campaign)}
                        className="eco-gradient-btn text-white rounded-lg px-4 py-2 text-sm font-semibold"
                      >
                        Join
                      </button>
                    </div>
                  )}

                  {mine && (
                    <div className="flex gap-2">
                      <input
                        value={contributionInputs[campaign._id] || ""}
                        onChange={(e) =>
                          setContributionInputs({
                            ...contributionInputs,
                            [campaign._id]: e.target.value,
                          })
                        }
                        type="number"
                        placeholder="kg"
                        className="input input-bordered input-sm w-20"
                      />
                      <button
                        onClick={() => handleContribute(campaign)}
                        className="btn btn-sm bg-sky-600 hover:bg-sky-500 border-none text-white"
                      >
                        Log Contribution
                      </button>
                    </div>
                  )}

                </div>

              </motion.div>
            );
          })}

          {campaigns.length === 0 && (
            <p className="text-center eco-muted col-span-2 py-16">
              No campaigns yet — check back soon!
            </p>
          )}

        </div>

      </div>
    </div>
  );
};

export default CampaignsPublic;
