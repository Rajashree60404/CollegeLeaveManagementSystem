
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";

import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Loader2,
  Moon,
  Sun,
  RefreshCw,
  KeyRound,
  Sparkles,
} from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("clms-theme") === "dark"
  );

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Theme Management
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    localStorage.setItem(
      "clms-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Common Axios API request handler
  const sendRequest = async (endpoint, body) => {
    try {
      const response = await api.post(endpoint, body);
      return response.data;
    } catch (error) {
      console.error("API Request Error:", error.response || error);

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    console.log("Forgot password button clicked");
    console.log("Sending OTP to:", email.trim());

    try {
      const result = await sendRequest(
        "/staffs/forgot-password",
        {
          email: email.trim(),
        }
      );

      console.log("Forgot password API response:", result);

      setMessage("OTP sent successfully to your email.");
      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const result = await sendRequest(
        "/staffs/verify-otp",
        {
          email: email.trim(),
          otp: otp.trim(),
        }
      );

      console.log("OTP verification response:", result);

      setMessage("OTP verified successfully.");
      setStep(3);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password Validation
  const validatePassword = () => {
    if (newPassword.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(newPassword)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(newPassword)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(newPassword)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(newPassword)) {
      return "Password must contain at least one special character.";
    }

    if (newPassword !== confirmPassword) {
      return "New password and confirm password do not match.";
    }

    return "";
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    clearMessages();

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await sendRequest(
        "/staffs/reset-password",
        {
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }
      );

      console.log("Password reset response:", result);

      setMessage("Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    clearMessages();
    setLoading(true);

    try {
      const result = await sendRequest(
        "/staffs/forgot-password",
        {
          email: email.trim(),
        }
      );

      console.log("Resend OTP response:", result);

      setOtp("");
      setMessage("A new OTP has been sent to your email.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    {
      label: "At least 8 characters",
      valid: newPassword.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(newPassword),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(newPassword),
    },
    {
      label: "One special character",
      valid: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(newPassword),
    },
    {
      label: "Passwords match",
      valid:
        newPassword.length > 0 &&
        newPassword === confirmPassword,
    },
  ];

  const steps = [
    { number: 1, label: "Email", icon: Mail },
    { number: 2, label: "Verification", icon: ShieldCheck },
    { number: 3, label: "New Password", icon: KeyRound },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-slate-50 to-orange-100 px-4 py-10 transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10"
        />

        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-orange-200/40 to-transparent dark:via-slate-700/30" />

      </div>

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={() => setDarkMode((prev) => !prev)}
        aria-label="Toggle dark or light mode"
        className="fixed right-5 top-5 z-30 rounded-full border border-slate-200 bg-white/90 p-3 text-slate-700 shadow-lg backdrop-blur-md transition duration-300 hover:scale-110 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-orange-400"
      >
        {darkMode ? <Sun size={21} /> : <Moon size={21} />}
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg">

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-7 text-center"
        >

          <div className="mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-xl shadow-orange-500/30">
            <GraduationCap size={43} />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            CLMS<span className="text-orange-500">.</span>
          </h1>

          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            College Leave Management System
          </p>

        </motion.div>

        {/* Recovery Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/95 p-7 shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:p-9 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
        >

          {/* Top Gradient */}
          <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

          {/* Card Heading */}
          <div className="mb-8">

            <div className="mb-4 flex items-center justify-between">

              <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400">
                Account Recovery
              </span>

              <Sparkles size={19} className="text-orange-400" />

            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {step === 1 && (
                    <>
                      Forgot <span className="text-orange-500">Password?</span>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      Verify <span className="text-orange-500">OTP</span>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      Create <span className="text-orange-500">Password</span>
                    </>
                  )}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {step === 1 &&
                    "No worries! Enter your registered staff email address and we'll help you recover your account."}

                  {step === 2 &&
                    "We've sent a verification code to your registered email. Enter it below to continue."}

                  {step === 3 &&
                    "Choose a strong new password to protect your staff account."}
                </p>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Progress Indicator */}
          <div className="mb-8">

            <div className="mb-3 flex items-center justify-between">

              {steps.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.number}
                    className="flex flex-col items-center gap-2"
                  >

                    <motion.div
                      animate={{
                        scale: step === item.number ? 1.08 : 1,
                      }}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
                        step >= item.number
                          ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      {step > item.number ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Icon size={19} />
                      )}
                    </motion.div>

                    <span
                      className={`text-[10px] font-bold sm:text-xs ${
                        step >= item.number
                          ? "text-orange-500"
                          : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </span>

                  </div>
                );
              })}

            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                animate={{
                  width: `${(step / 3) * 100}%`,
                }}
                transition={{ duration: 0.4 }}
              />

            </div>

          </div>

          {/* Alerts */}
          <AnimatePresence mode="wait">

            {(error || message) && (
              <motion.div
                key={error || message}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                  error
                    ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                }`}
              >

                {error ? (
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                )}

                <span className="leading-5">
                  {error || message}
                </span>

              </motion.div>
            )}

          </AnimatePresence>

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSendOtp}
              className="space-y-6"
            >

              <div>

                <label className="mb-2.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Registered Email Address
                </label>

                <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">

                  <Mail
                    size={20}
                    className="shrink-0 text-orange-500"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearMessages();
                    }}
                    placeholder="Enter your staff email"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent py-4 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white"
                  />

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use the email address registered with your institution.
                </p>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send Verification OTP
                    <ArrowRight
                      size={19}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </motion.form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >

              <div>

                <label className="mb-2.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Enter Verification Code
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">

                  <ShieldCheck
                    size={21}
                    className="shrink-0 text-orange-500"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      );
                      clearMessages();
                    }}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    required
                    className="w-full bg-transparent py-4 text-center text-2xl font-extrabold tracking-[0.6em] text-slate-900 outline-none placeholder:text-slate-300 placeholder:tracking-[0.3em] dark:text-white"
                  />

                </div>

                <div className="mt-4 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/20">

                  <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Verification code sent to:
                  </p>

                  <p className="mt-1 break-all text-sm font-bold text-orange-600 dark:text-orange-400">
                    {email}
                  </p>

                </div>

              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight size={19} />
                  </>
                )}

              </button>

              <div className="flex flex-wrap items-center justify-between gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    clearMessages();
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-orange-500 dark:text-slate-400"
                >
                  <ArrowLeft size={15} />
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-sm font-bold text-orange-500 transition hover:text-orange-600 disabled:opacity-50"
                >
                  <RefreshCw size={15} />
                  Resend OTP
                </button>

              </div>

            </motion.form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleResetPassword}
              className="space-y-5"
            >

              {/* New Password */}
              <div>

                <label className="mb-2.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  New Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">

                  <Lock
                    size={20}
                    className="shrink-0 text-orange-500"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      clearMessages();
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                    className="text-slate-400 transition hover:text-orange-500"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}
              <div>

                <label className="mb-2.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Confirm New Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">

                  <Lock
                    size={20}
                    className="shrink-0 text-orange-500"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearMessages();
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label="Toggle confirm password visibility"
                    className="text-slate-400 transition hover:text-orange-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>

              {/* Password Requirements */}
              <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/70">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Password Requirements
                  </p>

                  <ShieldCheck
                    size={17}
                    className="text-orange-500"
                  />

                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  {passwordRules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs font-medium transition ${
                        rule.valid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >

                      <CheckCircle2
                        size={15}
                        className={
                          rule.valid
                            ? "text-emerald-500"
                            : "text-slate-300 dark:text-slate-600"
                        }
                      />

                      {rule.label}

                    </div>
                  ))}

                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight
                      size={19}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </motion.form>
          )}

          {/* Footer */}
          <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">

            <div className="mb-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              Secure staff account recovery
            </div>

            <Link
              to="/login"
              className="group flex items-center justify-center gap-2 text-sm font-bold text-orange-500 transition hover:text-orange-600"
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to Staff Login
            </Link>

          </div>

        </motion.div>

        {/* Bottom Branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-7 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-600"
        >
          © {new Date().getFullYear()} CLMS · All Rights Reserved
        </motion.p>

      </div>

    </div>
  );
}
