import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authGuard } from '../../middleware';
import type { UserRole } from '../../types';
import LoadingScreen from '../atoms/LoadingScreen';
import AccessDenied from '../atoms/AccessDenied';

interface ProtectedLayoutProps {
  allowedRoles?: UserRole[];
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();
  const result = authGuard(!!user, hasRole, allowedRoles);

  if (loading) return <LoadingScreen />;
  if (!result.allowed && result.redirectTo) return <Navigate to={result.redirectTo} replace />;
  if (!result.allowed) return <AccessDenied />;
  return <Outlet />;
};

export default ProtectedLayout;
