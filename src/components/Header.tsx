import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "./Router";
import { Menu, X, LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../lib/authStore";

export default function Header() {
  const { currentPath, navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, currentUser, logout } = useAuth();

  const navItems = [
    { label: "Home", path: "/home" },
    { label: "About", path: "/about" },
    { label: "Pricing", path: "/price" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="w-full bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-50 py-4 border-b border-[#F0EBE5]/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer" 
          onClick={() => navigate("/home")}
        >
          <div className="w-8 h-8 rounded-lg bg-[#c67f43] flex items-center justify-center shadow-sm">
            {/* Geometric custom SVG flower/star icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
            </svg>
          </div>
          <span className="font-sans font-bold text-xl text-[#221C18] tracking-tight">Flowbase</span>
        </div>

        {/* Navigation Menu (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#5E554E]">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`transition-colors cursor-pointer relative py-1 ${
                  isActive ? "text-[#c67f43] font-semibold" : "hover:text-[#c67f43]"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c67f43] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-xs text-stone-500 font-semibold bg-[#FAF2EC] px-3 py-1.5 rounded-full">
                {currentUser?.name}
              </span>
              <motion.button
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#c67f43] hover:bg-[#b06f38] text-white text-[13px] sm:text-[14px] font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                Get Started <span className="text-[14px] sm:text-[15px]">→</span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  logout();
                  navigate("/home");
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                title="Logout"
                className="bg-stone-100 hover:bg-stone-200 text-stone-600 p-2 sm:p-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[#c67f43] hover:bg-[#FAF2EC] border border-[#F4E3D4] text-[13px] sm:text-[14px] font-semibold px-3.5 sm:px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </motion.button>

              <motion.button
                onClick={() => navigate("/signup")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#c67f43] hover:bg-[#b06f38] text-white text-[13px] sm:text-[14px] font-bold px-3.5 sm:px-4.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </motion.button>
            </div>
          )}

          {/* Hamburger Icon for Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 md:hidden text-stone-600 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-[#FAF8F5] border-t border-[#F0EBE5]/50 px-6 py-4 space-y-3 flex flex-col items-start"
          >
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 text-[15px] font-semibold transition-colors ${
                    isActive ? "text-[#c67f43]" : "text-[#5E554E] hover:text-[#c67f43]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
