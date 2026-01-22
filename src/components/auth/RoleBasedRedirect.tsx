import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const RoleBasedRedirect = () => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (hasRole('Admin')) {
      navigate('/admin');
    } else if (hasRole('Super Admin')) {
      navigate('/super-admin');
    } else {
      navigate('/user');
    }
  }, [isAuthenticated, hasRole, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );
};

export default RoleBasedRedirect;
