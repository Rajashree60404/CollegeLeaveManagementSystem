
import { useEffect, useState } from "react";
import {
  Home,
  LayoutDashboard,
  CalendarPlus,
  ClipboardCheck,
  History,
  UserRound,
  LogOut,
  X,
  GraduationCapIcon,
  Moon,
  Sun,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ isOpen = false, setIsOpen = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme state
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("clms-theme") === "dark"
  );

  // Apply theme globally
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("clms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Toggle theme
  const handleThemeToggle = () => {
    setDarkMode((previous) => !previous);
  };

  // Student menu items
  const menuItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Apply Leave", icon: CalendarPlus, path: "/apply-leave" },
    { name: "Leave Status", icon: ClipboardCheck, path: "/leave-status" },
    { name: "Leave History", icon: History, path: "/leave-history" },
    { name: "Profile", icon: UserRound, path: "/profile" },
  ];

  // Handle menu navigation
  const handleMenuClick = (item) => {
    navigate(item.path);
    setIsOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("student");
    sessionStorage.removeItem("student");

    setIsOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40
          flex h-screen w-64 flex-col
          bg-white dark:bg-slate-800
          border-r border-slate-200 dark:border-slate-700
          shadow-xl transition-transform duration-300
          lg:sticky lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500 p-2 text-white">
              <GraduationCapIcon size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                CLMS
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student Portal
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => handleMenuClick(item)}
                  className={`
                    group flex w-full items-center gap-3
                    rounded-xl px-4 py-3 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-orange-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400"
                    }
                  `}
                >
                  <Icon size={20} className="shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">

          {/* Theme Toggle */}
          {/* <button
            onClick={handleThemeToggle}
            className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span className="flex items-center gap-3">
              {darkMode ? (
                <Sun size={20} className="text-orange-500" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}

              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>

            <span className="text-xs text-slate-400">
              {darkMode ? "ON" : "OFF"}
            </span>
          </button> */}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          {/* Sidebar Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              College Leave Management System
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Student Portal
            </p>
          </div>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;
