import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MapPin, Mail, Phone, Clock, MessageSquare, CheckCircle, ShieldAlert } from "lucide-react";

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate real database or API post
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "general", message: "" });
    }, 1200);
  };

  const contactInfos = [
    {
      icon: Mail,
      title: "Email Support",
      value: "hello@flowbase.co",
      desc: "Get answers within 2 hours.",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+1 (800) 555-FLOW",
      desc: "Mon-Fri from 9am to 6pm PST.",
    },
    {
      icon: Clock,
      title: "Office Hours",
      value: "9:00 AM - 6:00 PM",
      desc: "Every day except Sunday.",
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c67f43] font-sans">
            Connect
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#221C18] leading-tight">
            We'd love to hear from you
          </h1>
          <p className="text-[#5D554F] text-[15px]">
            Have a question about features, pricing, or custom security rules? Send us a message.
          </p>
        </div>

        {/* Form and Side Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#F3EFE9] rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-xs">
              <h2 className="font-serif text-2xl font-bold text-[#221C18]">Contact Info</h2>
              <p className="text-[#5D554F] text-[14px] leading-relaxed">
                We're here to help you design the best layout for your productivity setup. Contact us anytime.
              </p>

              <div className="space-y-4 pt-4 border-t border-[#F0EBE5]/60">
                {contactInfos.map((info, idx) => {
                  const Icon = info.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="p-2 bg-[#FAF2EC] text-[#c67f43] rounded-lg">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#221C18]">{info.title}</h4>
                        <p className="text-[14px] text-[#c67f43] font-semibold mt-0.5">{info.value}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{info.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Static Interactive Location Card */}
            <div className="bg-[#18120E] text-white border border-[#2D231B] rounded-2xl p-6 md:p-8 text-left shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c67f43]/10 rounded-full blur-2xl" />
              <div className="flex gap-4">
                <div className="p-3 bg-[#c67f43]/20 text-[#c67f43] rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold font-serif text-lg text-white">San Francisco HQ</h3>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    600 Montgomery St, Floor 42 <br />
                    San Francisco, CA 94111
                  </p>
                  <p className="text-xs text-stone-400 font-medium">
                    Our team is hybrid-first, but we have hot-desks waiting for you!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 bg-white border border-[#F3EFE9] rounded-2xl p-6 md:p-8 text-left shadow-xs relative">
            <AnimatePresence mode="wait">
              {!submitSuccess ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all text-stone-800 placeholder-stone-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all text-stone-800 placeholder-stone-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all text-stone-800"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales & Business Plan</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partner Proposals</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we help you build your system?"
                      value={formData.message}
                      onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all text-stone-800 placeholder-stone-400"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#c67f43] hover:bg-[#b06f38] disabled:bg-stone-400 text-white font-semibold text-sm py-3.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Message <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-form"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="py-12 text-center space-y-4 flex flex-col items-center justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-[#15803D]" />
                  <h3 className="font-serif text-2xl font-bold text-[#221C18]">Message Sent!</h3>
                  <p className="text-stone-500 text-sm max-w-sm leading-relaxed">
                    Thank you for reaching out. A Flowbase product specialist will get back to you within 2 hours.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-4 text-xs font-bold uppercase tracking-wider text-[#c67f43] hover:text-[#b06f38] transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
