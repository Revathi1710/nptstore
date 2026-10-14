import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Eye, CreditCard, UserCheck, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  // Set document title and meta description dynamically
  useEffect(() => {
    document.title = "Privacy Policy | NPT Store";

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Learn how NPT Store collects, protects, and handles your personal information, payments, and data privacy.";
  }, []);

  return (
    <>
     
      
      <div className="bg-slate-50 min-h-screen font-sans">
        {/* Header Section */}
        <section className="bg-slate-950 text-white py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              <ShieldCheck size={14} /> Data Protection
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Privacy Statement</h1>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              At NPT Store, we are committed to protecting your personal information and your right to privacy.
            </p>
          </div>
        </section>

        {/* Content Grid */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Core Sections */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Section 1 & 2 */}
              <section id="collection" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><UserCheck size={24} /></span>
                  Information Collection & Consent
                </h2>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    When you purchase something from our store, we collect personal information such as your <strong>name, address, and email address</strong> to fulfill your order.
                  </p>
                  <p className="bg-slate-50 p-4 rounded-lg text-sm border-l-4 border-blue-600">
                    <strong>How we get consent:</strong> When you provide information to complete a transaction or verify a payment, we imply that you consent to our collecting it for that specific reason only.
                  </p>
                </div>
              </section>

              {/* Section 4: Payments */}
              <section id="payment" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={24} /></span>
                    Secure Payments
                  </h2>
                  <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                    PCI-DSS Compliant
                  </div>
                </div>
                <div className="text-slate-600 space-y-4">
                  <p>
                    We use <strong>Razorpay</strong> for processing payments. NPT Store does not store your card data on our servers. 
                    Your data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS).
                  </p>
                  <p className="text-sm italic">
                    Your purchase transaction data is only used as long as is necessary to complete your purchase. 
                    For more, visit <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Razorpay's Terms</a>.
                  </p>
                </div>
              </section>

              {/* Section 6 & 7: Security & Cookies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 text-white p-8 rounded-2xl">
                   <Lock className="text-blue-400 mb-4" size={28} />
                   <h3 className="font-bold text-lg mb-2">Security Best Practices</h3>
                   <p className="text-slate-400 text-sm">
                     We follow industry best practices to ensure your information is not inappropriately lost, misused, or altered.
                   </p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-200">
                   <Eye className="text-blue-600 mb-4" size={28} />
                   <h3 className="font-bold text-slate-900 text-lg mb-2">Cookie Usage</h3>
                   <p className="text-slate-500 text-sm">
                     We use session cookies to maintain your user experience. These are not used to track you on other websites.
                   </p>
                </div>
              </div>

            </div>

            {/* Right Column: Contact & Actions */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl shadow-blue-600/20">
                <Mail className="mb-4 opacity-50" size={32} />
                <h3 className="text-xl font-bold mb-4">Withdraw Consent</h3>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Changed your mind? You can withdraw your consent for us to contact you at any time.
                </p>
                <a 
                  href="mailto:sales@newprojectstracker.in" 
                  className="block w-full text-center bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Contact Compliance Officer
                </a>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                  Official Address
                </h4>
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex gap-3">
                    <span className="text-blue-600">📍</span>
                    <p>
                      2nd Floor, 9/25, Kaliamman Koil Street Raghavendra Colony,<br />
                      Sai Nagar Virugambakkam, Chennai 600 092
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

   
    </>
  );
};

export default PrivacyPolicy;