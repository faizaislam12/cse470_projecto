import axios from "axios";

const axiosPublic = axios.create({
  baseURL: "http://localhost:3000",
});

export default axiosPublic;