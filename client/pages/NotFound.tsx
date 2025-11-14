import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900">404</h1>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-gray-800">Page not found</p>
          <p className="text-gray-600">
            The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-block bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
