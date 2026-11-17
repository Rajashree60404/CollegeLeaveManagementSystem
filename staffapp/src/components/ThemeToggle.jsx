
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("clms-theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("clms-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((prev) => !prev)}
      className="rounded-full bg-slate-200 p-3 text-slate-900 dark:bg-slate-700 dark:text-yellow-300"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={10} /> : <Moon size={10} />}
    </button>
  );
}
