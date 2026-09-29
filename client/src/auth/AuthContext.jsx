import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    authApi.me().then((d) => setUser(d.user)).catch(() => setUser(null)).finally(() => setLoading(false));
    const onExpired = () => { setUser(null); setExpired(true); };
    window.addEventListener('qn:session-expired', onExpired);
    return () => window.removeEventListener('qn:session-expired', onExpired);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } finally { setUser(null); setExpired(false); }
  }, []);

  const value = useMemo(() => ({ user, loading, expired, logout }), [user, loading, expired, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
