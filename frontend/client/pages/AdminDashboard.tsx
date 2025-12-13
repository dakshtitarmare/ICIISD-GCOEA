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

  // useEffect(() => {
  //   // Check if user is authenticated
  //   const token = localStorage.getItem('adminToken');
  //   if (!token) {
  //     navigate('/admin/login');
  //     return;
  //   }

  //   // Fetch dashboard data
  //   const fetchData = async () => {
  //     try {
  //       const result = await getSummary();
  //       setData(result);
  //     } catch (error) {
  //       const errorMsg = error instanceof Error ? error.message : 'Failed to load dashboard';
  //       showErrorToast(errorMsg);
  //       console.error('Dashboard error:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [navigate]);

  useEffect(() => {
    // --- Mock token logic for prototype ---
    const token = localStorage.getItem('adminToken');
    // Skip redirect — always allow access in prototype
    if (!token) {
      console.log('⚠️ No admin token found — using mock data for prototype');
    }

    // --- Mock data instead of API ---
    const fetchMockData = async () => {
      setIsLoading(true);

      try {
        // Simulate small delay
        await new Promise((res) => setTimeout(res, 800));

        const mockData: DashboardData = {
          total_participants: 10,
          meals_day1: 9,
          meals_day2: 8,
          category_breakdown: {
            presenters: 3,
            attendees: 7,
          },
          meals_by_type: {
            breakfast: 9,
            lunch: 10,
            hitea: 8,
          },
        };

        setData(mockData);
      } catch (error) {
        console.error('Error loading mock data:', error);
        showErrorToast('Failed to load mock data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMockData();
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




// src/pages/AdminDashboard.tsx
// src/pages/AdminDashboard.tsx
// import { useEffect, useState } from "react";
// import axios from "axios";

// import { 
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
// } from "recharts";

// import Lottie from "lottie-react";
// import dashboardAnim from "@/assets/Rolling Check Mark.json";  // existing animation
// import Skeleton from "@/components/Skeleton"; // we created this component

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [metrics, setMetrics] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   const fetchMetrics = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get("http://127.0.0.1:4000/api/admin/dashboard");
//       if (!res.data.success) {
//         setError(res.data.message);
//         setMetrics(null);
//       } else {
//         setMetrics(res.data.data);
//       }
//     } catch (err: any) {
//       setError("Network error");
//       setMetrics(null);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchMetrics();
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-6">
//         <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//           <Skeleton height="80px" />
//           <Skeleton height="80px" />
//           <Skeleton height="80px" />
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//         <p className="text-red-600 mt-4">{error}</p>
//         <button 
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" 
//           onClick={fetchMetrics}>
//           Retry
//         </button>
//       </div>
//     );
//   }

//   const chartData = [
//     { name: "Breakfast", count: metrics.meals.breakfast },
//     { name: "Lunch", count: metrics.meals.lunch },
//     { name: "Hi-Tea", count: metrics.meals.hi_tea },
//   ];

//   return (
//     <div className="p-6">

//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//         <div className="w-24">
//           <Lottie animationData={dashboardAnim} loop />
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">

//         <div className="bg-white p-4 rounded-xl shadow">
//           <p className="text-gray-500 text-sm">Total Participants</p>
//           <h2 className="text-2xl font-bold">{metrics.total_participants}</h2>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <p className="text-gray-500 text-sm">QR Assigned</p>
//           <h2 className="text-2xl font-bold">{metrics.total_qr_assigned}</h2>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <p className="text-gray-500 text-sm">Meal Updates</p>
//           <h2 className="text-2xl font-bold">{metrics.meals.total_meal_updates}</h2>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <p className="text-gray-500 text-sm">Duplicate Attempts</p>
//           <h2 className="text-2xl font-bold">{metrics.duplicate_attempts}</h2>
//         </div>

//       </div>

//       {/* Chart + Logs */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold mb-3">Meal Breakdown</h3>

//           <ResponsiveContainer width="100%" height={240}>
//             <BarChart data={chartData}>
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="count" fill="#4f46e5" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold mb-3">Latest Scan Logs</h3>

//           {metrics.latest_scan_logs.length === 0 ? (
//             <p className="text-sm text-gray-500">No logs</p>
//           ) : (
//             <div className="overflow-auto">
//               <table className="text-sm w-full">
//                 <thead>
//                   <tr className="text-left text-gray-500 border-b">
//                     <th className="py-2">Time</th>
//                     <th>Email</th>
//                     <th>Meal</th>
//                     <th>QR</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {metrics.latest_scan_logs.map((log: any) => (
//                     <tr key={log.id} className="border-b">
//                       <td className="py-1">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td>{log.email}</td>
//                       <td>{log.meal_type}</td>
//                       <td>{log.qr_hash}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }
