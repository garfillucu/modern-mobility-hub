
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Debug information
    console.log("AdminLayout - Auth state:", { user, loading, isAdmin: user?.role === 'admin' });
    
    // Once auth loading is done, we can verify the role
    if (!loading) {
      if (user) {
        console.log("User details:", { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          metadata: user.user_metadata
        });
        
        // Check if the user has admin role (safely checking)
        const hasAdminRole = user.role === 'admin';
        setIsAdmin(hasAdminRole);
        console.log("User admin status:", hasAdminRole);
      }
      
      setIsVerifying(false);
    }
  }, [loading, user]);

  // Show loading indicator while verifying
  if (loading || isVerifying) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <div className="text-lg">Memeriksa akses admin...</div>
      </div>
    );
  }

  // Redirect logic
  if (!user) {
    console.log("AdminLayout - No user, redirecting to login");
    toast({
      title: "Akses Ditolak",
      description: "Anda harus login terlebih dahulu untuk mengakses halaman admin.",
      variant: "destructive"
    });
    return <Navigate to="/login" />;
  }

  // Now use the isAdmin state to check admin role instead of directly checking user.role
  if (!isAdmin) {
    console.log("AdminLayout - User is not admin, redirecting to home. Role:", user.role);
    toast({
      title: "Akses Ditolak",
      description: "Anda tidak memiliki akses admin.",
      variant: "destructive"
    });
    return <Navigate to="/" />;
  }

  console.log("AdminLayout - Access granted for admin");
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Admin */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-card">
        <div className="flex flex-col space-y-6 p-4">
          <div className="p-2">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-muted-foreground text-sm">Selamat datang, {user.email}</p>
          </div>
          
          <nav className="flex flex-col space-y-1">
            <a href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-accent">
              Dashboard
            </a>
            <a href="/admin/users" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-accent">
              Manajemen User
            </a>
            <a href="/admin/cars" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-accent">
              Manajemen Mobil
            </a>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1 pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
