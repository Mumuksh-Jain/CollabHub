import axios from "axios";

const API = axios.create({
  baseURL:import.meta.env.VITE_BACKEND_URL || "https://collabhub-backend-xros.onrender.com/api",
  withCredentials: true,
});

// ─── Response Interceptor ──────────────────────────────────────────────────
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      "API Error:",
      err.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

// ─── Auth API ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  me: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/update-profile", data),
  getUsers: () => API.get("/auth/users"),
  getUserById: (id) => API.get(`/auth/user/${id}`),
};

// ─── AI API ────────────────────────────────────────────────────────────────
export const aiAPI = {
  match: async (data) => {
    const res = await API.post("/ai/match", data);
    return res.data;
  },
  improveIdea: async (data) => {
    const res = await API.post("/ai/improve-idea", data);
    return res.data;
  },
  enhanceProfile: async (data) => {
    const res = await API.post("/ai/enhance-profile", data);
    return res.data;
  },
};

// ─── Project API ───────────────────────────────────────────────────────────
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
  requestJoin: (projectId) =>
    API.post("/project/request", { projectId }),
  respondJoin: (id, userid, action) =>
    API.post(`/project/${id}/respond`, { userid, action }),
  getMyProjects: () => API.get("/project/my-projects"),
  removeMember: (projectId, userId) =>
    API.post(`/project/remove-member/${projectId}`, { userId }),
  inviteMember: (projectId, userId) =>
    API.post(`/project/invite/${projectId}`, { userId }),
  respondInvite: (projectId, action) =>
    API.post(`/project/respond-invite/${projectId}`, { action }),
};

export default API;