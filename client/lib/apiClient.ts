import axios from 'axios';

// API base URL - adjust as needed for your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  category: 'presenter' | 'attendee';
  qr_code: string;
  createdAt: string;
}

export interface MealClaim {
  id: string;
  participant_id: string;
  day: 1 | 2;
  meal_type: 'breakfast' | 'lunch' | 'hitea';
  claimed_at: string;
}

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  college: string;
  category: 'presenter' | 'attendee';
}

export interface MealScanPayload {
  qr_data: string;
  day: 1 | 2;
  meal_type: 'breakfast' | 'lunch' | 'hitea';
}

export interface DashboardSummary {
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
  latest_claims: MealClaim[];
}

// API Functions

/**
 * Register a new participant on-the-spot
 */
export const onspotRegister = async (
  payload: RegistrationPayload
): Promise<Participant> => {
  try {
    const response = await apiClient.post<Participant>(
      '/registration/onspot',
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Registration failed'
    );
  }
};

/**
 * Lookup a participant by QR code data
 */
export const lookupQR = async (qrData: string): Promise<Participant> => {
  try {
    const response = await apiClient.get<Participant>('/lookup', {
      params: { qr_data: qrData },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'QR lookup failed'
    );
  }
};

/**
 * Scan a meal claim
 */
export const scanMeal = async (payload: MealScanPayload): Promise<{
  success: boolean;
  message: string;
  claim?: MealClaim;
}> => {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      claim?: MealClaim;
    }>('/meal/scan', payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Meal scan failed'
    );
  }
};

/**
 * Get dashboard summary
 */
export const getSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await apiClient.get<DashboardSummary>('/summary');
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch summary'
    );
  }
};

/**
 * Admin login
 */
export const adminLogin = async (
  email: string,
  password: string
): Promise<{ success: boolean; token?: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; token?: string }>(
      '/admin/login',
      { email, password }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Login failed'
    );
  }
};

export default apiClient;
