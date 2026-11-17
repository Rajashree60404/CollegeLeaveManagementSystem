
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../services/api";

import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

// Login validation
const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),

  password: Yup.string()
    .required("Password is required."),
});

// Initial password setup validation
const setupSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .required("Registered email is required."),

  password: Yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .matches(/[A-Za-z]/, "Password must contain at least one letter.")
    .matches(/[0-9]/, "Password must contain at least one number.")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character."
    )
    .required("Password is required."),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match.")
    .required("Please confirm your password."),
});

export default function StudentLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(
    searchParams.get("setup") === "true" ? "setup" : "login"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("setup") === "true") {
      setMode("setup");
    }
  }, [searchParams]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema:
      mode === "setup" ? setupSchema : loginSchema,

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      clearMessages();

      try {
        if (mode === "login") {
          // Student login API
          const response = await api.post("/students/login", {
            email: values.email.trim(),
            password: values.password,
          });

          // Supports ResponseStructure and direct response
          const result = response.data?.data ?? response.data;

          if (!result || !result.token) {
            throw new Error(
              "Login response does not contain student details or JWT token."
            );
          }

          // Store student details and JWT token
          sessionStorage.setItem(
            "student",
            JSON.stringify(result)
          );

          sessionStorage.setItem("token", result.token);

          // Clear any old staff session
          sessionStorage.removeItem("staff");

          setMessage("Login successful! Opening your dashboard...");

          navigate("/dashboard", { replace: true });

        } else {
          // Initial password setup API
          await api.post("/students/set-initial-password", {
            email: values.email.trim(),
            password: values.password,
            confirmPassword: values.confirmPassword,
          });

          setMessage(
            "Your password has been created successfully. You can now log in."
          );

          resetForm();

          setMode("login");

          navigate("/login", { replace: true });
        }

      } catch (err) {
        console.error(
          "Student authentication error:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message ||
          err.message ||
          (mode === "setup"
            ? "Unable to set your password. Please try again."
            : "Login failed. Please check your email and password.")
        );

      } finally {
        setSubmitting(false);
      }
    },
  });

  const switchMode = (nextMode) => {
    clearMessages();

    formik.resetForm({
      values: {
        email: formik.values.email,
        password: "",
        confirmPassword: "",
      },
    });

    setMode(nextMode);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-900";

  const errorClass =
    "mt-1.5 text-xs font-medium text-red-500";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left welcome section */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 p-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-orange-800/10" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <GraduationCap size={34} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold">CLMS</h1>
              <p className="text-sm text-orange-50">
                College Leave Management System
              </p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
              Student Portal
            </span>

            <h2 className="mt-7 text-5xl font-extrabold leading-tight">
              Your college life,
              <br />
              managed simply.
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-orange-50">
              Access your student details, apply for leave, and track your
              leave requests securely in one place.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "View your student information",
                "Apply for leave and track approval",
                "Manage your account securely",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <ShieldCheck size={21} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-sm text-orange-50">
            © {new Date().getFullYear()} CLMS. Student access portal.
          </p>
        </section>

        {/* Login and password setup section */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-orange-500 p-3 text-white">
                <GraduationCap size={28} />
              </div>

              <div>
                <h1 className="text-xl font-extrabold">CLMS</h1>
                <p className="text-xs text-slate-500">
                  Student Portal
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-5 inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                {mode === "setup" ? (
                  <KeyRound size={29} />
                ) : (
                  <LockKeyhole size={29} />
                )}
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight">
                {mode === "setup"
                  ? "Create your password"
                  : "Welcome back"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {mode === "setup"
                  ? "Enter your registered email and create a password to activate your student account."
                  : "Sign in with your registered student email and password to continue."}
              </p>
            </div>

            {/* Success message */}
            {message && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
              >
                {message}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={formik.handleSubmit}
              noValidate
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="student-email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Registered email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="student-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="student@example.com"
                    className={inputClass}
                  />
                </div>

                {formik.touched.email && formik.errors.email && (
                  <p className={errorClass}>
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="student-password"
                  className="mb-2 block text-sm font-semibold"
                >
                  {mode === "setup" ? "Create password" : "Password"}
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="student-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "setup"
                        ? "new-password"
                        : "current-password"
                    }
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={
                      mode === "setup"
                        ? "Create a password"
                        : "Enter your password"
                    }
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {formik.touched.password && formik.errors.password && (
                  <p className={errorClass}>
                    {formik.errors.password}
                  </p>
                )}

                {mode === "setup" && (
                  <p className="mt-2 text-xs text-slate-500">
                    At least 8 characters, including a letter, number and special character.
                  </p>
                )}
              </div>

              {/* Confirm password */}
              {mode === "setup" && (
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Re-enter your password"
                      className={inputClass}
                    />
                  </div>

                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <p className={errorClass}>
                        {formik.errors.confirmPassword}
                      </p>
                    )}
                </div>
              )}

              {/* Forgot password */}
              {mode === "login" && (
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formik.isSubmitting
                  ? "Please wait..."
                  : mode === "setup"
                    ? "Create Account"
                    : "Login to Student Portal"}

                {!formik.isSubmitting && <ArrowRight size={19} />}
              </button>
            </form>

            {/* Switch mode */}
            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400">
                STUDENT ACCOUNT
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {mode === "setup"
                ? "Already created your password?"
                : "First time accessing CLMS?"}{" "}

              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "setup" ? "login" : "setup")
                }
                className="font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                {mode === "setup" ? "Login" : "Set up password"}
              </button>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Your account must be registered by college staff before you can
              create your password or log in.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
