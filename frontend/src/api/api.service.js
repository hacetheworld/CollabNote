import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // send refresh token cookie
});

// ---- REQUEST INTERCEPTOR ----
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- REFRESH TOKEN LOGIC ----
let isRefreshing = false;
let subscribers = [];

function onTokenRefreshed(newToken) {
  subscribers.forEach((callback) => callback(newToken));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

// ---- RESPONSE INTERCEPTOR ----
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.get(
            "http://localhost:5000/api/auth/refresh",
            { withCredentials: true }
          );

          const newToken = res.data.accessToken;
          localStorage.setItem("accessToken", newToken);
          isRefreshing = false;
          console.log("Access token expired getting new one");
          console.log(subscribers, "subscribers");

          onTokenRefreshed(newToken);
        } catch (err) {
          console.log(err, "errrr");

          isRefreshing = false;
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return new Promise((resolve) => {
        addSubscriber((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;

          resolve(API(original));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default API;

// ---- API functions ----
export const loginApi = (data) => API.post("/auth/login", data);
export const signupApi = (data) => API.post("/auth/signup", data);
export const getMe = () => API.get("/auth/me");
export const getDocuments = () => API.get("/documents");
export const createDocument = (data) => API.post("/documents", data);
export const getDocumentById = (id) => API.get(`/documents/${id}`);
export const deleteDocumentById = (id) => API.delete(`/documents/${id}`);
export const sendInviteApi = (data) => API.post("/invite", data);
export const acceptInviteApi = (token) => API.get(`/invite/accept/${token}`);
