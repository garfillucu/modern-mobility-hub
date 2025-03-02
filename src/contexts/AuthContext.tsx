import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface AuthUser extends User {
  role?: 'user' | 'admin';
}

interface UserData {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserData | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Function to ensure the users table exists
  const ensureUsersTableExists = async () => {
    try {
      // Check if table exists by attempting to get schema
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') { // Table does not exist error code
        console.log('Creating users table as it does not exist');
        
        // Karena metode sql() tidak tersedia, kita akan menampilkan pesan untuk membuat tabel secara manual
        console.error('Failed to create users table: sql method not available');
        toast({
          title: "Database Error",
          description: "Tabel users belum tersedia. Silakan buat tabel users di dashboard Supabase atau gunakan halaman Admin Users untuk membuat tabel secara otomatis.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking/creating users table:', error);
    }
  };

  // Function to fetch user data from Supabase
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      // Ensure users table exists before querying
      await ensureUsersTableExists();
      
      console.log('Fetching user data from Supabase for', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
      
      if (data) {
        console.log('Supabase user data:', data);
        return data as UserData;
      } else {
        console.warn('User document does not exist');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Data Access Error",
        description: "Could not load user profile. Please contact support.",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Setting up auth state listener');
      
      // Ensure users table exists
      await ensureUsersTableExists();
      
      // Initial session check
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session?.user) {
        await handleUserSession(data.session);
      } else {
        setLoading(false);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event);
          setSession(session);
          
          if (session?.user) {
            await handleUserSession(session);
          } else {
            setUser(null);
            setLoading(false);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  // Handle user session
  const handleUserSession = async (session: Session) => {
    const supabaseUser = session.user;
    console.log('User authenticated:', supabaseUser.id);
    
    // Set basic user info first
    setUser(supabaseUser as AuthUser);
    
    // Ensure users table exists
    await ensureUsersTableExists();
    
    // Then fetch and add role info
    const userData = await fetchUserData(supabaseUser.id);
    
    if (userData) {
      console.log('Setting user with role:', userData.role);
      setUser(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          role: userData.role 
        };
      });
    } else {
      // Create new user entry if not exists
      // Determine role based on email - if contains 'admin', set role to 'admin'
      const userEmail = supabaseUser.email || '';
      const userRole = userEmail.toLowerCase().includes('admin') ? 'admin' : 'user';
      
      const newUserData: Omit<UserData, 'id' | 'created_at'> = {
        email: userEmail,
        role: userRole,
      };
      
      console.log(`Creating new user with role: ${userRole} for email: ${userEmail}`);
      
      // Insert new user into database
      const { data, error } = await supabase
        .from('users')
        .insert([{ id: supabaseUser.id, ...newUserData }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating user data:', error);
        setUser(prev => {
          if (!prev) return null;
          return { 
            ...prev, 
            role: userRole // Still set the role based on email
          };
        });
      } else if (data) {
        console.log(`Created new user with role: ${data.role}`);
        setUser(prev => {
          if (!prev) return null;
          return { 
            ...prev, 
            role: data.role 
          };
        });
      }
    }
    
    setLoading(false);
  };

  const register = async (email: string, password: string) => {
    try {
      // Ensure users table exists first
      await ensureUsersTableExists();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Sekarang kita akan membuat entri user setelah pendaftaran
        // Tentukan role berdasarkan email
        const userRole = email.toLowerCase().includes('admin') ? 'admin' : 'user';
        console.log(`Registered user with email ${email}, setting role to ${userRole}`);
        
        // Buat entri user baru dengan role yang sesuai
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            id: data.user.id, 
            email: email,
            role: userRole
          }]);
          
        if (insertError) {
          console.error('Error creating user data after registration:', insertError);
        } else {
          console.log(`User data created with role: ${userRole}`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<UserData | null> => {
    try {
      // Ensure users table exists first
      await ensureUsersTableExists();
      
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Jika email belum dikonfirmasi tapi sudah dinonaktifkan di Supabase dashboard
        if (error.code === 'email_not_confirmed') {
          // Coba akses user data langsung
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
          
          if (userData) {
            // Set user secara manual
            setUser({
              id: userData.id,
              email: email,
              role: userData.role,
              // Tambahkan properti lain yang dibutuhkan
              app_metadata: {},
              user_metadata: {},
              aud: '',
              created_at: ''
            } as AuthUser);
            
            return userData as UserData;
          }
        }
        
        throw error;
      }
      
      if (data.user) {
        // User data will be fetched by the auth state change listener
        // We'll fetch it again here so we can return it
        const userData = await fetchUserData(data.user.id);
        console.log('Login successful with role:', userData?.role);
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
