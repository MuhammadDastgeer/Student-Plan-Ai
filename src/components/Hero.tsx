import { motion } from "motion/react";
import DashboardMockup from "./DashboardMockup";
import { useRouter } from "./Router";

export default function Hero() {
  const { navigate } = useRouter();
  
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-[#FAF2EC] border border-[#F4E3D4] text-[#c67f43] text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider"
          >
            <span className="text-[14px]">✦</span> AI-powered workspace
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-[#221C18]"
          >
            One workspace. <br />
            <span className="text-[#c67f43]">Every way you think.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#5D554F] text-base md:text-[17px] leading-relaxed max-w-xl"
          >
            Flowbase combines notes, whiteboards, kanban boards, calendar planning, and AI assistance in one calm, modern workspace.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 w-full"
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-[#1C1510] hover:bg-stone-800 text-white font-semibold text-[14px] px-6 py-3 rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              Start for free <span className="text-base">→</span>
            </button>
            
            <button
              onClick={() => scrollToSection("features-section")}
              className="bg-white hover:bg-stone-50 text-[#221C18] border border-[#E8DFD5] font-semibold text-[14px] px-6 py-3 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              See features
            </button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 pt-6 border-t border-[#F0EBE5] w-full max-w-lg"
          >
            <div>
              <div className="text-2xl font-bold text-[#221C18] font-sans">7⁺</div>
              <div className="text-xs text-[#5D554F] font-medium mt-0.5">workspace modes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#221C18] font-sans">AI</div>
              <div className="text-xs text-[#5D554F] font-medium mt-0.5">built into flow</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#221C18] font-sans">Live</div>
              <div className="text-xs text-[#5D554F] font-medium mt-0.5">team presence</div>
            </div>
          </motion.div>

        </div>

        {/* Right Content - Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6 flex justify-center lg:justify-end w-full"
        >
          <DashboardMockup />
        </motion.div>

      </div>
    </section>
  );
}
