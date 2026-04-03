import { useAuth } from '../../../shared/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Spinner } from '../../../shared/components/Spinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) {
    return <Spinner size="large" />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};


export default AdminGuard;