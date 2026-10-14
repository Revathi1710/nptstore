import React, { useEffect } from "react";
import HomePageProducts from "../components/HomePageProducts";
import RegionProduct from "../components/RegionProduct";
import {  WhoBuys, WhatsInside, HowItWorks, Faq, Upsell } from "../components/Homesections";
import BannerSection from "../components/BannerSection";

export default function Home() {
  useEffect(() => {
    // Set Page Title
    document.title = "NPT Store | New Projects Tracker & Industrial Capex Reports";

    // Set Meta Description dynamically
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      "Access detailed new project reports, capex tracking, and promoter contact lists across India. Build your sales pipeline faster with verified industrial data."
    );
  }, []);

  return (
    <>
     <BannerSection/>
      <HomePageProducts/>
      <WhoBuys/>
      <WhatsInside/>
      <HowItWorks/>
      <RegionProduct/>
      <Faq/>
      <Upsell/>
    </>
  );
}