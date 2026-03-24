import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  permission: string;
  children: React.ReactNode;
  redirectTo?: string;
}

const PermissionGuard = ({ permission, children, redirectTo = '/' }: Props) => {
  const { hasPermission, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PermissionGuard;
