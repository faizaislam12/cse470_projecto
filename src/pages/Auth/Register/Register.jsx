import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
import SocialLogin from "../SocialLogin/SocialLogin";
import axiosPublic from "../../../api/axiosPublic";
import Swal from "sweetalert2";
import { getAuthErrorMessage } from "../../../utils/firebaseErrors";

const Register = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { registerUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const handleRegistration = async (data) => {
    try {
      // Firebase Registration
      const result = await registerUser(data.email, data.password);

      const loggedUser = result.user;

      // Keep Firebase's displayName in sync with the name they entered.
      try {
        await updateUserProfile({ displayName: data.name });
      } catch (nameError) {
        console.log(nameError);
      }

      // User for MongoDB
      const userInfo = {
        uid: loggedUser.uid,
        name: data.name,
        email: loggedUser.email,
        role: data.role,
        status: "Active",
        createdAt: new Date(),
      };

      const res = await axiosPublic.post("/users", userInfo);

      if (res.data.insertedId || res.data.message === "User already exists") {
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "Welcome to GreenLoop!",
          timer: 1800,
          showConfirmButton: false,
        });

        reset();

        navigate("/");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: getAuthErrorMessage(error),
      });
    }
  };

  return (
    <div className="eco-glass w-full max-w-md mx-auto rounded-3xl">
      <h2 className="text-3xl font-bold text-center mt-8 text-white">
        Create Your Account
      </h2>
      <p className="text-center eco-muted text-sm mt-1">
        Join the recycling movement.
      </p>

      <form
        className="p-8"
        onSubmit={handleSubmit(handleRegistration)}
      >
        <fieldset className="fieldset space-y-1">

          {/* Name */}

          <label className="label">Full Name</label>

          <input
            type="text"
            className="input eco-input w-full"
            placeholder="Enter Your Name"
            {...register("name", {
              required: "Name is required",
            })}
          />

          {errors.name && (
            <p className="text-rose-400 text-sm">{errors.name.message}</p>
          )}

          {/* Email */}

          <label className="label mt-2">Email</label>

          <input
            type="email"
            className="input eco-input w-full"
            placeholder="Enter Email"
            {...register("email", {
              required: "Email is required",
            })}
          />

          {errors.email && (
            <p className="text-rose-400 text-sm">{errors.email.message}</p>
          )}

          {/* Role */}

          <label className="label mt-2">Select Role</label>

          <select
            className="select eco-input w-full"
            defaultValue=""
            {...register("role", {
              required: "Role is required",
            })}
          >
            <option value="" disabled>
              Select Role
            </option>

            <option value="Household">
              Household
            </option>

            <option value="Collector">
              Collector
            </option>

            <option value="Business">
              Business
            </option>

            <option value="Company">
              Recycling Company
            </option>
          </select>

          {errors.role && (
            <p className="text-rose-400 text-sm">{errors.role.message}</p>
          )}

          {/* Password */}

          <label className="label mt-2">Password</label>

          <input
            type="password"
            className="input eco-input w-full"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          {errors.password && (
            <p className="text-rose-400 text-sm">{errors.password.message}</p>
          )}

          <button className="w-full text-white rounded-xl py-3 mt-5 font-semibold eco-gradient-btn">
            Register
          </button>

          <p className="mt-4 text-center eco-muted">
            Already have an account?{" "}
            <Link
              className="text-emerald-400 font-semibold hover:text-emerald-300"
              to="/login"
            >
              Login
            </Link>
          </p>

        </fieldset>
      </form>

      <SocialLogin />
    </div>
  );
};

export default Register;