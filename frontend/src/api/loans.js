import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const authConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const register = async (details) => {
  const response = await api.post("/auth/register", details);
  return response.data;
};

export const fetchBanks = async () => {
  const response = await api.get("/banks");
  return response.data;
};

export const fetchLoans = async (token) => {
  const response = await api.get("/loans", authConfig(token));
  return response.data;
};

export const createLoan = async (loanData, token) => {
  const response = await api.post("/loans", loanData, authConfig(token));
  return response.data;
};

export const removeLoan = async (loanId, token) => {
  await api.delete(`/loans/${loanId}`, authConfig(token));
};

export const updateLoanStatus = async (loanId, status, token) => {
  const response = await api.patch(`/loans/${loanId}/status`, { status }, authConfig(token));
  return response.data;
};

export const sendLoanEmail = async (loanId, emailData, token) => {
  const response = await api.post(`/loans/${loanId}/email`, emailData, authConfig(token));
  return response.data;
};

export const fetchUsers = async (token) => {
  const response = await api.get("/users", authConfig(token));
  return response.data;
};

export const updateUser = async (userId, userData, token) => {
  const response = await api.patch(`/users/${userId}`, userData, authConfig(token));
  return response.data;
};

export const removeUser = async (userId, token) => {
  await api.delete(`/users/${userId}`, authConfig(token));
};
