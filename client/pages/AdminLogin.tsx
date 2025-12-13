import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Lock } from "lucide-react";
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

  const onSubmit = async (data: LoginForm) => {
    setLoginError(null);
  
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
          navigate("/registration-phone/dashboard");
          break;
  
        case "phone_registration":
          navigate("/registration-phone/dashboard");
          break;
  
        case "food_mobile":
          navigate("/food/dashboard");
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required"
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Demo Credentials */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Mock Credentials</p>

          <p className="text-xs text-blue-700">
            <b>Registration Laptop:</b> laptopregistration1@iicasd.com
          </p>
          <p className="text-xs text-blue-700">
            <b>Phone Registration:</b> phoneregistration1@iicasd.com
          </p>
          <p className="text-xs text-blue-700">
            <b>Food Counter:</b> food1@iicasd.com
          </p>

          <p className="text-xs text-blue-700 mt-1">
            <b>Password:</b> password123
          </p>
        </div> */}

      </div>
    </div>
  );
}
