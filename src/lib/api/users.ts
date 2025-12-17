import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface UserPreferences {
  preferredLanguage?: string;
  preferredCurrency?: string;
}

export const usersApiClient = {
  updatePreferences: async (userId: string, preferences: UserPreferences, token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.patch(
      `${API_BASE_URL}/users/${userId}/preferences`,
      preferences,
      { headers }
    );
    
    return response.data;
  },
};
