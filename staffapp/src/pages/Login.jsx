
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

import {
  Formik,
  Form,
  ErrorMessage,
} from "formik";

import * as Yup from "yup";

import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Moon,
  Sun,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";



export default function StaffLogin() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("clms-theme") === "dark"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  // Theme Management
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    localStorage.setItem(
      "clms-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Yup Validation Schema
  const loginSchema = Yup.object({
    email: Yup.string()
      .trim()
      .email("Please enter a valid email address")
      .required("Email address is required"),

    password: Yup.string()
      .required("Password is required")
      .test(
        "not-empty",
        "Password cannot contain only spaces",
        (value) => !!value && value.trim().length > 0
      ),
  });

  // Login API Function
  const handleLogin = async (values, { setSubmitting }) => {
    setApiError("");

    try {
      const response = await api.post("/staffs/login", {
        email: values.email.trim(),
        password: values.password,
      });

      const staff = response.data?.data;

      if (!staff) {
        setApiError("Staff details were not found.");
        return;
      }

      // Store Staff Details
      sessionStorage.setItem(
        "staff",
        JSON.stringify(staff)
      );

      // Store JWT Token
      if (staff.token) {
        sessionStorage.setItem("token", staff.token);
        sessionStorage.setItem("staff", JSON.stringify(response.data.data));
      }

      // Navigate to Dashboard
     // Navigate to Staff Dashboard
navigate("/staff/dashboard", { replace: true });

    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-slate-100 to-orange-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10" />

      {/* Theme Toggle */}
      <div className="fixed right-5 top-5 z-20">
        <button
          type="button"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle dark or light mode"
          className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-md transition duration-300 hover:scale-105 hover:bg-orange-50 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-orange-400 dark:hover:bg-slate-700"
        >
          {darkMode ? <Sun size={21} /> : <Moon size={21} />}
        </button>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-7 shadow-2xl shadow-slate-300/40 backdrop-blur-xl sm:p-10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
      >

        {/* Orange Top Line */}
        <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

        {/* Header */}
        <div className="mb-8 text-center">

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-xl shadow-orange-500/30"
          >
            <GraduationCap size={42} />
          </motion.div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Staff <span className="text-orange-500">Login</span>
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Welcome back! Sign in to manage student leave requests.
          </p>
        </div>

        {/* Formik Component */}
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >

          {({ values, handleChange, handleBlur, isSubmitting }) => (

            <Form className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">

                  <Mail size={19} className="shrink-0 text-orange-500" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your mail"
                    autoComplete="username"
                    value={values.email}
                    onChange={(e) => {
                      setApiError("");
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    className="w-full bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                </div>

                <ErrorMessage
                  name="email"
                  component="p"
                  className="mt-2 text-xs font-medium text-red-500"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">

                  <LockKeyhole size={19} className="shrink-0 text-orange-500" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={(e) => {
                      setApiError("");
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    className="w-full bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="text-slate-400 transition hover:text-orange-500"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <ErrorMessage
                  name="password"
                  component="p"
                  className="mt-2 text-xs font-medium text-red-500"
                />

                {/* Forgot Password */}
                <div className="mt-3 flex justify-end">
                  <Link
                    to="/staff/forgot-password"
                    className="text-sm font-semibold text-orange-500 transition hover:text-orange-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  {apiError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:shadow-orange-500/30 focus:outline-none focus:ring-4 focus:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}

                {!isSubmitting && (
                  <ArrowRight
                    size={19}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>

            </Form>
          )}
        </Formik>

        {/* Footer */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center dark:border-slate-800">

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ShieldCheck size={17} className="text-green-500" />
            Authorized staff access only
          </div>

          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 transition hover:gap-3 hover:text-orange-600"
          >
            <ArrowRight size={15} className="rotate-180" />
            Back to Home
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
