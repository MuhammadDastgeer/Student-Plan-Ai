import { motion } from "motion/react";
import { Sparkles, LayoutDashboard, Columns, FileText, Brush, CalendarRange } from "lucide-react";

const featuresData = [
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Turn fuzzy ideas into tasks, plans, and next steps in seconds.",
    colorClass: "bg-[#FAF2EC] text-[#c67f43]",
  },
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description: "Tasks, calendar, notes, and AI activity in one calm command center.",
    colorClass: "bg-[#EAF7ED] text-[#15803D]",
  },
  {
    icon: Columns,
    title: "Kanban Boards",
    description: "Flexible task boards built for personal and team flow.",
    colorClass: "bg-[#E0F2FE] text-[#0369A1]",
  },
  {
    icon: FileText,
    title: "Notion-style Notes",
    description: "Structured editor for specs, research, and deep work.",
    colorClass: "bg-[#F1EAFA] text-[#7C3AED]",
  },
  {
    icon: Brush,
    title: "Visual Whiteboard",
    description: "Map ideas and sketch workflows on an infinite canvas.",
    colorClass: "bg-[#FCF5F0] text-[#EA580C]",
  },
  {
    icon: CalendarRange,
    title: "Calendar & Reminders",
    description: "Schedule priorities and keep upcoming work visible.",
    colorClass: "bg-[#FEF3C7] text-[#D97706]",
  },
];

const stepsData = [
  {
    number: "01",
    title: "Organize",
    description: "Bring notes, tasks, and calendars into one shared system.",
  },
  {
    number: "02",
    title: "Create with AI",
    description: "Ask for task lists, summaries, diagrams, and templates.",
  },
  {
    number: "03",
    title: "Collaborate",
    description: "Share boards, track progress, and keep momentum alive.",
  },
];

export default function Features() {
  return (
    <section id="features-section" className="py-20 bg-white border-t border-[#F0EBE5]/60">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c67f43] font-sans">
            Features
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#221C18] leading-tight">
            Everything your team needs to think and ship
          </h2>
          <p className="text-[#5D554F] text-[15px] sm:text-[16px] leading-relaxed">
            Planning, writing, visual thinking, AI generation, and collaboration in one polished workspace.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {featuresData.map((feature, i) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4, shadow: "0 10px 30px rgba(0,0,0,0.04)" }}
                className="bg-[#FAF8F5] border border-[#F3EFE9]/80 rounded-2xl p-6 md:p-8 flex flex-col items-start text-left transition-all group cursor-pointer"
              >
                {/* Icon Circle */}
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-5 ${feature.colorClass} shadow-sm group-hover:scale-105 transition-transform`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-[#221C18] mb-2 font-sans">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-[#5D554F] text-[14px] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Steps Horizontal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#FAF8F5] border border-[#F1EFE9] rounded-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative overflow-hidden"
        >
          {stepsData.map((step, idx) => (
            <div key={idx} className="flex flex-col items-start text-left space-y-3 relative">
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif text-3xl font-bold text-[#c67f43]/40">
                  {step.number}
                </span>
                <span className="font-sans font-bold text-[16px] text-[#221C18]">
                  {step.title}
                </span>
              </div>
              <p className="text-[#5D554F] text-[13.5px] leading-relaxed">
                {step.description}
              </p>
              {idx < stepsData.length - 1 && (
                <div className="hidden md:block absolute right-[-24px] top-4 w-[1px] h-12 bg-[#F1EFE9]" />
              )}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
