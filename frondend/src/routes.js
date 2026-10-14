// src/routes.js  - replaces the <Routes> block that used to live in App.jsx
import { index, layout, route } from "@react-router/dev/routes";

export default [
  // Public pages (Header + Footer)
  layout("components/Layout.jsx", [
    index("pages/Home.jsx"),
    route("product", "pages/AllProduct.jsx"),
    route("product-view/:slug", "pages/Productview.jsx"),
    route("blogs", "pages/Blogs.jsx"),
    route("blogs/:slug", "pages/ViewBlog.jsx"),
    route("about", "pages/About.jsx"),
    route("contact", "pages/Contact.jsx"),
    route("terms", "pages/TermsCondition.jsx"),
    route("refund-policy", "pages/RefundPolicy.jsx"),
    route("privacy", "pages/PrivacyPolicy.jsx"),
    route("login", "pages/Login.jsx"),
    route("register", "routes/register.js"),   // 301 -> /login
    route("cart", "pages/CartPage.jsx"),
    route("checkout", "pages/Checkout.jsx"),

    // Pages that need a login
    layout("components/ProtectedLayout.jsx", [
      route("my-orders", "pages/MyOrder.jsx"),
      route("my-orders/:id", "pages/OrderView.jsx"),
      route("addresses", "pages/Addresses.jsx"),
      route("myAccount", "pages/MyAccount.jsx"),
    ]),

    // Anything else -> a real 404
    route("*", "routes/notFound.js"),
  ]),

  // Files for search engines (no layout)
  route("robots.txt", "routes/robots.js"),
  route("sitemap.xml", "routes/sitemap.js"),
];
