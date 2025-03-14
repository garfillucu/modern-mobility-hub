
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sun, Moon, Menu, X, UserRound, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userHasAdminRole, setUserHasAdminRole] = useState(false);
  
  // Effect to check and set admin role status
  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('User has admin role:', user.email);
      setUserHasAdminRole(true);
    } else {
      setUserHasAdminRole(false);
    }
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            ModernRent
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link to="/cars" className="hover:text-primary transition-colors">
              Mobil
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              Tentang Kami
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Kontak
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="hover:text-primary transition-colors flex items-center">
                  <UserRound size={16} className="mr-1" />
                  Profil
                </Link>
                {userHasAdminRole && (
                  <Link to="/admin/users" className="hover:text-primary transition-colors flex items-center text-primary font-medium">
                    <ShieldCheck size={16} className="mr-1" />
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <Link to="/login" className="hover:text-primary transition-colors">
                Login
              </Link>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                to="/cars"
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mobil
              </Link>
              <Link
                to="/about"
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tentang Kami
              </Link>
              <Link
                to="/contact"
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontak
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="hover:text-primary transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserRound size={16} className="mr-1" />
                    Profil
                  </Link>
                  {userHasAdminRole && (
                    <Link
                      to="/admin/users"
                      className="hover:text-primary transition-colors flex items-center text-primary font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShieldCheck size={16} className="mr-1" />
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
