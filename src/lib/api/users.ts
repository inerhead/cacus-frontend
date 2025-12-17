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

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/preferences`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(preferences),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update user preferences');
    }
    
    return response.json();
  },
};
