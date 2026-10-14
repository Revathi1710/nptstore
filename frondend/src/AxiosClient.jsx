import axios from "axios";

const AxiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

AxiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

AxiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("ACCESS_TOKEN");
    }

    return Promise.reject(error);
  }
);

export default AxiosClient;