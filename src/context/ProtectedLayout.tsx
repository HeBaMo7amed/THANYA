import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // لو مفيش user يرجعه للوجين
  // if (!user) {
  //   return <Navigate to="/auth" state={{ from: location }} replace />;
  // }

  // لو عامل login افتح الصفحات
  return <Outlet />;
};

export default ProtectedLayout;