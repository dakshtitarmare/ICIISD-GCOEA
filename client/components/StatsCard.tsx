interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  bgColor?: string;
}

export default function StatsCard({
  label,
  value,
  description,
  icon,
  bgColor = 'bg-blue-50',
}: StatsCardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 ${bgColor} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-primary opacity-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
