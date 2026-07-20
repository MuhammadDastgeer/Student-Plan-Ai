import { motion } from "motion/react";
import { useRouter } from "./Router";

export default function CTA() {
  const { navigate } = useRouter();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="cta-section" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#FAF2EC]/55 border border-[#F4EBE2] rounded-3xl p-10 md:p-16 flex flex-col items-center text-center space-y-6 md:space-y-8 relative overflow-hidden"
        >
          {/* Decorative background blurs for extra depth */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#c67f43]/5 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#c67f43]/5 rounded-full blur-3xl translate-x-12 translate-y-12" />

          {/* Badge */}
          <div className="bg-white border border-[#F1EFEA] text-stone-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm relative z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
            Trusted by teams everywhere
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[44px] font-bold text-[#221C18] leading-tight max-w-2xl relative z-10">
            Build your entire productivity system in one workspace
          </h2>

          {/* Subtitle */}
          <p className="text-[#5D554F] text-[15px] md:text-[16px] leading-relaxed max-w-xl relative z-10">
            Start with notes and tasks, then grow into AI planning, visual thinking, and real-time collaboration.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 w-full">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-[#c67f43] hover:bg-[#b06f38] text-white font-semibold text-[14px] px-8 py-3.5 rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              Start for free <span className="text-base">→</span>
            </button>
            <button
              onClick={() => scrollToSection("features-section")}
              className="bg-white hover:bg-stone-50 text-[#221C18] border border-[#E8DFD5] font-semibold text-[14px] px-8 py-3.5 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              See all features
            </button>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
