const API_URL = 'http://localhost:3001/api';

interface ApiError {
  error: string;
}

interface ApiResponse<T> {
  user: T;
}

export interface User {
  id: string;
  email: string;
  username: string;
  points: number;
}

export async function updateProfile(username: string, email: string) {
  try {
    const response = await fetch(`${API_URL}/auth/update-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email }),
    });

    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.error || "Failed to update profile");
    }

    const data = await response.json() as ApiResponse<User>;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Failed to update profile" };
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.error || "Failed to change password");
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to change password" };
  }
}

export async function deleteAccount(password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/delete-account`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.error || "Failed to delete account");
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete account" };
  }
}
