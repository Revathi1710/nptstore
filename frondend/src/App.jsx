import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Users from "./views/Users";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import { ContextProvider } from "./contexts/ContextProvider";
import Home from "./pages/Home";
import React from "react";
import CartPage from "./pages/Cartpage";
import ProductView from "./pages/Productview";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrder from "./pages/MyOrder";
import MyAccount from "./pages/MyAccount";
import Blogs from "./pages/Blogs";
import ViewBlog from "./pages/ViewBlog";
import About from "./pages/About";
import TermsCondition from "./pages/TermsCondition";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact.JSX";
import Layout from "./components/Layout";
import { AllProduct } from "./pages/AllProduct";
import OrderView from "./pages/OrderView";
import Addresses from "./pages/Addresses";
import { reportUrl, findFilter } from "./utils/reportUrl";

// /report/Maharashtra, /report/Other-Manufacturing, /report/2026, /report/West ... -> listing
// /report/some-report-slug -> single report
const ReportRoute = () => {
  const { slug } = useParams();
  return findFilter(slug) ? <AllProduct /> : <ProductView />;
};

// Old links: /product?state=Maharashtra&year=2026 -> /report/Maharashtra?year=2026
const OldProductRedirect = () => {
  const params = Object.fromEntries(new URLSearchParams(useLocation().search));
  return <Navigate to={reportUrl(params)} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Routes>

          {/* All pages that share Header + Footer go inside this Layout route. */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<AllProduct />} />
            <Route path="/report/:slug" element={<ReportRoute />} />
            <Route path="/product" element={<OldProductRedirect />} />

            {/* One page for sign in + sign up (email code, no password) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<ViewBlog />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<TermsCondition />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />

            {/* Checkout is PUBLIC now: guests fill the form once, no register / OTP */}
            <Route path="/checkout" element={<Checkout />} />

            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addresses"
              element={
                <ProtectedRoute>
                  <Addresses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders/:id"
              element={
                <ProtectedRoute>
                  <OrderView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myAccount"
              element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Routes without Header/Footer (admin, guest, etc.) */}
          <Route path="/users" element={<Users />} />
          <Route path="/defult" element={<DefaultLayout />} />
          <Route path="/guest" element={<GuestLayout />} />

        </Routes>
      </ContextProvider>
    </BrowserRouter>
  );
}

export default App;