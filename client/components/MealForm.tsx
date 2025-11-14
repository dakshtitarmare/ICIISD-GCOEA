import { useState } from 'react';
import { Loader } from 'lucide-react';
import { formatMealType, MEAL_TYPES, MealType } from '@/lib/dateUtils';

interface MealFormProps {
  day: 1 | 2;
  qrData: string;
  participantName?: string;
  participantCategory?: string;
  onSubmit: (mealType: MealType) => Promise<void>;
  isLoading?: boolean;
}

export default function MealForm({
  day,
  qrData,
  participantName,
  participantCategory,
  onSubmit,
  isLoading = false,
}: MealFormProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeal || isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedMeal);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealOptions = MEAL_TYPES.map(meal => ({
    value: meal,
    label: formatMealType(meal),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Participant Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-3">Participant Info</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium text-gray-900">
              {participantName || 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Category</p>
            <p className="font-medium text-gray-900">
              {participantCategory || 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">QR Code</p>
            <p className="font-mono text-xs text-gray-700 break-all">
              {qrData}
            </p>
          </div>
        </div>
      </div>

      {/* Day Info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm text-gray-600">Conference Day</p>
        <p className="text-lg font-semibold text-gray-900">
          Day {day} - {day === 1 ? 'Dec 19' : 'Dec 20'}
        </p>
      </div>

      {/* Meal Type Selection */}
      <div>
        <label htmlFor="meal-type" className="block text-sm font-semibold text-gray-700 mb-3">
          Select Meal Type
        </label>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
          {mealOptions.map(option => (
            <label key={option.value} className="relative cursor-pointer">
              <input
                type="radio"
                name="meal-type"
                value={option.value}
                checked={selectedMeal === option.value}
                onChange={(e) => setSelectedMeal(e.target.value as MealType)}
                disabled={isSubmitting || isLoading}
                className="sr-only"
              />
              <div className={`
                p-4 rounded-lg border-2 transition-colors text-center font-medium
                ${selectedMeal === option.value
                  ? 'border-primary bg-blue-50 text-primary'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                }
                ${isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                {option.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Mark Meal'
        )}
      </button>
    </form>
  );
}
