import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  roles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

const RoleGuard = ({ roles, children, redirectTo = '/' }: Props) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.rol)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};

export default RoleGuard;
