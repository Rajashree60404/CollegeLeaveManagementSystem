import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Footer from "../components/Footer";
import {
  GraduationCap,
  ArrowRight,
  ClipboardCheck,
  CalendarDays,
  ShieldCheck,
  Users,
  Moon,
  Sun,
  UserRound,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("clms-theme") === "dark",
  );

  const [accountOpen, setAccountOpen] = useState(false);

  // Read logged-in staff details
  const [staffData, setStaffData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("staff") || "{}");
    } catch {
      return {};
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!sessionStorage.getItem("staff"),
  );

  // Keep the theme updated
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("clms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Refresh login state when Home mounts or browser regains focus
  useEffect(() => {
    const checkLogin = () => {
      try {
        const staff = JSON.parse(sessionStorage.getItem("staff") || "{}");

        setStaffData(staff);
        setIsLoggedIn(!!sessionStorage.getItem("staff"));
      } catch {
        setStaffData({});
        setIsLoggedIn(false);
      }
    };

    checkLogin();
    window.addEventListener("focus", checkLogin);

    return () => {
      window.removeEventListener("focus", checkLogin);
    };
  }, []);

  // Logout staff
  const handleLogout = () => {
    sessionStorage.removeItem("staff");
    localStorage.removeItem("staff");

    setStaffData({});
    setIsLoggedIn(false);
    setAccountOpen(false);

    navigate("/", { replace: true });
  };

  // Open staff login
  const handleLogin = () => {
    setAccountOpen(false);
    navigate("/Login");
  };

  const features = [
    {
      icon: ClipboardCheck,
      title: "Review Applications",
      description:
        "View student leave applications and approve or reject requests efficiently.",
    },
    {
      icon: CalendarDays,
      title: "Manage Leave Records",
      description:
        "Access leave dates, reasons, application status, and leave history.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Workflow",
      description:
        "Keep leave management organized with a structured staff approval process.",
    },
    {
      icon: Users,
      title: "Register Students",
      description:
        "Register student details and help students access the leave management system.",
    },
  ];

  // Get staff profile image
  const profileImage =
    staffData.profileImageUrl ||
    staffData.data?.profileImageUrl ||
    staffData.profileImage ||
    staffData.profilePicture ||
    staffData.imageUrl ||
    staffData.photoUrl ||
    "";

  // Get staff initial
  const staffInitial =
    staffData.name?.charAt(0)?.toUpperCase() ||
    staffData.staffName?.charAt(0)?.toUpperCase() ||
    "S";

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-5 py-4 md:px-12">
          {/* Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex shrink-0 items-center gap-3 text-left"
          >
            <div className="rounded-xl bg-orange-500 p-2 text-white shadow-md">
              <GraduationCap size={30} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                CLMS<span className="text-orange-500">.</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staff Portal
              </p>
            </div>
          </button>

          {/* Desktop navigation links */}
          <div className="hidden items-center gap-6 lg:flex">
            <a
              href="#features"
              onClick={() => setAccountOpen(false)}
              className="font-medium text-slate-600 transition hover:text-orange-500 dark:text-slate-300"
            >
              Features
            </a>

            <a
              href="#about"
              onClick={() => setAccountOpen(false)}
              className="font-medium text-slate-600 transition hover:text-orange-500 dark:text-slate-300"
            >
              About CLMS
            </a>
          </div>

          {/* Right-side controls */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Dark/light mode */}
            <button
              type="button"
              onClick={() => setDarkMode((previous) => !previous)}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Light mode" : "Dark mode"}
              className="rounded-full border border-slate-200 bg-slate-100 p-2.5 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-300 dark:hover:bg-slate-700 sm:p-3"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Account Profile */}
            <div className="relative">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => navigate("/staff/profile")}
                  aria-label="Open staff profile"
                  title="My Profile"
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-orange-500 bg-orange-100 text-lg font-bold text-orange-600 shadow-md transition hover:scale-105 hover:shadow-lg dark:bg-slate-800 dark:text-orange-400"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Staff profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    staffInitial
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                  className="flex items-center gap-2 rounded-xl border border-orange-200 px-3 py-2 transition hover:bg-orange-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <UserRound size={20} className="text-orange-500" />
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}

              {/* Login dropdown */}
              {!isLoggedIn && accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="block w-full rounded-lg bg-orange-500 px-3 py-2 text-center font-semibold text-white transition hover:bg-orange-600"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="about"
        className="relative mx-4 mt-5 flex min-h-[570px] items-center overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 sm:mx-6 md:mx-10 md:min-h-[620px] md:px-16"
      >
        <img
          src="/images/homepage.png"
          alt="Students and faculty at a college campus"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-300 sm:text-sm">
            <GraduationCap size={18} />
            College Leave Management System
          </span>

          <h2 className="mt-7 text-3xl font-extrabold leading-tight text-white sm:text-5xl md:text-7xl">
            Simplify Leave!
            <span className="mt-2 block text-orange-400">
              Empower Education.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Welcome to your staff workspace. Manage student registrations,
            review leave applications, and make approval decisions through one
            convenient digital platform.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleLogin}
              className="group flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-orange-600"
            >
              Enter Staff Portal
              <ArrowRight
                size={20}
                className="transition group-hover:translate-x-1"
              />
            </button>

            <a
              href="#features"
              onClick={() => setAccountOpen(false)}
              className="rounded-full border border-white/60 px-7 py-4 font-bold text-white transition hover:bg-white hover:text-slate-900"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-200">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-orange-400" />
              Organized approvals
            </span>

            <span className="flex items-center gap-2">
              <CalendarDays size={18} className="text-orange-400" />
              Easy leave tracking
            </span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-slate-50 px-5 py-20 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-8 md:px-14"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Your Staff Workspace
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
              Everything You Need,
              <span className="block text-orange-500">All in One Place.</span>
            </h2>

            <p className="mt-5 leading-7 text-slate-600 dark:text-slate-400">
              Make college leave administration easier with a simple, organized,
              and convenient digital workflow.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-500/50"
                >
                  <div className="mb-6 inline-flex rounded-2xl bg-orange-50 p-4 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/10 dark:text-orange-400 dark:group-hover:bg-orange-500 dark:group-hover:text-white">
                    <Icon size={29} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {/* <section className="bg-white px-5 py-16 transition-colors duration-300 dark:bg-slate-900 sm:px-8 md:px-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-3xl bg-orange-500 px-7 py-12 text-center text-white sm:px-12 md:flex-row md:text-left">
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to manage leave smarter?
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-orange-50">
              Sign in to your staff portal to manage student registrations
              and leave applications.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="flex shrink-0 items-center gap-3 rounded-full bg-white px-7 py-4 font-bold text-orange-600 shadow-lg transition hover:-translate-y-1 hover:bg-orange-50"
          >
            Staff Login
            <ArrowRight size={20} />
          </button>
        </div>
      </section> */}

      {/* Footer */}
      <Footer />
    </div>
  );
}
