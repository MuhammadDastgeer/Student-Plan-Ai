import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, HelpCircle, ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react";

export default function PriceView() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const priceScale = billingPeriod === "annually" ? 0.8 : 1.0;

  const plans = [
    {
      name: "Free",
      desc: "Perfect for lightweight organization and personal drafts.",
      price: "$0",
      period: "/mo",
      buttonText: "Start for free",
      isPopular: false,
      buttonStyle: "bg-white hover:bg-stone-50 text-[#221C18] border border-[#E8DFD5]",
      cardStyle: "bg-white border border-[#F3EFE9] text-[#221C18]",
      checkColor: "text-[#c67f43]",
      features: [
        "Dashboard, notes & tasks",
        "Basic calendar planning",
        "Personal whiteboards",
        "Limited AI assistant (10 drafts/mo)",
        "Standard security & offline support",
      ],
    },
    {
      name: "Pro",
      desc: "For professionals needing unlimited thinking power and AI.",
      price: billingPeriod === "annually" ? "$12" : "$16",
      period: "/mo",
      buttonText: "Upgrade to Pro",
      isPopular: true,
      buttonStyle: "bg-[#c67f43] hover:bg-[#b06f38] text-white",
      cardStyle: "bg-[#18120E] text-white border border-[#2D231B] relative md:scale-105 shadow-xl z-10",
      checkColor: "text-[#c67f43]",
      features: [
        "Everything in Free, plus:",
        "Unlimited notes, tasks & boards",
        "Advanced AI actions (unlimited)",
        "AI template builder & customized loops",
        "Productivity insights & streak tracking",
        "Priority historical version access (30 days)",
      ],
    },
    {
      name: "Team",
      desc: "For high-alignment teams building their complete flow together.",
      price: billingPeriod === "annually" ? "$31" : "$39",
      period: "/mo",
      buttonText: "Start team plan",
      isPopular: false,
      buttonStyle: "bg-white hover:bg-stone-50 text-[#221C18] border border-[#E8DFD5]",
      cardStyle: "bg-white border border-[#F3EFE9] text-[#221C18]",
      checkColor: "text-[#c67f43]",
      features: [
        "Everything in Pro, plus:",
        "Shared Kanban boards & document hubs",
        "Live presence & synchronous comments",
        "Team folders & custom metadata tags",
        "Granular admin controls & API keys",
        "Dedicated account partner & instant support",
      ],
    },
  ];

  const featuresComparison = [
    { category: "Core Workspaces", free: "✔", pro: "✔", team: "✔" },
    { category: "Maximum Active Boards", free: "3", pro: "Unlimited", team: "Unlimited" },
    { category: "AI Draft generations", free: "10 / mo", pro: "Unlimited", team: "Unlimited" },
    { category: "Shared team channels", free: "✖", pro: "✖", team: "Unlimited" },
    { category: "Version history", free: "3 days", pro: "30 days", team: "Unlimited" },
    { category: "Dedicated success agent", free: "✖", pro: "✖", team: "✔" },
  ];

  const faqs = [
    {
      q: "Can I switch plans later?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your workspace dashboard billing settings. Downscaling will take effect at the end of the current cycle.",
    },
    {
      q: "Is there a discount for annual billing?",
      a: "Yes, we offer a 20% discount on Pro and Team plans when billed annually. Choose the 'Billed annually' toggle at the top of the page to apply the discount.",
    },
    {
      q: "How does the AI assistant handle my private files?",
      a: "Flowbase is built with absolute local-first trust. Your inputs are sent directly to secure private endpoints and are never used to train global public models. You can turn AI off entirely in settings.",
    },
    {
      q: "Do you offer custom enterprise security rules?",
      a: "Absolutely. For larger teams needing strict single-tenant hosts, custom firestore/SQL persistence rules, or SSO authentication, reach out to our enterprise team via our Contact page.",
    },
  ];

  return (
    <div className="py-16 md:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-20">
        
        {/* Toggle and Headers */}
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c67f43]">
            Flexible Plans
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#221C18] leading-tight">
            Simple, honest pricing
          </h1>
          <p className="text-[#5D554F] text-[15px] max-w-md mx-auto">
            Get started for free, then grow at your own pace. Save 20% by paying annually.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-2.5 bg-[#FAF2EC] border border-[#F4E3D4] p-1.5 rounded-xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-white text-[#c67f43] shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Billed monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                billingPeriod === "annually"
                  ? "bg-white text-[#c67f43] shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Billed annually
              <span className="bg-[#15803D] text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto pt-4">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`rounded-2xl p-8 flex flex-col justify-between text-left transition-all ${plan.cardStyle}`}
            >
              {plan.isPopular && (
                <span className="absolute top-4 right-4 bg-[#c67f43] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-serif">{plan.name}</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${plan.isPopular ? "text-stone-400" : "text-[#5D554F]"}`}>
                    {plan.desc}
                  </p>
                </div>

                <div className="flex items-baseline border-b border-[#F0EBE5]/20 pb-4">
                  <span className="text-5xl font-bold font-serif tracking-tight">{plan.price}</span>
                  <span className={`text-sm ml-1.5 ${plan.isPopular ? "text-stone-400" : "text-[#5D554F]"}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-[13px] leading-relaxed">
                      <div className="mt-0.5 flex-shrink-0">
                        <Check className={`w-4 h-4 ${plan.checkColor}`} strokeWidth={3} />
                      </div>
                      <span className={plan.isPopular ? "text-stone-200" : "text-stone-700"}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-all shadow-sm cursor-pointer text-center ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto pt-12 space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-[#221C18]">Plan comparison</h2>
            <p className="text-stone-500 text-sm mt-1">Take a detailed look under the hood</p>
          </div>

          <div className="bg-white border border-[#F3EFE9] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#F1EFE9]">
                  <th className="p-4 font-bold text-[#221C18] font-sans">Features</th>
                  <th className="p-4 font-bold text-[#221C18]">Free</th>
                  <th className="p-4 font-bold text-[#c67f43]">Pro</th>
                  <th className="p-4 font-bold text-[#221C18]">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFE9] text-stone-700">
                {featuresComparison.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-medium text-[#221C18]">{row.category}</td>
                    <td className="p-4 text-stone-500 font-medium">{row.free}</td>
                    <td className="p-4 text-[#c67f43] font-semibold">{row.pro}</td>
                    <td className="p-4 text-stone-800 font-medium">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8 pt-12">
          <div className="text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-[#c67f43] mx-auto opacity-80" />
            <h2 className="font-serif text-3xl font-bold text-[#221C18]">Frequently Asked Questions</h2>
            <p className="text-stone-500 text-sm">Have any queries? We've got the answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="bg-white border border-[#F1EFE9] rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                  className="w-full p-5 flex items-center justify-between text-left font-semibold text-[15px] text-[#221C18] hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === fIdx ? (
                    <ChevronUp className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {activeFaq === fIdx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-stone-600 text-[14px] leading-relaxed border-t border-[#FAF8F5]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
