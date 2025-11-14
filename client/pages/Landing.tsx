import { Link } from 'react-router-dom';
import { QrCode, UserPlus, BarChart3, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8 glassmorphism p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              A
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              ICIISD
            </h1>
            <p className="text-xl text-gray-600">
              AI4SG Conference Management System
            </p>
          </div>

          {/* Description */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to the <span className="font-semibold">2024 AI4SG Conference</span>. 
              This year's conference brings together leading researchers and practitioners in AI for social good.
            </p>
            <p className="text-base text-gray-600">
              <span className="font-semibold">Conference Dates:</span> December 19-20, 2024
            </p>
            <p className="text-sm text-gray-500">
              Experience seamless registration, QR-based ID verification, and integrated meal tracking across both days.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 glass-button"
            >
              <UserPlus className="w-5 h-5" />
              On-Spot Register
            </Link>
            <Link
              to="/food-scan"
              className="inline-flex items-center justify-center gap-2 glass-button-outline"
            >
              <QrCode className="w-5 h-5" />
              Food Scan
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 bg-white/40 backdrop-blur-sm text-gray-900 font-semibold py-3 px-8 rounded-lg border-2 border-white/60 hover:bg-white/50 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/50 to-blue-600/50 backdrop-blur rounded-xl flex items-center justify-center text-blue-600">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                On-Spot Registration
              </h3>
              <p className="text-gray-700">
                Quick and easy registration with instant QR code generation for seamless entry.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/50 to-blue-600/50 backdrop-blur rounded-xl flex items-center justify-center text-blue-600">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                QR-Based Check-in
              </h3>
              <p className="text-gray-700">
                Fast mobile scanning for meal tracking across breakfast, lunch, and high tea.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/50 to-blue-600/50 backdrop-blur rounded-xl flex items-center justify-center text-blue-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Real-Time Analytics
              </h3>
              <p className="text-gray-700">
                Admin dashboard with live tracking and comprehensive meal distribution reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glassmorphism-dark border-t px-4 py-8">
        <div className="max-w-5xl mx-auto text-center text-gray-700 text-sm">
          <p>
            AICMS © 2024 AI4SG Conference. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
