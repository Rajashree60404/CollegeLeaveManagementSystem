
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-300">

      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-orange-500 p-2">
                <GraduationCap size={27} className="text-white" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                CLMS<span className="text-orange-500">.</span>
              </h2>
            </div>

            <p className="text-sm leading-7 text-slate-500 dark:text-gray-400">
              College Leave Management System simplifies
              the leave application and approval process
              through a secure and efficient digital platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="transition hover:text-orange-500">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/staff/dashboard" className="transition hover:text-orange-500">
                  Dashboard
                </Link>
              </li>

              <li>
                <Link to="/staff/profile" className="transition hover:text-orange-500">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
              Our Features
            </h3>

            <ul className="space-y-3 text-sm">
              <li>Online Leave Application</li>
              <li>Parent Approval</li>
              <li>Staff Approval</li>
              <li>Leave History Tracking</li>
              <li>Email Notifications</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
              Contact Us
            </h3>

            <div className="space-y-4 text-sm">

              <div className="flex items-start gap-3">
                <Mail size={18} className="mt-1 shrink-0 text-orange-500" />
                <span>support@clms.com</span>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-1 shrink-0 text-orange-500" />
                <span>College Administration</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-orange-500" />
                <span>College Campus</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-200 dark:border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">

          <p className="text-center text-xs text-slate-500 dark:text-gray-500">
            © {currentYear} College Leave Management System.
            All rights reserved.
          </p>

          <p className="text-xs text-slate-500 dark:text-gray-500">
            Designed for smarter leave management.
          </p>

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="flex items-center gap-2 text-sm text-orange-500 transition hover:text-orange-600"
          >
            Back to top
            <ArrowUp size={16} />
          </button>

        </div>
      </div>

    </footer>
  );
}
