import ThemeToggle from "./ThemeToggle";

export default function StaffNavbar() {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 dark:bg-slate-900">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">
        Staff Portal
      </h1>

      <ThemeToggle />
    </header>
  );
}