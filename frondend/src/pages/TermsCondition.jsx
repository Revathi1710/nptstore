import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsCondition = () => {
  // Set document title and meta description dynamically
  useEffect(() => {
    document.title = "Terms of Service | NPT Store";

    // Optional: Update meta description for SEO
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Read the Terms of Service for NPT Store, covering legal conditions, billing, limitations of liability, and service usage.";
  }, []);

  const sections = [
    { id: "overview", title: "Overview" },
    { id: "section1", title: "Online Store Terms" },
    { id: "section2", title: "General Conditions" },
    { id: "section3", title: "Accuracy of Info" },
    { id: "section4", title: "Modifications & Prices" },
    { id: "section5", title: "Products & Services" },
    { id: "section6", title: "Billing & Account" },
    { id: "section12", title: "Prohibited Uses" },
    { id: "section13", title: "Liability & Warranty" },
    { id: "section18", title: "Governing Law" },
    { id: "section20", title: "Contact Information" },
  ];

  return (
    <>
      <div className="bg-slate-50 min-h-screen">
        {/* Header Section */}
        <section className="bg-slate-900 text-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Terms of Service</h1>
            <p className="text-slate-400">Effective Date: March 30, 2026</p>
          </div>
        </section>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Table of Contents Sidebar */}
            <aside className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-24 space-y-1">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">Navigation</h3>
                {sections.map((sec) => (
                  <a 
                    key={sec.id} 
                    href={`#${sec.id}`} 
                    className="block py-2 text-sm text-slate-600 hover:text-blue-600 border-l-2 border-transparent hover:border-blue-600 pl-4 transition-all"
                  >
                    {sec.title}
                  </a>
                ))}
              </div>
            </aside>

            {/* Legal Text Content */}
            <main className="lg:w-3/4 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
              
              <section id="overview" className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Overview</h2>
                <div className="text-slate-600 space-y-4">
                  <p>This website is operated by <strong>NPT Store</strong>. Throughout the site, the terms “we”, “us” and “our” refer to NPT Store. NPT Store offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>
                  <p>By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by store.newprojectstracker.com.</p>
                </div>
              </section>

              <section id="section1" className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b pb-2">Section 1 - Online Store Terms</h3>
                <p className="text-slate-600">By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>
              </section>

              <section id="section2" className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b pb-2">Section 2 - General Conditions</h3>
                <p className="text-slate-600">We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.</p>
              </section>

              <section id="section3" className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b pb-2">Section 3 - Accuracy & Timeliness</h3>
                <p className="text-slate-600">We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon as the sole basis for making decisions.</p>
              </section>

              <section id="section4" className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b pb-2">Section 4 - Service & Price Modifications</h3>
                <p className="text-slate-600">Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice at any time.</p>
              </section>

              <section id="section5" className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b pb-2">Section 5 - Products or Services</h3>
                <p className="text-slate-600">Certain products or services may be available exclusively online through the website. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store.</p>
              </section>

              <section id="section6" className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b pb-2">Section 6 - Billing Accuracy</h3>
                <p className="text-slate-600">We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-slate-900 mb-2">Section 7 - Optional Tools</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">We provide access to third-party tools ”as is” without any warranties. Use of optional tools is entirely at your own risk.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-slate-900 mb-2">Section 8 - Third-Party Links</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">We are not liable for any harm or damages related to the purchase or use of goods, services, or resources in connection with third-party websites.</p>
                </div>
              </div>

              <section id="section12" className="mb-12">
                <h3 className="text-lg font-bold text-red-600 mb-4 uppercase tracking-wider border-b border-red-100 pb-2">Section 12 - Prohibited Uses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                   <div className="flex gap-2"><span>•</span> Unlawful purposes</div>
                   <div className="flex gap-2"><span>•</span> Infringing intellectual property</div>
                   <div className="flex gap-2"><span>•</span> Uploading viruses/malware</div>
                   <div className="flex gap-2"><span>•</span> Phishing or scraping data</div>
                   <div className="flex gap-2"><span>•</span> Obscene or immoral purposes</div>
                   <div className="flex gap-2"><span>•</span> Harassment or discrimination</div>
                </div>
              </section>

              <section id="section13" className="mb-12 bg-slate-950 text-white p-8 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Section 13 - Limitation of Liability</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  In no case shall NPT Store, our directors, or employees be liable for any injury, loss, claim, or any direct, indirect, incidental, or consequential damages of any kind, including lost profits or lost savings, arising from your use of the service.
                </p>
              </section>

              <section id="section18" className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b pb-2">Section 18 - Governing Law</h3>
                <p className="text-slate-600 italic">These Terms of Service shall be governed by and construed in accordance with the laws of India and jurisdiction of Jaipur, Rajasthan.</p>
              </section>

              <section id="section20" className="bg-blue-50 p-8 rounded-2xl border border-blue-100 mt-12">
                <h3 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wide">Section 20 - Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <span className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Phone Support</span>
                        <p className="font-bold text-blue-900 text-lg">+91 91710 15659</p>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Email Inquiry</span>
                        <p className="font-bold text-blue-900 text-lg underline decoration-2 underline-offset-4">sales@newprojectstracker.in</p>
                    </div>
                </div>
              </section>

            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsCondition;