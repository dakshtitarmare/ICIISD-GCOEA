import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import eventLogo from "@/assets/image.png"; // <-- your logo import

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Login', path: '/login' },
  ];

  return (
    <nav className="sticky top-0 z-50 glassmorphism-dark border-b backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 🔥 EVENT LOGO + TEXT */}
          <div className="flex items-center gap-3">
            <img
              src={eventLogo}
              alt="ICAIISD Logo"
              className="h-12 w-auto object-contain drop-shadow-md"
            />

            <div className="leading-tight">
              <div className="text-lg font-bold tracking-wide">ICAIISD 2025</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Government College of Engineering, Amravati
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-all py-2 px-4 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-white/30 text-primary backdrop-blur-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 hover:backdrop-blur-sm'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/30 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-white/30 text-primary backdrop-blur-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/20'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
