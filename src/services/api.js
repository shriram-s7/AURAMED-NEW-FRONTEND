import axios from "axios";

const API_BASE_URL = "https://7oexr7wqi2.execute-api.us-east-1.amazonaws.com/prod";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ REMOVE headers completely
export const predictBreast = async (formData) => {
  return api.post("/predict/breast", formData);
};

export const predictCervical = async (formData) => {
  return api.post("/predict/cervical", formData);
};

export const predictPCOS = async (formData) => {
  return api.post("/predict/pcos", formData);
};
