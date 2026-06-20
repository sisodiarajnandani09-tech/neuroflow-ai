import axios from "axios";

const API = axios.create({
  baseURL:
  process.env.NEXT_PUBLIC_API_URL ||
  "https://neuroflow-ai-uyul.onrender.com",
  timeout: 120000,
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const selectedModel =
      localStorage.getItem("selected_model") || "auto";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-AI-Model"] = selectedModel;
  }

  return config;
});

export default API;