import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  CreditCard, 
  Tag, 
  Settings as Gear, 
  Sliders, 
  ShieldAlert, 
  Key, 
  Shield, 
  Edit3, 
  Check, 
  HelpCircle,
  Bell,
  Cpu
} from "lucide-react";

export default function WorkspaceSettings() {
  const [activeSubTab, setActiveSubTab] = useState<
    "Profile" | "Subscription" | "Categories" | "AI Settings" | "Preferences" | "Privacy"
  >("Profile");

  // Profile fields matching screenshot
  const [profileName, setProfileName] = useState("Saloni Avhad");
  const [profileEmail, setProfileEmail] = useState("gameplayapp007@gmail.com");
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Additional mock values
  const [selectedPlan, setSelectedPlan] = useState("Pro tier Developer");
  const [aiModel, setAiModel] = useState("Gemini 1.5 Flash (Default)");
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const menuOptions = [
    { label: "Profile", icon: User },
    { label: "Subscription", icon: CreditCard },
    { label: "Categories", icon: Tag },
    { label: "AI Settings", icon: Cpu },
    { label: "Preferences", icon: Sliders },
    { label: "Privacy", icon: Shield },
  ];

  return (
    <div id="workspace-settings" className="p-6 md:p-8 bg-[#FAF8F5] min-h-[calc(100vh-60px)] flex flex-col space-y-6">
      
      {/* Page Title & Subtitle matching layout exactly */}
      <div className="text-left">
        <h1 className="font-serif text-3xl font-bold text-[#221C18]">Tune your Flowbase workspace.</h1>
        <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-xl mt-1">
          Manage profile, plan, categories, AI defaults, privacy, and the little preferences that make the app feel like yours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sub-Tab Navigation Bar */}
        <div className="lg:col-span-3 bg-white border border-[#EFECE6] rounded-2xl p-3 shadow-2xs space-y-1 text-left">
          {menuOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = activeSubTab === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => setActiveSubTab(opt.label as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-[#FAF2EC] text-[#c67f43]"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-[#c67f43]" : "text-stone-400"}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Viewer */}
        <div className="lg:col-span-9 bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-2xs text-left">
          <AnimatePresence mode="wait">
            
            {/* PROFILE SELECTED VIEW */}
            {activeSubTab === "Profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="space-y-6"
              >
                <div className="pb-3 border-b border-[#FAF8F5]">
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Profile Configuration</h3>
                  <p className="text-xs text-stone-400 font-medium">Update your profile info card easily.</p>
                </div>

                {/* Main user profile block (matching screenshot) */}
                <div className="bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#1F5A37] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xs relative">
                      S
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#27C93F] border-2 border-white" />
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleProfileSave} className="space-y-2">
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="bg-white border border-[#EFECE6] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#E05A47]"
                        />
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="bg-white border border-[#EFECE6] rounded-lg px-2.5 py-1 text-xs block focus:outline-none focus:border-[#E05A47]"
                        />
                      </form>
                    ) : (
                      <div className="text-left">
                        <h4 className="text-base font-bold text-[#221C18]">{profileName}</h4>
                        <p className="text-xs text-stone-400 font-medium">{profileEmail}</p>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <button
                      onClick={handleProfileSave}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#E05A47] hover:bg-[#c64f3c] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit profile
                    </button>
                  )}
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Profile settings successfully saved offline!</span>
                  </div>
                )}

                {/* Grid of the two specific cards from the screenshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account security card */}
                  <div className="bg-[#FFFDF9] border border-[#EFECE6] p-5 rounded-2xl flex items-start gap-4 text-left shadow-3xs">
                    <div className="p-3 bg-[#FAF2EC] text-[#c67f43] rounded-xl border border-[#F4E3D4]">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Account security</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-semibold mt-1">
                        Manage sign-in methods, sessions, and MFA through Clerk.
                      </p>
                    </div>
                  </div>

                  {/* Workspace privacy card */}
                  <div className="bg-[#FFFDF9] border border-[#EFECE6] p-5 rounded-2xl flex items-start gap-4 text-left shadow-3xs">
                    <div className="p-3 bg-[#FAF2EC] text-[#c67f43] rounded-xl border border-[#F4E3D4]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Workspace privacy</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-semibold mt-1">
                        Keep sensitive previews quieter with privacy mode.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUBSCRIPTION VIEW */}
            {activeSubTab === "Subscription" && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="space-y-4"
              >
                <div className="pb-3 border-b border-[#FAF8F5]">
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Workspace Subscription</h3>
                  <p className="text-xs text-stone-400 font-medium">Verify your payment tiers and team licensing.</p>
                </div>

                <div className="p-5 bg-stone-50 border border-[#EFECE6] rounded-xl text-left space-y-2">
                  <span className="text-[10px] font-bold text-[#c67f43] bg-[#FAF2EC] px-2 py-0.5 rounded-full uppercase tracking-wider">Active Plan</span>
                  <h4 className="text-lg font-serif font-bold text-[#221C18]">{selectedPlan}</h4>
                  <p className="text-xs text-stone-400">Next renewal date is August 20th, 2026 for $15/month.</p>
                </div>
              </motion.div>
            )}

            {/* CATEGORIES VIEW */}
            {activeSubTab === "Categories" && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="space-y-4"
              >
                <div className="pb-3 border-b border-[#FAF8F5]">
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Workspace Categories</h3>
                  <p className="text-xs text-stone-400 font-medium">Coordinate classifications for tasks and pages.</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {["Productivity", "Marketing", "Sponsorships", "Whiteboard Drafts", "Design Labs"].map((cat) => (
                    <span key={cat} className="text-xs font-bold bg-[#FAF2EC] border border-[#F4E3D4] text-[#c67f43] px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-3xs">
                      <Tag className="w-3 h-3 text-[#c67f43]" /> {cat}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI SETTINGS VIEW */}
            {activeSubTab === "AI Settings" && (
              <motion.div
                key="ai-settings"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="space-y-4"
              >
                <div className="pb-3 border-b border-[#FAF8F5]">
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">AI Assistant defaults</h3>
                  <p className="text-xs text-stone-400 font-medium">Fine-tune the model behavior in the workspace chatbot.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Default Agent Engine</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="bg-stone-50 border border-[#EFECE6] rounded-lg px-3 py-2 text-xs text-stone-700 focus:outline-none w-full"
                  >
                    <option>Gemini 1.5 Flash (Default)</option>
                    <option>Gemini 1.5 Pro (Workspace Expert)</option>
                    <option>Flowbase Custom Agent</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* PREFERENCES VIEW */}
            {activeSubTab === "Preferences" && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="space-y-4"
              >
                <div className="pb-3 border-b border-[#FAF8F5]">
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Workspace Preferences</h3>
                  <p className="text-xs text-stone-400 font-medium">Personalize sound triggers, default views, and offline capabilities.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl">
                    <span className="text-xs font-bold text-[#221C18]">Enable sound effects on task completion</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#c67f43] focus:ring-[#c67f43]" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#EFECE6] rounded-xl">
                    <span className="text-xs font-bold text-[#221C18]">Keep unscheduled drafts pinned on Dashboard</span>
                    <input type="checkbox" defaultChecked className="rounded text-[#c67f43] focus:ring-[#c67f43]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRIVACY VIEW */}
            {activeSubTab === "Privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="space-y-4"
              >
                <div className="pb-3 border-b border-[#FAF8F5]">
                  <h3 className="font-serif text-lg font-bold text-[#221C18]">Workspace Privacy</h3>
                  <p className="text-xs text-stone-400 font-medium">Configure document permissions and public link sharings.</p>
                </div>

                <div className="p-4 bg-stone-50 border border-[#EFECE6] rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#221C18]">Workspace Privacy Mode</h4>
                    <p className="text-[10px] text-stone-400 font-medium mt-0.5">Toggle to blur names in shareable previews.</p>
                  </div>
                  <button
                    onClick={() => setPrivacyMode(!privacyMode)}
                    className={`px-3 py-1 rounded-md text-xs font-bold ${
                      privacyMode ? "bg-[#c67f43] text-white" : "bg-white border border-[#EFECE6] text-stone-600"
                    }`}
                  >
                    {privacyMode ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
