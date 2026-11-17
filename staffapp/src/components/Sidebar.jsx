
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Leave Requests",
      path: "/leave-requests",
      icon: FileText,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-screen
        ${collapsed ? "w-20" : "w-64"}
        bg-slate-900 text-white shadow-lg
        transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-700">

        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">CLMS</h1>
            <p className="text-xs text-slate-400 mt-1">
              Staff Panel
            </p>
          </div>
        )}

        {collapsed && (
          <h1 className="text-xl font-bold mx-auto">C</h1>
        )}

      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 bg-orange-500
          hover:bg-orange-600 text-white rounded-full
          p-1 shadow-md transition"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={18} />
        ) : (
          <ChevronLeft size={18} />
        )}
      </button>

      {/* Navigation */}
      <nav className="p-3 space-y-2 mt-4">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.name : ""}
              className={({ isActive }) =>
                `flex items-center
                ${collapsed ? "justify-center" : "gap-3"}
                px-4 py-3 rounded-lg
                text-sm font-medium transition
                ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />

              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}

      </nav>
    </aside>
  );
};

export default Sidebar;
