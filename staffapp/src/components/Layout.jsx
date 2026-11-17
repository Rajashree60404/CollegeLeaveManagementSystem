
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  GraduationCap,
  LayoutDashboard,
  House,
  ClipboardCheck,
  CalendarDays,
  UserPlus,
  UserRound,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("clms-theme") === "dark",
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("staff") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("clms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const updateStaff = () => {
      try {
        const storedStaff = JSON.parse(
          sessionStorage.getItem("staff") || "{}"
        );
        setStaff(storedStaff);
      } catch {
        setStaff({});
      }
    };

    window.addEventListener("staffProfileUpdated", updateStaff);
    window.addEventListener("storage", updateStaff);

    return () => {
      window.removeEventListener("staffProfileUpdated", updateStaff);
      window.removeEventListener("storage", updateStaff);
    };
  }, []);

  const staffName = staff.name || staff.staffName || "Staff";
  const profileImage = staff.profileImageUrl || "";

  const links = [
    { label: "Home", path: "/", icon: House },
    {
      label: "Dashboard",
      path: "/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Leave Applications",
      path: "/staff/leave-applications",
      icon: ClipboardCheck,
    },
    {
      label: "Leave Records",
      path: "/staff/leave-records",
      icon: CalendarDays,
    },
    {
      label: "Register Students",
      path: "/staff/register-students",
      icon: UserPlus,
    },
    {
      label: "Profile",
      path: "/staff/profile",
      icon: UserRound,
    },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("staff");
    localStorage.removeItem("staff");
    setSidebarOpen(false);
    navigate("/", { replace: true });
  };

  const navLinks = (
    <>
      {links.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={label}
          to={path}
          end={path === "/"}
          onClick={() => setSidebarOpen(false)}
          title={sidebarCollapsed ? label : ""}
          className={({ isActive }) =>
            `flex items-center ${
              sidebarCollapsed ? "justify-center" : "gap-3"
            } rounded-xl px-4 py-3 font-medium transition ${
              isActive
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-600 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800"
            }`
          }
        >
          <Icon size={20} className="shrink-0" />

          {!sidebarCollapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="rounded-xl bg-orange-500 p-2 text-white">
            <GraduationCap size={24} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold">
              CLMS<span className="text-orange-500">.</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Staff Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label="Toggle theme"
            className="rounded-full border border-slate-200 bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-300"
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/staff/profile")}
            className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-orange-50 dark:hover:bg-slate-800"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-orange-500 font-bold text-white">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Staff profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                staffName.charAt(0).toUpperCase()
              )}
            </span>

            <span className="hidden text-sm font-semibold sm:block">
              {staffName}
            </span>
          </button>
        </div>
      </header>

      <div className="flex">

        {/* Desktop sidebar */}
        <aside
          className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 transition-all duration-300 ease-in-out md:flex ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >

          {/* Sidebar heading */}
          <div className={`mb-3 flex items-center pt-3 ${
            sidebarCollapsed ? "justify-center" : "justify-between px-4"
          }`}>
            {!sidebarCollapsed && (
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Main Menu
              </p>
            )}

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="rounded-lg bg-orange-50 p-2 text-orange-600 hover:bg-orange-100 dark:bg-slate-800 dark:text-orange-400 dark:hover:bg-slate-700 transition"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-2 mt-3">
            {navLinks}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : ""}
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : "gap-3"
            } rounded-xl px-4 py-3 font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-slate-800`}
          >
            <LogOut size={20} className="shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </aside>

        {/* Mobile sidebar - unchanged */}
        {sidebarOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 top-16 z-30 bg-black/40 md:hidden"
            />

            <aside className="fixed bottom-0 left-0 top-16 z-40 flex w-72 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
              <p className="mb-3 px-4 pt-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                Main Menu
              </p>

              <nav className="flex flex-1 flex-col gap-2">
                {links.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={label}
                    to={path}
                    end={path === "/"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                        isActive
                          ? "bg-orange-500 text-white shadow-md"
                          : "text-slate-600 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-500 hover:bg-red-50 dark:hover:bg-slate-800"
              >
                <LogOut size={20} />
                Logout
              </button>
            </aside>
          </>
        )}

        {/* Page content + Footer */}
        <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
