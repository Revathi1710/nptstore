// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import buyNowReducer from "./buyNowSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    buyNow: buyNowReducer,
    auth: authReducer,
  },
});

export default store;