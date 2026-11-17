import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              CLMS
            </h1>
            <p className="text-xs text-gray-500">
              College Leave Management System
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">

          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Home
          </Link>

          <a
            href="#about"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            About
          </a>

          <a
            href="#features"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Features
          </a>

          <Link
            to="/login"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg
                       hover:bg-blue-700 transition font-medium"
          >
            Student Login
          </Link>

        </nav>

      </div>
    </header>
  );
};

export default Header;