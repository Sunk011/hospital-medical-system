// Storage keys
const TOKEN_KEY = 'hospital_access_token';
const REFRESH_TOKEN_KEY = 'hospital_refresh_token';
const USER_KEY = 'hospital_user';

/**
 * Get access token from storage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set access token to storage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove access token from storage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set refresh token to storage
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Remove refresh token from storage
 */
export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Get user from storage
 */
export function getStoredUser<T>(): T | null {
  const user = localStorage.getItem(USER_KEY);
  if (user) {
    try {
      return JSON.parse(user) as T;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Set user to storage
 */
export function setStoredUser<T>(user: T): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove user from storage
 */
export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

/**
 * Clear all auth data from storage
 */
export function clearAuthStorage(): void {
  removeToken();
  removeRefreshToken();
  removeStoredUser();
}
