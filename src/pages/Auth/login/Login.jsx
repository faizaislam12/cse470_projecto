import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import axiosPublic from "../../../api/axiosPublic";
import useAuth from "../../../hooks/useAuth";
import SocialLogin from "../SocialLogin/SocialLogin";
import { getAuthErrorMessage } from "../../../utils/firebaseErrors";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signInUser } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (data) => {
    try {
      // Firebase Login
      const result = await signInUser(data.email, data.password);

      // Best-effort profile lookup just for the welcome message — a
      // failure here shouldn't block a successful login from proceeding.
      let currentUser;
      try {
        const res = await axiosPublic.get("/users");
        currentUser = res.data.find(
          (user) => user.email === result.user.email
        );
      } catch (lookupError) {
        console.log(lookupError);
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome ${currentUser?.name || ""}`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(from, { replace: true });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: getAuthErrorMessage(error),
      });
    }
  };

  return (
    <div className="eco-glass w-full max-w-md mx-auto rounded-3xl">

      <h2 className="text-3xl font-bold text-center mt-8 text-white">
        Welcome Back
      </h2>
      <p className="text-center eco-muted text-sm mt-1">
        Log in to continue recycling smarter.
      </p>

      <form
        className="p-8"
        onSubmit={handleSubmit(handleLogin)}
      >
        <fieldset className="fieldset space-y-1">

          {/* Email */}

          <label className="label">
            Email
          </label>

          <input
            type="email"
            className="input eco-input w-full"
            placeholder="Enter Email"
            {...register("email", {
              required: "Email is required",
            })}
          />

          {errors.email && (
            <p className="text-rose-400 text-sm">
              {errors.email.message}
            </p>
          )}

          {/* Password */}

          <label className="label mt-2">
            Password
          </label>

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
            <p className="text-rose-400 text-sm">
              {errors.password.message}
            </p>
          )}

          <button className="w-full text-white rounded-xl py-3 mt-5 font-semibold eco-gradient-btn">
            Login
          </button>

          <p className="mt-4 text-center eco-muted">
            New to GreenLoop?{" "}
            <Link
              className="text-emerald-400 font-semibold hover:text-emerald-300"
              to="/register"
            >
              Register
            </Link>
          </p>

        </fieldset>
      </form>

      <SocialLogin />
    </div>
  );
};

export default Login;