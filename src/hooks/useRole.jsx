import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import axiosPublic from "../api/axiosPublic";

const useRole = () => {
  const { user } = useAuth();

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setRole("");
      setLoading(false);
      return;
    }

    setLoading(true);

    axiosPublic.get(`/users/${user.email}`)
      .then(res => {
        setRole(res.data?.role || "");
      })
      .catch(() => {
        setRole("");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  return [role, loading];
};

export default useRole;