
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8082",
});

// Attach JWT token to protected API requests
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      "/students/login",
      "/students/set-initial-password",
      "/staff/login",
    ];

    const isPublicEndpoint = publicEndpoints.includes(config.url);

    if (!isPublicEndpoint) {
      const token = sessionStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
