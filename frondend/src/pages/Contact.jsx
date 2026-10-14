import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const CONTACT = { phone: "+919171015659", phoneLabel: "+91 91710 15659", email: "sales@newprojectstracker.com" };

const INFO = [
  {
    icon: Phone,
    title: "Call us",
    text: "Monday to Friday, 9am to 6pm",
    link: <a href={`tel:${CONTACT.phone}`} className="font-semibold text-blue-700 hover:underline">{CONTACT.phoneLabel}</a>,
  },
  {
    icon: Mail,
    title: "Email support",
    text: "We'll respond within 24 hours.",
    link: <a href={`mailto:${CONTACT.email}`} className="break-all font-semibold text-blue-700 hover:underline">{CONTACT.email}</a>,
  },
  {
    icon: MapPin,
    title: "Our office",
    text: "Plot No 7A, Chinmaya Nagar Stage II Extn, Chennai, Tamil Nadu 600092",
  },
];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const Field = ({ label, id, children }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  // There is no contact API yet, so this opens the visitor's email app with the message filled in.
  // When you add an endpoint, replace the body of this function with an axios.post(...) call.
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = formData.subject.trim() || "Enquiry from NPT Store";
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      {/* Hero: same light blue as the home banner */}
      <section className="border-b border-blue-100 bg-gradient-to-b from-[#EFF6FF] via-[#F4F8FF] to-[#EBF3FE] px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl md:px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Contact us</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Have questions about our industrial reports? Our team is here to provide the market intelligence you need.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">

          {/* Form */}
          <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-8 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">Fill in the form and we'll get back to you.</p>

            {sent && (
              <div role="status" className="mb-5 rounded-md border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                Your email app should open with your message ready to send. If it didn't, email us at {CONTACT.email}.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Full name" id="c-name">
                  <input id="c-name" name="name" type="text" required autoComplete="name" placeholder="John Doe"
                    value={formData.name} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Email address" id="c-email">
                  <input id="c-email" name="email" type="email" required autoComplete="email" placeholder="john@company.com"
                    value={formData.email} onChange={handleChange} className={inputClass} />
                </Field>
              </div>

              <Field label="Subject" id="c-subject">
                <input id="c-subject" name="subject" type="text" placeholder="Enquiry about state reports"
                  value={formData.subject} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Message" id="c-message">
                <textarea id="c-message" name="message" rows={5} required placeholder="How can we help you?"
                  value={formData.message} onChange={handleChange} className={`${inputClass} resize-y`} />
              </Field>

              <button type="submit"
                className="w-full rounded-md bg-blue-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto">
                Send message
              </button>
            </form>
          </section>

          {/* Contact details */}
          <aside className="space-y-4">
            {INFO.map(({ icon: Icon, title, text, link }) => (
              <div key={title} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{text}</p>
                  {link && <p className="mt-2 text-sm">{link}</p>}
                </div>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Contact;