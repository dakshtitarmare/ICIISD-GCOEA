import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { adminLogin } from '@/lib/apiClient';
import { showSuccessToast, showErrorToast } from '@/lib/toastUtils';

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setLoginError(null);
    try {
      const result = await adminLogin(data.email, data.password);
      if (result.success && result.token) {
        // Store token in localStorage or sessionStorage
        localStorage.setItem('adminToken', result.token);
        showSuccessToast('Login successful!');
        navigate('/admin/dashboard');
      } else {
        setLoginError('Login failed. Please check your credentials.');
        showErrorToast('Invalid credentials');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      setLoginError(errorMsg);
      showErrorToast(errorMsg);
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
            Admin Login
          </h1>
          <p className="text-gray-600">
            Access the AICMS admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          {/* Error Alert */}
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-semibold">{loginError}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</p>
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Email:</span> admin@example.com
          </p>
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Password:</span> password
          </p>
        </div>
      </div>
    </div>
  );
}
