
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Once auth loading is done, we can verify the role
    if (!loading) {
      setIsVerifying(false);
    }
  }, [loading]);

  // Show loading indicator while verifying
  if (loading || isVerifying) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <div className="text-lg">Memeriksa akses...</div>
      </div>
    );
  }

  // Redirect logic
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminLayout;
