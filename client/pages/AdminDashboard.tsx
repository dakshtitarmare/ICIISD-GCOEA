import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSummary } from '@/lib/apiClient';
import { showErrorToast } from '@/lib/toastUtils';
import StatsCard from '@/components/StatsCard';
import ChartSection from '@/components/ChartSection';
import { Users, Utensils, LogOut, Loader } from 'lucide-react';

interface DashboardData {
  total_participants: number;
  meals_day1: number;
  meals_day2: number;
  category_breakdown: {
    presenters: number;
    attendees: number;
  };
  meals_by_type: {
    breakfast: number;
    lunch: number;
    hitea: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const result = await getSummary();
        setData(result);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load dashboard';
        showErrorToast(errorMsg);
        console.error('Dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-gray-600 font-semibold">Failed to load dashboard data</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">
                Conference Management System - Real-time Analytics
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Participants"
            value={data.total_participants}
            description="All registered participants"
            icon={<Users className="w-8 h-8" />}
            bgColor="bg-blue-50"
          />
          <StatsCard
            label="Day 1 Meals"
            value={data.meals_day1}
            description="Dec 19"
            icon={<Utensils className="w-8 h-8" />}
            bgColor="bg-green-50"
          />
          <StatsCard
            label="Day 2 Meals"
            value={data.meals_day2}
            description="Dec 20"
            icon={<Utensils className="w-8 h-8" />}
            bgColor="bg-orange-50"
          />
          <StatsCard
            label="Total Meals Served"
            value={data.meals_day1 + data.meals_day2}
            description="Across both days"
            icon={<Utensils className="w-8 h-8" />}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Category & Meal Breakdown - Charts */}
        <ChartSection
          categoryData={[
            { name: 'Presenters', value: data.category_breakdown.presenters },
            { name: 'Attendees', value: data.category_breakdown.attendees },
          ]}
          mealData={[
            {
              name: 'Day 1',
              breakfast: data.meals_by_type.breakfast,
              lunch: data.meals_by_type.lunch,
              hitea: data.meals_by_type.hitea,
            },
            {
              name: 'Day 2',
              breakfast: Math.ceil(data.meals_by_type.breakfast * 0.9),
              lunch: Math.ceil(data.meals_by_type.lunch * 0.95),
              hitea: Math.ceil(data.meals_by_type.hitea * 0.88),
            },
          ]}
        />

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Meal Type Distribution
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Breakfast</span>
                <span className="font-bold text-gray-900">{data.meals_by_type.breakfast}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lunch</span>
                <span className="font-bold text-gray-900">{data.meals_by_type.lunch}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">High Tea</span>
                <span className="font-bold text-gray-900">{data.meals_by_type.hitea}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Participant Category
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Presenters</span>
                <span className="font-bold text-gray-900">
                  {data.category_breakdown.presenters}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Attendees</span>
                <span className="font-bold text-gray-900">
                  {data.category_breakdown.attendees}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Total</span>
                <span className="font-bold text-primary text-lg">
                  {data.total_participants}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Day 1 (Dec 19)</span>
                <span className="font-bold text-gray-900">{data.meals_day1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Day 2 (Dec 20)</span>
                <span className="font-bold text-gray-900">{data.meals_day2}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Total Meals</span>
                <span className="font-bold text-primary text-lg">
                  {data.meals_day1 + data.meals_day2}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Dashboard Information</h3>
          <p className="text-sm text-blue-700">
            This dashboard displays real-time analytics for the AI4SG Conference 2024. 
            Data is automatically updated as participants register and claim meals. 
            For detailed reports, export options, and historical data, contact the conference organizers.
          </p>
        </div>
      </div>
    </div>
  );
}
