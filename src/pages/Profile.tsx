
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
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
          </div>

          <button
            onClick={logout}
            className="mt-6 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

