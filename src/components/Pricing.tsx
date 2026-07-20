import { motion } from "motion/react";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      desc: "For getting started",
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
        "Limited AI assistant",
      ],
    },
    {
      name: "Pro",
      desc: "For power users",
      price: "$16",
      period: "/mo",
      buttonText: "Upgrade to Pro",
      isPopular: true,
      buttonStyle: "bg-[#c67f43] hover:bg-[#b06f38] text-white",
      cardStyle: "bg-[#18120E] text-white border border-[#2D231B] relative scale-105 shadow-xl z-10",
      checkColor: "text-[#c67f43]",
      features: [
        "Unlimited notes & boards",
        "Advanced AI actions",
        "AI template builder",
        "Productivity insights",
        "Priority history",
      ],
    },
    {
      name: "Team",
      desc: "For collaborative teams",
      price: "$39",
      period: "/mo",
      buttonText: "Start team plan",
      isPopular: false,
      buttonStyle: "bg-white hover:bg-stone-50 text-[#221C18] border border-[#E8DFD5]",
      cardStyle: "bg-white border border-[#F3EFE9] text-[#221C18]",
      checkColor: "text-[#c67f43]",
      features: [
        "Shared Kanban spaces",
        "Live presence & comments",
        "Team categories",
        "Admin controls",
        "Priority support",
      ],
    },
  ];

  return (
    <section id="pricing-section" className="py-20 bg-[#FAF8F5] border-t border-[#F0EBE5]/60">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c67f43] font-sans">
            Pricing
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#221C18] leading-tight">
            Simple, honest pricing
          </h2>
          <p className="text-[#5D554F] text-[15px] sm:text-[16px]">
            Start free. Upgrade when you're ready.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto pt-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-2xl p-8 flex flex-col h-full min-h-[460px] text-left transition-transform duration-300 ${plan.cardStyle}`}
            >
              {plan.isPopular && (
                <span className="absolute top-4 right-4 bg-[#c67f43] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Most popular
                </span>
              )}

              {/* Title & Description */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold font-serif">{plan.name}</h3>
                <p className={`text-xs mt-1.5 ${plan.isPopular ? "text-stone-400" : "text-[#5D554F]"}`}>
                  {plan.desc}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-bold font-serif tracking-tight">{plan.price}</span>
                <span className={`text-sm ml-1.5 ${plan.isPopular ? "text-stone-400" : "text-[#5D554F]"}`}>
                  {plan.period}
                </span>
              </div>

              {/* Call to Action Button */}
              <button
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all shadow-sm cursor-pointer mb-8 text-center ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>

              {/* Features List */}
              <ul className="space-y-4 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-[13.5px]">
                    <div className="mt-0.5 flex-shrink-0">
                      <Check className={`w-4 h-4 ${plan.checkColor}`} strokeWidth={3} />
                    </div>
                    <span className={plan.isPopular ? "text-stone-200" : "text-stone-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
