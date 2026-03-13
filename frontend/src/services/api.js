import axios from "axios";

// ---------- Axios Instance ----------
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://collabhub-backend-xros.onrender.com/api",
  withCredentials: true, // required for cookie-based auth
});

// ---------- Request Interceptor: Auto attach JWT ----------
API.interceptors.request.use(
  (config) => {
    // Try to attach token from localStorage if exists
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response Interceptor: Handle 401 ----------
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Token may have expired or missing.");
      // Optionally, redirect to login page
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ---------- Auth API ----------
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: async (data) => {
    const res = await API.post("/auth/login", data);
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token); // save JWT
    }
    return res;
  },
  logout: async () => {
    localStorage.removeItem("token"); // remove JWT
    return API.post("/auth/logout");
  },
  me: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/update-profile", data),
};

// ---------- Project API ----------
export const projectAPI = {
  create: (data) => API.post("/project/create", data),
  getAll: () => API.get("/project"),
  getById: (id) => API.get(`/project/${id}`),
  search: (params) => {
    const query = typeof params === "string" ? { q: params } : params;
    return API.get("/project/search", { params: query });
  },
  update: (id, data) => API.put(`/project/update/${id}`, data),
  delete: (id) => API.delete(`/project/delete/${id}`),
  requestJoin: (projectId) => API.post("/project/request", { projectId }),
  respondJoin: (id, userid, action) => API.post(`/project/${id}/respond`, { userid, action }),
  getMyProjects: () => API.get("/project/my-projects"),
  removeMember: (projectId, userId) => API.post(`/project/remove-member/${projectId}`, { userId }),
};

export default API;