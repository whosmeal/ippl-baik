import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'fitshop-session';

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return session?.token && session?.user ? session : null;
  } catch (error) {
    console.error('Sesi lokal FitShop tidak dapat dibaca.', error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  async function login(credentials) {
    const result = await authService.login(credentials);
    const nextSession = { token: result.token, user: result.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession.user;
  }

  async function register(details) {
    return authService.register(details);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, login, register, logout }),
    [session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}