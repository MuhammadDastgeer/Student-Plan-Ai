import React, { useState } from "react";
import { motion } from "motion/react";
import { authStore } from "../lib/authStore";
import { useRouter } from "./Router";
import { Eye, EyeOff, User, Mail, Lock, Check, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupView() {
  const { navigate } = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const result = authStore.registerUser(name, email, password);
    if (result.success) {
      setSuccess("Account successfully created! Preparing your custom workspace...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setError(result.error || "Signup failed.");
    }
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF8F5] py-12 px-6 flex items-center justify-center text-left font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-[#EFECE6] rounded-2xl p-8 shadow-xs relative overflow-hidden"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAF2EC] rounded-full blur-3xl -z-10" />

        {/* LOGO */}
        <div className="flex items-center gap-2.5 mb-6 cursor-pointer justify-center" onClick={() => navigate("/home")}>
          <div className="w-8 h-8 rounded-lg bg-[#c67f43] flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5 text-white">
              <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
            </svg>
          </div>
          <span className="font-bold text-xl text-[#221C18] tracking-tight">Flowbase</span>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-red-50 border border-red-200/60 rounded-xl text-red-800 text-xs font-semibold flex items-start gap-2.5"
          >
            <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-green-50 border border-green-200/60 rounded-xl text-green-900 text-xs font-semibold flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-green-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#221C18] tracking-tight">Create your Account</h2>
            <p className="text-xs text-stone-400 font-medium mt-1">Get access to your private workspace, notes, study groups & library.</p>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Confirm Password</label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${passwordsMatch ? "text-emerald-600" : "text-amber-500"}`}>
                    {passwordsMatch ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Passwords Match
                      </>
                    ) : (
                      "Not Matching"
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
          >
            Create Free Account
          </button>

          <p className="text-center text-xs text-stone-400 font-semibold pt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#c67f43] hover:underline font-bold cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
