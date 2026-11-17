
import { useState } from "react";
import api from "../services/api";

import { useNavigate, Link } from "react-router-dom";

import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Loader2,
} from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    console.log("Forgot password button clicked");
    console.log("Sending OTP to:", email.trim());

    try {
      const result = await sendRequest(
        "/students/forgot-password",
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

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const result = await sendRequest(
        "/students/verify-otp",
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

  // Password validation
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

    setError("");
    setMessage("");

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await sendRequest(
        "/students/reset-password",
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
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await sendRequest(
        "/students/forgot-password",
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 transition-colors dark:bg-slate-950">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <GraduationCap size={34} />
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            CLMS
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            College Leave Management System
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">

          {/* Back to Login */}
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400"
          >
            <ArrowLeft size={17} />
            Back to Login
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === 1
                ? "Forgot Password?"
                : step === 2
                ? "Verify OTP"
                : "Create New Password"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {step === 1
                ? "Enter your registered email address. We will send you an OTP to reset your password."
                : step === 2
                ? "Enter the 6-digit OTP sent to your registered email address."
                : "Create a strong new password for your student account."}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className={`h-2 flex-1 rounded-full transition ${
                  step >= number
                    ? "bg-orange-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>

              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Registered Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowLeft
                      size={18}
                      className="rotate-180"
                    />
                  </>
                )}
              </button>

            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>

              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Enter 6-Digit OTP
              </label>

              <div className="relative">
                <ShieldCheck
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter OTP"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-center text-lg font-bold tracking-[0.5em] text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="mt-4 w-full text-center text-sm font-semibold text-orange-600 transition hover:text-orange-700 disabled:opacity-50"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                Change email address
              </button>

            </form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>

              {/* New Password */}
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {/* Password Rules */}
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Password must contain:
                <ul className="ml-4 list-disc">
                  <li>At least 8 characters</li>
                  <li>One uppercase and one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>

              {/* Confirm Password */}
              <label className="mb-2 mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

            </form>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © College Leave Management System · CLMS
        </p>

      </div>
    </div>
  );
}
