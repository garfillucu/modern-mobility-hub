
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Shield, Car, CalendarRange } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Profile = () => {
  const { user, logout } = useAuth();
  const [userDbRole, setUserDbRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user role:", error);
          } else if (data) {
            console.log("Fetch user role from DB:", data.role);
            setUserDbRole(data.role);
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Gunakan role dari database jika tersedia, jika tidak gunakan dari user object
  const roleToDisplay = userDbRole || user.role || 'User';
  
  // Format role untuk tampilan - kapitalisasi untuk 'Admin'
  const displayRole = 
    roleToDisplay?.toLowerCase() === 'admin' ? 'Admin' : roleToDisplay;
  
  // Debug info
  console.log("Profile - User data:", { 
    email: user.email, 
    authRole: user.role,
    dbRole: userDbRole, 
    displayRole 
  });

  const isAdmin = displayRole === 'Admin';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <p>Memuat data profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Detail akun dan status pengguna</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">Email:</span>
                  <span className="ml-2">{user.email}</span>
                </div>
                <div>
                  <span className="font-semibold">Role:</span>
                  <span className="ml-2 capitalize flex items-center">
                    {displayRole} 
                    {displayRole === 'Admin' && (
                      <Shield className="ml-2 h-4 w-4 text-primary" />
                    )}
                  </span>
                </div>
                
                <Button
                  onClick={logout}
                  variant="destructive"
                  className="mt-4"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Menu Cepat</CardTitle>
              <CardDescription>Akses cepat ke fitur-fitur utama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link to="/bookings">
                  <Button className="w-full flex justify-between items-center" variant="outline">
                    <span>Riwayat Pemesanan</span>
                    <CalendarRange className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to="/cars">
                  <Button className="w-full flex justify-between items-center" variant="outline">
                    <span>Cari Mobil</span>
                    <Car className="h-5 w-5" />
                  </Button>
                </Link>
                
                {isAdmin && (
                  <Link to="/admin">
                    <Button className="w-full flex justify-between items-center">
                      <span>Dashboard Admin</span>
                      <Shield className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Booking History Preview */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Riwayat Pemesanan Terbaru</h2>
          <Link to="/bookings">
            <Button variant="link">Lihat Semua</Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <CalendarRange className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Lihat riwayat pemesanan Anda</h3>
              <p className="text-muted-foreground mb-4">
                Lihat status, detail pemesanan, dan riwayat perjalanan Anda
              </p>
              <Link to="/bookings">
                <Button>Lihat Riwayat Pemesanan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
