// src/store/authSlice.js
// Single source of truth for "who is logged in".
// Header, ProtectedRoute, Login, Register and MyAccount all read/write here,
// so the UI updates instantly on login/logout (no page refresh needed).
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
};

const initialToken = localStorage.getItem("token");
if (initialToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: initialToken,
    user: initialToken ? readUser() : null,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      state.user  = payload.user;
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${payload.token}`;
    },
    // keep header name fresh after the profile is loaded / edited
    updateUser: (state, { payload }) => {
      state.user = { ...(state.user || {}), ...payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user  = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export const selectToken = (state) => state.auth.token;
export const selectUser  = (state) => state.auth.user;
export default authSlice.reducer;