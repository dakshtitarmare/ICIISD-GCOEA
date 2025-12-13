import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartSectionProps {
  categoryData?: Array<{
    name: string;
    value: number;
  }>;
  mealData?: Array<{
    name: string;
    breakfast: number;
    lunch: number;
    hitea: number;
  }>;
}

const COLORS = ['#0EA5E9', '#06B6D4', '#10B981', '#F59E0B'];

export default function ChartSection({ categoryData, mealData }: ChartSectionProps) {
  const defaultCategoryData = categoryData || [
    { name: 'Presenters', value: 45 },
    { name: 'Attendees', value: 155 },
  ];

  const defaultMealData = mealData || [
    {
      name: 'Day 1',
      breakfast: 120,
      lunch: 135,
      hitea: 128,
    },
    {
      name: 'Day 2',
      breakfast: 110,
      lunch: 140,
      hitea: 115,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart - Category Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Participant Category Breakdown
        </h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={defaultCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#0EA5E9"
                dataKey="value"
              >
                {defaultCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} participants`, 'Count']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Meals Served */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Meals Served per Type
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={defaultMealData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              formatter={(value: number) => [`${value} meals`, 'Count']}
            />
            <Legend />
            <Bar dataKey="breakfast" fill="#0EA5E9" name="Breakfast" />
            <Bar dataKey="lunch" fill="#06B6D4" name="Lunch" />
            <Bar dataKey="hitea" fill="#10B981" name="High Tea" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
