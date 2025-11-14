// Conference dates: December 19-20
// Day 1: December 19
// Day 2: December 20

export const CONFERENCE_START_DATE = new Date(2024, 11, 19); // December 19
export const CONFERENCE_END_DATE = new Date(2024, 11, 20); // December 20

export const MEAL_TYPES = ['breakfast', 'lunch', 'hitea'] as const;
export type MealType = typeof MEAL_TYPES[number];

/**
 * Determines which conference day (1 or 2) a given date falls on
 * @param date - The date to check
 * @returns 1 for Day 1 (Dec 19), 2 for Day 2 (Dec 20), null if outside conference dates
 */
export const conferenceDayForDate = (date: Date = new Date()): 1 | 2 | null => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Check if date is Dec 19
  if (month === 11 && day === 19) {
    return 1;
  }

  // Check if date is Dec 20
  if (month === 11 && day === 20) {
    return 2;
  }

  return null;
};

/**
 * Get current conference day based on today's date
 */
export const getCurrentConferenceDay = (): 1 | 2 | null => {
  return conferenceDayForDate(new Date());
};

/**
 * Format conference day display
 */
export const formatConferenceDay = (day: 1 | 2 | null): string => {
  if (day === 1) return 'Day 1 - Dec 19';
  if (day === 2) return 'Day 2 - Dec 20';
  return 'Outside Conference Dates';
};

/**
 * Format meal type for display
 */
export const formatMealType = (mealType: MealType): string => {
  const map: Record<MealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    hitea: 'High Tea'
  };
  return map[mealType];
};
