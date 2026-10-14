import { useEffect, useState } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Provider } from "react-redux";
import { makeStore } from "./store/store";
import { hydrateAuth } from "./store/authSlice";
import { ContextProvider } from "./contexts/ContextProvider";
import { SITE_URL, SITE_NAME } from "./lib/seo";
import favicon from "./assets/favicon.png";
import logo from "./assets/NPT_Store_Logo.png";
import "./index.css";

// Organization + WebSite schema, shown on every page (handout A7).
// TODO (Jp): add legal name, postal address and the LinkedIn URL to "sameAs" once confirmed.
const orgJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${logo}`,
    contactPoint: [{ "@type": "ContactPoint", telephone: "+91-91710-15659", email: "sales@newprojectstracker.com", contactType: "sales" }],
    // sameAs: ["https://www.linkedin.com/company/..."],
  },
  { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
];

// The HTML shell. Replaces the old index.html. Runs on the server for every request.
export function Layout({ children }) {
  // Own store per browser tab / per server request (see store.js)
  const [store] = useState(makeStore);
  useEffect(() => { store.dispatch(hydrateAuth()); }, [store]); // read the saved login in the browser only

  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href={favicon} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <Meta />
        <Links />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }} />
      </head>
      <body>
        <Provider store={store}>
          <ContextProvider>{children}</ContextProvider>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

// Last-resort error page (the site Layout route has its own friendlier one).
export function ErrorBoundary() {
  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <title>Something went wrong | NPT Store</title>
      <meta name="robots" content="noindex" />
      <h1>Something went wrong</h1>
      <p><a href="/">Back to the NPT Store home page</a></p>
    </main>
  );
}
