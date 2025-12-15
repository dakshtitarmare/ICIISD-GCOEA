import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LogoutButton({ 
  variant = "default",
  showText = true, // ⭐ NEW: Control text visibility
  className = "",
  size = "md" // ⭐ NEW: Size prop
}: { 
  variant?: "default" | "ghost" | "danger" | "icon"; // ⭐ ADDED "icon" variant
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg"; // ⭐ NEW: Size options
}) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Clear all authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      
      toast.success("Logged out successfully!");
      
      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 500);
      
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  };

  // Size styles
  const sizeStyles = {
    sm: "px-2 py-1.5 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base"
  };

  // Icon sizes
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  // Variant styles
  const variantStyles = {
    default: "bg-gray-800 text-white hover:bg-gray-900",
    ghost: "bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700",
    icon: "bg-transparent text-gray-500 hover:text-red-600 hover:bg-red-50 border-none p-1" // ⭐ NEW: Icon-only variant
  };

  // Determine which variant to use
  const buttonVariant = variant === "icon" ? "icon" : variant;

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        rounded-lg font-medium transition-all duration-200
        flex items-center justify-center gap-1.5
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariant === "icon" ? "" : sizeStyles[size]}
        ${variantStyles[buttonVariant]}
        ${className}
      `}
      title="Logout from committee panel"
      aria-label="Logout"
    >
      {isLoggingOut ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <LogOut className={iconSizes[size]} />
      )}
      {showText && buttonVariant !== "icon" && (
        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
      )}
    </button>
  );
}