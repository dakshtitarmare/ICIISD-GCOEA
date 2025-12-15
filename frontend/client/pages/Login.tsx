import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils";
import axios from "axios";

interface LoginForm {
  email: string;
  password: string;
}

export default function CommitteeLogin() {
  
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // ⭐ NEW: Password visibility state

  const onSubmit = async (data: LoginForm) => {
    setLoginError(null);
    console.log(data);

    try {
      const res = await axios.post("http://127.0.0.1:4000/api/login", data);
  
      const result = res.data;
  
      if (!result.success) {
        showErrorToast(result.message || "Invalid credentials");
        setLoginError("Invalid email or password");
        return;
      }
  
      // ✔ Save token in localStorage
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("role", result.data.role);
      localStorage.setItem("email", data.email);
  
      showSuccessToast("Login successful!");
  
      // ✔ Redirect based on role
      switch (result.data.role) {
        case "laptop_registration":
          navigate("/registration-laptop/dashboard");
          break;
  
        case "phone_registration":
          navigate("/registration-phone/dashboard");
          break;
  
        case "food_mobile":
          navigate("/meal/dashboard");
          break;
  
        default:
          showErrorToast("Unknown user role");
          window.location.reload();
      }
  
    } catch (error: any) {
      showErrorToast("Login failed. Please try again.");
      setLoginError(
        error.response?.data?.message || error.message || "Unknown error"
      );
    }
  };

  // ⭐ NEW: Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Committee Login
          </h1>
          <p className="text-gray-600">
            Sign in to access your committee tools
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-white p-8 rounded-lg border border-gray-200 shadow-sm"
        >
          {/* Error Alert */}
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-semibold">{loginError}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="committee@example.com"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password with Show/Hide Button */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // ⭐ Toggle type
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required"
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition pr-12"
              />
              {/* ⭐ Show/Hide Password Button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Demo Credentials Section (Optional - Uncomment if needed) */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</p>
          <div className="space-y-1">
            <p className="text-xs text-blue-700">
              <b>Registration Laptop:</b> laptopregistration1@iicasd.com
            </p>
            <p className="text-xs text-blue-700">
              <b>Phone Registration:</b> phoneregistration1@iicasd.com
            </p>
            <p className="text-xs text-blue-700">
              <b>Food Counter:</b> food1@iicasd.com
            </p>
            <p className="text-xs text-blue-700 mt-2">
              <b>Password for all:</b> password123
            </p>
          </div>
        </div> */}

        {/* Additional Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Contact admin (7841919830) if you forgot your password</p>
        </div>

      </div>
    </div>
  );
}