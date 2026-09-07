import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { FaBuilding } from "react-icons/fa";
import axiosPublic from "../../api/axiosPublic";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/ui/PageHeader";
import GlassPanel from "../../components/ui/GlassPanel";

const businessTypes = ["Retail", "Manufacturing", "Restaurant", "Office", "Other"];

const AddBusiness = () => {
  const { user } = useAuth();
  const { register, handleSubmit, setValue } = useForm();
  const [businessId, setBusinessId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    axiosPublic
      .get(`/businesses/user/${user.uid}`)
      .then((res) => {
        if (res.data) {
          setBusinessId(res.data._id);
          setStatus(res.data.status);
          setValue("businessName", res.data.businessName);
          setValue("businessType", res.data.businessType);
          setValue("phone", res.data.phone);
          setValue("address", res.data.address);
          setValue("logo", res.data.logo);
          setValue("description", res.data.description);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      if (businessId) {
        await axiosPublic.patch(`/businesses/profile/${businessId}`, data);

        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const businessData = {
          ...data,
          userId: user.uid,
          email: user.email,
        };

        const res = await axiosPublic.post("/businesses", businessData);

        setBusinessId(res.data.insertedId);
        setStatus("Pending");

        Swal.fire({
          icon: "success",
          title: "Business Registered",
          text: "Your profile is pending admin approval.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({ icon: "error", title: "Something went wrong" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-emerald-400"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      <PageHeader
        title={businessId ? "Edit Business Profile" : "Register Business"}
        subtitle={
          businessId
            ? "Update your business details below."
            : "Set up your business profile to start participating in GreenLoop."
        }
        icon={<FaBuilding />}
      />

      {status && status !== "Approved" && (
        <div className="eco-glass rounded-xl px-5 py-3 mb-6 text-amber-300 text-sm">
          Your business status is currently <b>{status}</b>.
        </div>
      )}

      <GlassPanel>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

          <input
            {...register("businessName", { required: true })}
            className="input input-bordered w-full"
            placeholder="Business Name"
          />

          <select
            {...register("businessType", { required: true })}
            className="select select-bordered w-full"
            defaultValue=""
          >
            <option value="" disabled>Select Business Type</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <input
            {...register("phone")}
            className="input input-bordered w-full"
            placeholder="Phone"
          />

          <input
            {...register("address")}
            className="input input-bordered w-full"
            placeholder="Business Address"
          />

          <input
            {...register("logo")}
            className="input input-bordered w-full"
            placeholder="Logo Image URL (optional)"
          />

          <textarea
            {...register("description")}
            className="textarea textarea-bordered w-full"
            placeholder="Description"
          ></textarea>

          <button className="eco-gradient-btn text-white rounded-xl px-6 py-3 font-semibold">
            {businessId ? "Save Changes" : "Register Business"}
          </button>

        </form>
      </GlassPanel>

    </div>
  );
};

export default AddBusiness;
