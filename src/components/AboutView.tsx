import { motion } from "motion/react";
import { Users, Shield, Lightbulb, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "./Router";

export default function AboutView() {
  const { navigate } = useRouter();

  const values = [
    {
      icon: Lightbulb,
      title: "Mindful Design",
      desc: "We believe in visual clarity, minimal distractions, and calm interfaces that let you focus on what truly matters.",
    },
    {
      icon: Shield,
      title: "Absolute Trust",
      desc: "Your data and thinking are personal. Security, offline readiness, and extreme privacy are built into every level of our tech.",
    },
    {
      icon: Zap,
      title: "Lightning Performance",
      desc: "We tune every interaction to run at 60fps. No bloated scripts, no heavy server-trips. Just pure native speed.",
    },
    {
      icon: Users,
      title: "Built for Flow",
      desc: "Collaboration should feel natural, never forced. We design tools that allow real-time and async synergy seamlessly.",
    },
  ];

  const team = [
    {
      name: "Sophia Sterling",
      role: "Founder & Creative Director",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
      bio: "Former lead designer of minimal tools. Sophia designs the aesthetic soul of Flowbase.",
    },
    {
      name: "Marcus Vance",
      role: "Principal Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
      bio: "Engineered high-performance real-time servers. Marcus keeps the workspaces fast.",
    },
    {
      name: "Elena Rostova",
      role: "Head of AI Product",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
      bio: "Specialist in user-centric large language model interfaces and calm AI integrations.",
    },
  ];

  return (
    <div className="bg-[#FAF8F5] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-left space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c67f43] font-sans">
              Our Mission
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-[#221C18]">
              We build spaces for the <span className="text-[#c67f43]">creative mind</span>.
            </h1>
            <p className="text-[#5D554F] text-base md:text-lg leading-relaxed">
              Flowbase was founded to eliminate the noise of modern workplace software. We design single-screen, highly responsive workspaces that combine your files, boards, planning, and ambient assistance into one beautiful environment.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/contact")}
                className="bg-[#c67f43] hover:bg-[#b06f38] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                Get in Touch <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="aspect-square rounded-3xl bg-[#FAF2EC] border border-[#F4E3D4] p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c67f43]/5 rounded-full blur-2xl" />
              <div className="text-stone-400 font-serif text-8xl font-bold select-none opacity-20">“</div>
              <p className="font-serif text-lg md:text-xl text-[#3A332E] italic relative z-10">
                "Software should feel like a quiet room. It should invite you to think clearly, organize simply, and make progress at your own rhythm."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c67f43] text-white flex items-center justify-center font-bold text-sm">
                  SS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#221C18]">Sophia Sterling</h4>
                  <p className="text-xs text-stone-500 font-medium">Founder, Flowbase</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-[#F0EBE5]/80">
          <div className="text-left">
            <div className="text-4xl md:text-5xl font-bold text-[#c67f43] font-serif">150K+</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 mt-1">Active Thinkers</div>
          </div>
          <div className="text-left">
            <div className="text-4xl md:text-5xl font-bold text-[#221C18] font-serif">12+</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 mt-1">Global Teams</div>
          </div>
          <div className="text-left">
            <div className="text-4xl md:text-5xl font-bold text-[#221C18] font-serif">60fps</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 mt-1">Render Engine</div>
          </div>
          <div className="text-left">
            <div className="text-4xl md:text-5xl font-bold text-[#c67f43] font-serif">99.9%</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 mt-1">Core Uptime</div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c67f43]">Core Principles</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#221C18]">Values that drive us</h2>
            <p className="text-[#5D554F] text-[15px]">We don't build features just to hit quotas. We build tools that have a viewpoint.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="bg-white border border-[#F3EFE9] rounded-2xl p-6 md:p-8 flex gap-5 text-left items-start shadow-xs">
                  <div className="p-3 bg-[#FAF2EC] text-[#c67f43] rounded-xl flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-[#221C18]">{value.title}</h3>
                    <p className="text-[#5D554F] text-[14px] leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c67f43]">The Thinkers</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#221C18]">Meet our designers & developers</h2>
            <p className="text-[#5D554F] text-[15px]">A distributed micro-team committed to visual excellence and high craftsmanship.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#F3EFE9] rounded-2xl p-6 text-left space-y-4 flex flex-col items-start shadow-xs"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border border-[#F3EFE9]"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-[#221C18]">{member.name}</h3>
                  <p className="text-xs text-[#c67f43] font-semibold">{member.role}</p>
                </div>
                <p className="text-stone-500 text-[13px] leading-relaxed flex-grow">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
