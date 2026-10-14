import React, { useEffect } from 'react';
import { AlertCircle, FileText, HelpCircle, XCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const RefundPolicy = () => {
  // Set document title and meta description dynamically
  useEffect(() => {
    document.title = "Refund & Cancellation Policy | NPT Store";

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Review the refund and order cancellation terms for digital asset purchases at NPT Store.";
  }, []);

  return (
    <>
  

      <div className="bg-slate-50 min-h-screen font-sans">
        {/* Policy Header */}
        <section className="bg-slate-900 text-white py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <AlertCircle size={24} />
              <span className="text-xs font-bold uppercase tracking-widest">Digital Product Terms</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Refund & Cancellation Policy</h1>
            <p className="text-slate-400 max-w-2xl">
              Please review our policies regarding digital asset purchases and order cancellations carefully.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: The Strict Policy */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <XCircle className="text-red-500" />
                  No Refund Policy
                </h2>
                <div className="text-slate-600 space-y-4 leading-relaxed">
                  <p>
                    Thank you for choosing <strong>NPT Store</strong> for your industrial intelligence needs. 
                    Because our reports and databases are <strong>digital products</strong> delivered instantly 
                    via download or access code, we maintain a strict <span className="text-slate-950 font-bold underline decoration-red-500">No Refund</span> policy.
                  </p>
                  <p>
                    Once a digital product has been accessed, downloaded, or the access code has been provided, 
                    the sale is considered final and cannot be returned or refunded.
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Order Cancellations
                </h2>
                <p className="text-slate-600 mb-4">
                  We recognize that mistakes happen. If you need to cancel an order, please note the following:
                </p>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-blue-900 text-sm">
                  <strong>Before Delivery:</strong> If you contact us <em>immediately</em> before the digital product 
                  is delivered or accessed, we will make every effort to satisfy your cancellation request.
                  <br /><br />
                  <strong>After Delivery:</strong> We cannot guarantee or provide a cancellation once the delivery 
                  system has triggered the automated download link or access credentials.
                </div>
              </div>
            </div>

            {/* Right Column: Pre-Purchase Checklist */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <HelpCircle className="text-blue-400" size={20} />
                  Before You Buy
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  To ensure the product meets your exact needs, we recommend:
                </p>
                <ul className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <span className="text-blue-500 font-bold">01.</span>
                    <span>Review all product features and compatibility requirements.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-500 font-bold">02.</span>
                    <span>Verify the data format (PDF or Excel) is suitable for your workflow.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-500 font-bold">03.</span>
                    <span>Contact support if you have any technical questions.</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Need Assistance?</p>
                <p className="text-slate-900 font-bold mb-4">sales@newprojectstracker.com</p>
                <a 
                  href="mailto:sales@newprojectstracker.com"
                  className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg transition-colors text-sm"
                >
                  Contact Support
                </a>
              </div>
            </div>

          </div>

          {/* Acknowledgment Footer */}
          <div className="mt-12 text-center text-slate-400 text-xs">
            By making a purchase on the NPT Store website, you acknowledge and agree to this cancellation/refund policy.
          </div>
        </main>
      </div>

    
    </>
  );
};

export default RefundPolicy;