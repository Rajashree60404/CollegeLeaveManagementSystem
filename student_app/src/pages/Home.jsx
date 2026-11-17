
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  CalendarDays,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Users,
  Clock,
  Moon,
  Sun,
  ClipboardCheck,
  Sparkles,
  BookOpen,
  ChevronDown,
} from "lucide-react";

import Footer from "../components/Footer";

export default function Home() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("clms-theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("clms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const features = [
    {
      icon: CalendarDays,
      title: "Easy Leave Application",
      description:
        "Apply for leave online with a simple and convenient application process.",
    },
    {
      icon: ShieldCheck,
      title: "Parent Approval",
      description:
        "Parents can review leave requests and provide their approval through email.",
    },
    {
      icon: ClipboardCheck,
      title: "Staff Verification",
      description:
        "Staff members can review applications and manage student leave requests.",
    },
    {
      icon: Clock,
      title: "Track Leave Status",
      description:
        "Stay updated with your leave application status at every stage.",
    },
  ];

  const workflow = [
    {
      icon: FileText,
      title: "Student Applies",
      desc: "Submit a leave request online",
      number: "01",
    },
    {
      icon: Users,
      title: "Parent Approval",
      desc: "Parent reviews the application",
      number: "02",
    },
    {
      icon: ShieldCheck,
      title: "Staff Verification",
      desc: "Staff reviews and takes action",
      number: "03",
    },
    {
      icon: CheckCircle2,
      title: "Final Status",
      desc: "Student receives the final update",
      number: "04",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-white text-slate-900"
      }`}
    >
      {/* ================= FIXED NAVBAR ================= */}

      <header
        className={`fixed top-0 left-0 right-0 z-[99999] w-full border-b shadow-lg ${
          darkMode
            ? "border-white/10 bg-slate-950 text-white"
            : "border-slate-300/40 bg-slate-950 text-white"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30">
              <GraduationCap size={27} className="text-white" />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-wide">
                CLMS
              </h1>
              <p className="text-[10px] tracking-[2px] text-slate-300">
                COLLEGE LEAVE SYSTEM
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="hidden items-center gap-9 md:flex">
            <a
              href="#home"
              className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-sm text-slate-200 transition hover:text-orange-400"
            >
              About
            </a>

            <a
              href="#features"
              className="text-sm text-slate-200 transition hover:text-orange-400"
            >
              Features
            </a>
          </div>

          {/* Navbar Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-full border border-white/20 p-2.5 text-white transition hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="hidden items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 sm:flex"
            >
              Student Login
              <ArrowRight size={16} />
            </button>
          </div>
        </nav>
      </header>

      {/* ================= HERO SECTION ================= */}

      <section
        id="home"
        className="relative isolate min-h-[720px] overflow-hidden"
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/campus-poster.png"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src="/videos/college_video.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay */}
        <div
          className={`absolute inset-0 -z-10 ${
            darkMode ? "bg-slate-950/90" : "bg-slate-950/75"
          }`}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />

        {/* Decorative Background */}
        <div className="absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-20 -z-10 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />

        {/* ================= HERO CONTENT ================= */}

        <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 pb-16 pt-32 md:px-8 lg:grid-cols-2">
          {/* LEFT CONTENT */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="relative z-10"
          >
            <motion.div
              variants={fadeUp}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300"
            >
              <Sparkles size={16} />
              A smarter way to manage student leaves
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="max-w-2xl text-4xl font-black leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[68px]"
            >
              Your College.
              <br />
              Your Time.
              <br />
              <span className="text-orange-500">
                Simplified Leaves.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-base leading-8 text-slate-300 md:text-lg"
            >
              Experience a smarter and more organized way to manage
              college leave applications. Apply online, get parent
              approval, and track every update in one convenient place.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => navigate("/login")}
                className="group flex items-center gap-3 rounded-xl bg-orange-500 px-7 py-4 font-bold text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-1 hover:bg-orange-600"
              >
                Get Started
                <ArrowRight
                  size={19}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <a
                href="#about"
                className="flex items-center gap-2 rounded-xl border border-white/25 px-7 py-4 font-semibold text-white transition hover:border-orange-400 hover:bg-white/10"
              >
                Discover CLMS
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-wrap items-center gap-7 text-sm text-slate-300"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-orange-400" />
                Simple Application
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-orange-400" />
                Email Notifications
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - WORKFLOW ILLUSTRATION */}

          <div className="relative mx-auto flex h-[480px] w-full max-w-[530px] items-center justify-center">
            <div className="absolute h-[350px] w-[350px] rounded-full bg-orange-500/20 blur-[90px]" />

            {/* Main Illustration */}
            <motion.div
              animate={{ rotate: [0, 3, 0, -3, 0] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex h-[310px] w-[310px] items-center justify-center rounded-full border border-orange-400/30 bg-gradient-to-br from-orange-500/20 via-white/5 to-blue-500/10 shadow-[0_0_100px_rgba(249,115,22,0.12)] backdrop-blur-xl sm:h-[370px] sm:w-[370px]"
            >
              <div className="absolute inset-5 rounded-full border border-dashed border-white/20" />

              <div className="relative flex h-44 w-44 items-center justify-center rounded-[40px] bg-gradient-to-br from-orange-400 to-orange-600 shadow-2xl shadow-orange-500/40 sm:h-52 sm:w-52">
                <GraduationCap
                  size={112}
                  strokeWidth={1.3}
                  className="text-white"
                />

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -right-3 -top-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white text-orange-500 shadow-xl"
                >
                  <CheckCircle2 size={30} />
                </motion.div>
              </div>
            </motion.div>

            {/* Application Card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-12 w-52 rounded-2xl border border-white/20 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl sm:left-[-5px]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/20 p-2.5 text-orange-400">
                  <FileText size={22} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Application</p>
                  <p className="text-sm font-bold text-white">
                    Leave Request
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div className="h-2 w-3/4 rounded-full bg-white/10" />
                <div className="h-2 w-1/2 rounded-full bg-white/10" />
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1.5 text-xs font-semibold text-orange-300">
                <Clock size={13} />
                Submitted
              </div>
            </motion.div>

            {/* Calendar Card */}
            <motion.div
              animate={{ y: [0, 12, 0], rotate: [0, 2, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-10 rounded-2xl border border-white/20 bg-white p-4 text-slate-800 shadow-2xl sm:right-[-5px]"
            >
              <div className="flex items-center gap-2">
                <CalendarDays size={19} className="text-orange-500" />
                <span className="text-xs font-bold">Leave Dates</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {["MON", "TUE", "WED"].map((day, index) => (
                  <div
                    key={day}
                    className="rounded-lg bg-slate-100 px-2 py-2 text-center"
                  >
                    <p className="text-[9px] text-slate-400">{day}</p>
                    <p className="mt-1 text-sm font-bold">{8 + index}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Parent Approval */}
            <motion.div
              animate={{ x: [0, 7, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-24 left-0 flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                <Users size={21} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Step 01</p>
                <p className="text-sm font-bold text-white">
                  Parent Review
                </p>
              </div>

              <CheckCircle2 size={19} className="text-green-400" />
            </motion.div>

            {/* Staff Approval */}
            <motion.div
              animate={{ x: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity }}
              className="absolute bottom-10 right-0 flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Step 02</p>
                <p className="text-sm font-bold text-white">
                  Staff Review
                </p>
              </div>

              <CheckCircle2 size={19} className="text-green-400" />
            </motion.div>

            {/* Decorative Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute right-16 bottom-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-orange-300 backdrop-blur-lg"
            >
              <Sparkles size={22} />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.a
          href="#about"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-white/60 md:flex"
        >
          Scroll to explore
          <ChevronDown size={19} />
        </motion.a>
      </section>

      {/* ================= ABOUT SECTION ================= */}

      <section
        id="about"
        className={`relative scroll-mt-24 px-5 py-24 md:px-8 ${
          darkMode ? "bg-slate-950" : "bg-slate-50"
        }`}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-bold uppercase tracking-[3px] text-orange-500">
              About the system
            </span>

            <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Making College Leave Management
              <span className="text-orange-500"> Effortless.</span>
            </h2>

            <p
              className={`mt-6 text-base leading-8 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              CLMS is designed to simplify the traditional college leave
              management process. It provides a centralized platform
              where students can submit leave requests, parents can
              provide approval, and staff can review applications.
            </p>

            <p
              className={`mt-4 text-base leading-8 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              By bringing the entire approval process online, CLMS
              helps reduce manual work, improves communication, and
              makes leave management more transparent.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600"
            >
              Explore the Portal
              <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* Workflow Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-blue-500/10 p-7 md:p-10"
          >
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-orange-500/10 blur-2xl" />

            <div className="relative">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-orange-500 p-3 text-white">
                  <BookOpen size={25} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold">
                    Simple Approval Process
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    From application to final decision
                  </p>
                </div>
              </div>

              {workflow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="relative mb-4 flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                      <Icon size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold">{step.title}</h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {step.desc}
                      </p>
                    </div>

                    <span className="text-lg font-black text-orange-500/40">
                      {step.number}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}

      <section
        id="features"
        className={`scroll-mt-24 px-5 py-24 md:px-8 ${
          darkMode ? "bg-slate-900" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <span className="font-bold uppercase tracking-[3px] text-orange-500">
              What CLMS offers
            </span>

            <h2 className="mt-5 text-3xl font-black md:text-5xl">
              Everything You Need,
              <span className="text-orange-500"> In One Place.</span>
            </h2>

            <p
              className={`mt-5 leading-8 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              A simple and organized platform designed to make the
              college leave process easier for students, parents and staff.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className={`group rounded-3xl border p-7 transition duration-300 ${
                    darkMode
                      ? "border-white/10 bg-slate-950 hover:border-orange-500/50"
                      : "border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-white hover:shadow-xl"
                  }`}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
                    <Icon size={27} />
                  </div>

                  <h3 className="text-lg font-extrabold">
                    {feature.title}
                  </h3>

                  <p
                    className={`mt-4 text-sm leading-7 ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
