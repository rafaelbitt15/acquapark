import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';

export default function ProtectedRoute({ children }) {
  const { token, checkAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setChecking(false);
        return;
      }
      const result = await checkAuth();
      setIsAuthenticated(result);
      setChecking(false);
    };
    verify();
  }, [token, checkAuth]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
