
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, UserRound } from "lucide-react";
import api from "../services/api";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [student, setStudent] = useState(() =>
    JSON.parse(sessionStorage.getItem("student") || "{}")
  );

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("clms-theme") === "dark"
  );

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("clms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Refresh student details when the layout loads or profile is updated
  useEffect(() => {
    const refreshStudent = () => {
      setStudent(
        JSON.parse(sessionStorage.getItem("student") || "{}")
      );
    };

    window.addEventListener("studentProfileUpdated", refreshStudent);

    return () => {
      window.removeEventListener("studentProfileUpdated", refreshStudent);
    };
  }, []);

  const [profileImage, setProfileImage] = useState("");

  const studentName = student.name || student.studentName || "Student";

 useEffect(() => {
  const fetchProfileImage = async () => {
    try {
      const student = JSON.parse(
        sessionStorage.getItem("student") || "{}"
      );

      if (!student.id) return;

      const response = await api.get(
        `/students/${student.id}/profile-image`
      );

      const imageData = response.data?.data ?? response.data;

      setProfileImage(imageData?.imageUrl || "");
    } catch (error) {
      console.error("Failed to load student profile image:", error);
      setProfileImage("");
    }
  };

  fetchProfileImage();

  const refreshImage = () => fetchProfileImage();

  window.addEventListener("studentProfileUpdated", refreshImage);

  return () => {
    window.removeEventListener("studentProfileUpdated", refreshImage);
  };
}, []);
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex min-w-0 flex-1 flex-col">

        {/* Common Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:px-6">

          {/* Left Section */}
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={23} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                College Leave Management
              </h1>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Student Portal
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              aria-label="Toggle theme"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? (
                <Sun size={19} className="text-orange-400" />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* Student Profile */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              title="View Profile"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Student Profile"
                  className="h-10 w-10 rounded-full border-2 border-orange-500 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-500 bg-orange-100 font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                  {studentName.charAt(0).toUpperCase() || (
                    <UserRound size={20} />
                  )}
                </div>
              )}

              <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-700 dark:text-slate-200 md:block">
                {studentName}
              </span>
            </button>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Common Footer */}
        <Footer />

      </div>
    </div>
  );
};

export default Layout;
