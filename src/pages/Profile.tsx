
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
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
                {user.role || 'user'} 
                {user.role === 'admin' && (
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
