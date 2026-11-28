import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL) {
  console.warn('EXPO_PUBLIC_API_URL is not set. Check .env and restart expo start.');
}

export const api = axios.create({
  baseURL,
  timeout: 60000, // Render free tier can take 30-60s to wake up
});

api.interceptors.request.use(async (cfg) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});