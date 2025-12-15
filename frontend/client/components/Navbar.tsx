import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import eventLogo from "@/assets/image.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if user is logged in by checking localStorage
  const isLoggedIn = () => {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    return !!(role && email); // Returns true if both exist
  };

  const userRole = localStorage.getItem('role') || '';
  const userEmail = localStorage.getItem('email') || '';

  const isActive = (path: string) => location.pathname === path;

  // Handle logout
  const handleLogout = () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      
      // Optional: Add toast notification here if you have toast setup
      // toast.success('Logged out successfully!');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
        setIsLoggingOut(false);
      }, 500);
      
    } catch (error) {
      console.error('Logout error:', error);
      // toast.error('Logout failed. Please try again.');
      setIsLoggingOut(false);
    }
  };

  // Navigation links based on authentication status
  const getNavLinks = () => {
    if (isLoggedIn()) {
      // User is logged in - show user info and logout
      return [
        // Show role-specific links if needed
        ...(userRole === 'meal_updater' 
          ? [{ label: 'Meal Scanner', path: '/meal-scanner' }] 
          : []),
        ...(userRole === 'qr_scanner' 
          ? [{ label: 'QR Scanner', path: '/qr-scanner' }] 
          : []),
        ...(userRole === 'participant_search' 
          ? [{ label: 'Search', path: '/search' }] 
          : []),
        ...(userRole === 'admin' 
          ? [{ label: 'Dashboard', path: '/admin' }] 
          : []),
      ];
    } else {
      // User is not logged in - show basic navigation
      return [
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 glassmorphism-dark border-b backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* EVENT LOGO + TEXT */}
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
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Links */}
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

            {/* User Info & Logout Button (when logged in) */}
            {isLoggedIn() && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300/30">
                <div className="text-sm text-right hidden lg:block">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {userEmail.split('@')[0]} {/* Show username part only */}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {userRole.replace('_', ' ')} {/* Format role */}
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Logout"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </button>
              </div>
            )}
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
            {/* Navigation Links */}
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

            {/* User Info & Logout (when logged in) */}
            {isLoggedIn() && (
              <>
                <div className="px-4 py-2 border-t border-gray-300/30 mt-2 pt-3">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {userEmail}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {userRole.replace('_', ' ')}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}