
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-700 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white">

      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 p-2 text-white">
                <GraduationCap size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  CLMS<span className="text-orange-500">.</span>
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  College Leave Management
                </p>
              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              A digital platform that makes the college leave
              application and approval process simple, transparent,
              and efficient.
            </p>

          </div>

          {/* Quick Links */}
          <div>

            <h3 className="mb-5 font-semibold text-slate-900 dark:text-white">
              Quick Links
            </h3>

            <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">

              <a href="#home" className="block transition hover:text-orange-500">
                Home
              </a>

              <a href="#about" className="block transition hover:text-orange-500">
                About
              </a>

              <a href="#features" className="block transition hover:text-orange-500">
                Features
              </a>

              <a href="#how-it-works" className="block transition hover:text-orange-500">
                How It Works
              </a>

            </div>

          </div>

          {/* Student Services */}
          <div>

            <h3 className="mb-5 font-semibold text-slate-900 dark:text-white">
              Student Services
            </h3>

            <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">

              <p>Apply Leave</p>
              <p>Track Leave Status</p>
              <p>View Leave History</p>
              <p>Student Profile</p>

            </div>

          </div>

          {/* Contact */}
          <div>

            <h3 className="mb-5 font-semibold text-slate-900 dark:text-white">
              Contact
            </h3>

            <div className="space-y-4 text-sm text-slate-500 dark:text-slate-400">

              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-orange-500" />
                <span>support@college.edu</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-orange-500" />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} className="shrink-0 text-orange-500" />
                <span>Tamil Nadu</span>
              </div>

            </div>

          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-500">

          © {new Date().getFullYear()} College Leave Management System.
          All rights reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;
