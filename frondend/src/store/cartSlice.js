import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * ─── HELPER: GET OR CREATE SESSION ID ───────────────────────────────────────
 * Ensures guest users always have a unique identifier for their cart.
 */
const getSessionId = () => {
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cart_session_id", id);
  }
  return id;
};

/**
 * ─── HELPER: DYNAMIC API CONFIG ─────────────────────────────────────────────
 * Automatically attaches Authorization token or X-Session-Id to every request.
 */
const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const API_URL = import.meta.env.VITE_API_URL;

// ─── THUNKS ──────────────────────────────────────────────────────────────────

// 1. Fetch Cart Summary
export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/cart`, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load cart");
    }
  }
);

// 2. Add Product to Cart
export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ product_id, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/cart`, { product_id, quantity }, { headers: getHeaders() });
      return dispatch(fetchCart()).unwrap();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add item");
    }
  }
);

// 3. Update Item Quantity
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ id, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await axios.put(`${API_URL}/cart/${id}`, { quantity }, { headers: getHeaders() });
      return dispatch(fetchCart()).unwrap();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

// 4. Remove Single Item
export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/cart/${id}`, { headers: getHeaders() });
      return dispatch(fetchCart()).unwrap();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove item");
    }
  }
);

// 5. Clear Entire Cart
export const clearCartAsync = createAsyncThunk(
  "cart/clear",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/cart/clear`, { headers: getHeaders() });
      return dispatch(fetchCart()).unwrap();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear cart");
    }
  }
);

/**
 * 6. Merge Guest Cart (CRITICAL FOR LOGIN FLOW)
 * Call this in your Login component immediately after saving the token.
 */
export const mergeGuestCart = createAsyncThunk(
  "cart/merge",
  async (token, { rejectWithValue }) => {
    try {
      // Grab the guest session ID from storage
      const sessionId = localStorage.getItem("cart_session_id");
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/merge`,
        { session_id: sessionId }, // Send the guest ID so backend knows what to move
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Once merged, the guest session is no longer needed
      localStorage.removeItem("cart_session_id");
      
      return response.data; // Should return the updated cart items
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {
    // Manually reset cart (e.g., on Logout)
    resetCartState: (state) => {
      state.items = [];
      state.total = 0;
      state.count = 0;
      state.error = null;
      localStorage.removeItem("cart_session_id");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart Handlers
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.count = action.payload.count || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCartState } = cartSlice.actions;

// Selectors for easy access in components
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartCount = (state) => state.cart.count;
export const selectCartLoading = (state) => state.cart.loading;

export default cartSlice.reducer;