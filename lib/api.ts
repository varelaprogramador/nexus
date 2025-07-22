import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "http://evolution-api.local:8080", // URL fictícia para simular o Evolution API
});

export default api;
