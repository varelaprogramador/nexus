import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVOLUTION_API_URL,
});

export default api;
