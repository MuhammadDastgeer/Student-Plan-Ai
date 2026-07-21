import React, { useState } from "react";
import { motion } from "motion/react";
import { authStore } from "../lib/authStore";
import { useRouter } from "./Router";
import { Eye, EyeOff, Mail, Lock, KeyRound, CornerDownLeft, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginView() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sub-modes for forgot password and verification
  const [mode, setMode] = useState<"login" | "forgot" | "verify">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Forgot Password Steps & Input States
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Resend Verification Steps & Code States
  const [verifyStep, setVerifyStep] = useState<"request" | "enter_code">("request");
  const [resendCode, setResendCode] = useState("");
  const [inputCode, setInputCode] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    // Attempt login (using simple password string as hash for local simulation)
    const result = authStore.loginUser(email, password);
    if (result.success) {
      setSuccess("Successfully logged in! Redirecting to your workspace...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setError(result.error || "Login failed.");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (forgotStep === "request") {
      if (!forgotEmail.trim()) {
        setError("Please enter your email address.");
        return;
      }

      setActionLoading(true);
      setTimeout(() => {
        setActionLoading(false);
        const users = authStore.getRegisteredUsers();
        if (!users[forgotEmail.trim().toLowerCase()]) {
          setError("This email address is not registered with Flowbase.");
          return;
        }
        setForgotStep("reset");
        setSuccess("Email verified! Please enter your new secure password below.");
      }, 800);
    } else {
      if (!newPassword || !confirmNewPassword) {
        setError("Please enter both fields.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("Passwords do not match. Please verify.");
        return;
      }
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      setActionLoading(true);
      setTimeout(() => {
        setActionLoading(false);
        const result = authStore.resetPassword(forgotEmail, newPassword);
        if (result.success) {
          setSuccess("Success! Your password has been updated. Please login with your new credentials.");
          setMode("login");
          setForgotStep("request");
          setForgotEmail("");
          setNewPassword("");
          setConfirmNewPassword("");
        } else {
          setError(result.error || "Password reset failed.");
        }
      }, 800);
    }
  };

  const handleResendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (verifyStep === "request") {
      if (!verifyEmail.trim()) {
        setError("Please enter your registered email address.");
        return;
      }

      setActionLoading(true);
      setTimeout(() => {
        setActionLoading(false);
        const users = authStore.getRegisteredUsers();
        if (!users[verifyEmail.trim().toLowerCase()]) {
          setError("This email address is not registered with Flowbase.");
          return;
        }
        const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
        setResendCode(generatedCode);
        setVerifyStep("enter_code");
        setSuccess(`Verification code generated successfully! Enter verification code: ${generatedCode}`);
      }, 800);
    } else {
      if (!inputCode.trim()) {
        setError("Please enter the verification code.");
        return;
      }
      if (inputCode.trim() !== resendCode) {
        setError("Invalid code. Please enter the exact code provided in green above.");
        return;
      }

      setActionLoading(true);
      setTimeout(() => {
        setActionLoading(false);
        setSuccess("Thank you! Your email address is now verified. You can now login.");
        setMode("login");
        setVerifyStep("request");
        setVerifyEmail("");
        setInputCode("");
      }, 800);
    }
  };

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
        <div className="flex items-center gap-2.5 mb-8 cursor-pointer justify-center" onClick={() => navigate("/home")}>
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

        {/* LOGIN MODE */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#221C18] tracking-tight">Assalam-o-Alaikum! Welcome Back</h2>
              <p className="text-xs text-stone-400 font-medium mt-1">Sign in with your email to access your workspace.</p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Email */}
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] font-semibold text-[#c67f43] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
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
            </div>

            <button
              type="submit"
              className="w-full bg-[#c67f43] hover:bg-[#b06f38] text-white text-xs font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Sign In to Flowbase
            </button>

            <div className="pt-2 flex flex-col gap-2 items-center">
              <p className="text-xs text-stone-400 font-semibold">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-[#c67f43] hover:underline font-bold cursor-pointer"
                >
                  Create one for free
                </button>
              </p>

              <button
                type="button"
                onClick={() => setMode("verify")}
                className="text-[11px] font-bold text-stone-500 hover:text-[#c67f43] transition-colors hover:underline cursor-pointer flex items-center gap-1.5 mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Didn't receive verification email?
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#221C18] tracking-tight">Reset Password</h2>
              <p className="text-xs text-stone-400 font-medium mt-1">
                {forgotStep === "request" 
                  ? "Enter your email address and we'll verify your registered account."
                  : "Set your new account password below."}
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {forgotStep === "request" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Your Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-400">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">New Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-400">
                        <Lock className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Confirm New Password</label>
                      {confirmNewPassword && (
                        <span className={`text-[10px] font-bold uppercase ${newPassword === confirmNewPassword ? "text-emerald-600" : "text-amber-500"}`}>
                          {newPassword === confirmNewPassword ? "Match" : "No Match"}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-400">
                        <Lock className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        required
                        placeholder="Repeat new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-[#1C1510] hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {actionLoading ? "Processing..." : forgotStep === "request" ? "Verify Registered Email" : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setForgotStep("request");
              }}
              className="w-full text-center text-xs font-bold text-[#c67f43] hover:underline cursor-pointer flex items-center justify-center gap-1.5 pt-2"
            >
              <CornerDownLeft className="w-4 h-4" /> Back to Sign In
            </button>
          </form>
        )}

        {/* EMAIL VERIFICATION RESEND MODE */}
        {mode === "verify" && (
          <form onSubmit={handleResendVerification} className="space-y-5">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#221C18] tracking-tight">Email Verification</h2>
              <p className="text-xs text-stone-400 font-medium mt-1">
                {verifyStep === "request"
                  ? "Enter your registered email to resend an activation code."
                  : "Enter the activation code provided in the green box."}
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {verifyStep === "request" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Your Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-400">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Activation Code</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-400">
                      <KeyRound className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Enter 4-digit code"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full bg-stone-50 border border-[#EFECE6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#221C18] focus:outline-none focus:border-[#c67f43] focus:bg-white transition-all font-medium tracking-widest text-center font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-[#1C1510] hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {actionLoading ? "Processing..." : verifyStep === "request" ? "Resend Activation Code" : "Verify Activation Code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setVerifyStep("request");
              }}
              className="w-full text-center text-xs font-bold text-[#c67f43] hover:underline cursor-pointer flex items-center justify-center gap-1.5 pt-2"
            >
              <CornerDownLeft className="w-4 h-4" /> Back to Sign In
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
