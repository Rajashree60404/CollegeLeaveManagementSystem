
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <GraduationCap size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              CLMS
            </h1>

            <p className="text-xs text-slate-500">
              College Leave Management
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <a
            href="#home"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Home
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            About
          </a>

          <a
            href="#features"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            How It Works
          </a>

          <Link
            to="/login"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Student Login
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">

          <div className="flex flex-col gap-4">

            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700"
            >
              Home
            </a>

            <a
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700"
            >
              About
            </a>

            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700"
            >
              How It Works
            </a>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Student Login
            </Link>

          </div>

        </div>
      )}
    </nav>
  );
}

export default Navbar;

