// src/store/buyNowSlice.js
import { createSlice } from "@reduxjs/toolkit";

// This slice holds ONLY the product the user clicked "Buy Now" on.
// It is completely separate from the cart — the cart is untouched.

const buyNowSlice = createSlice({
  name: "buyNow",
  initialState: {
    product: null,   // { id, name, price, active_price, image, code, format, ... }
    quantity: 1,
  },
  reducers: {
    setBuyNowProduct: (state, action) => {
      state.product  = action.payload;
      state.quantity = 1;
    },
    clearBuyNow: (state) => {
      state.product  = null;
      state.quantity = 1;
    },
  },
});

export const { setBuyNowProduct, clearBuyNow } = buyNowSlice.actions;
export default buyNowSlice.reducer;

// Selectors
export const selectBuyNowProduct  = (state) => state.buyNow.product;
export const selectBuyNowQuantity = (state) => state.buyNow.quantity;