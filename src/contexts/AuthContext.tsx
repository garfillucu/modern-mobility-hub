
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from '@/components/ui/use-toast';

interface AuthUser extends User {
  role?: 'user' | 'admin';
}

interface UserData {
  role: 'user' | 'admin';
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserData>;
  logout: () => Promise<void>;
}

// Cache for user data to prevent redundant Firestore queries
const userDataCache = new Map<string, UserData>();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data from Firestore
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    // Check cache first
    if (userDataCache.has(userId)) {
      console.log('Using cached user data for', userId);
      return userDataCache.get(userId) || null;
    }

    try {
      console.log('Fetching user data from Firestore for', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        console.log('Firestore user data:', userData);
        
        // Validate role is a proper value
        if (!userData.role || (userData.role !== 'user' && userData.role !== 'admin')) {
          console.warn('Invalid role detected, defaulting to "user"');
          userData.role = 'user';
        }
        
        // Store in cache
        userDataCache.set(userId, userData);
        return userData;
      } else {
        console.warn('User document does not exist');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Notify user about permission issue
      toast({
        title: "Data Access Error",
        description: "Could not load user profile. Please contact support.",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        // Start with auth user info immediately for faster UI response
        console.log('User authenticated:', firebaseUser.uid);
        setUser(firebaseUser);
        
        // Then enhance with Firestore data
        console.log('Fetching additional user data');
        const userData = await fetchUserData(firebaseUser.uid);
        
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
          console.warn('No user data found, using default role');
          setUser(prev => {
            if (!prev) return null;
            return { 
              ...prev, 
              role: 'user' 
            };
          });
        }
      } else {
        console.log('User signed out');
        setUser(null);
        // Clear cache on logout
        userDataCache.clear();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const userData: UserData = {
        email: user.email || '',
        role: 'user' as const, // Explicitly type this as 'user'
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User registered with role:', userData.role);
      
      // Store in cache immediately
      userDataCache.set(user.uid, userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<UserData> => {
    try {
      console.log('Attempting login for:', email);
      const { user: authUser } = await signInWithEmailAndPassword(auth, email, password);
      console.log('User authenticated:', authUser.uid);
      
      // Fetch user data immediately after login
      const userData = await fetchUserData(authUser.uid);
      if (!userData) {
        console.error('No user data found after login');
        
        // Create default userData as fallback
        const defaultUserData: UserData = {
          email: authUser.email || '',
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        // Store default data in Firestore
        await setDoc(doc(db, 'users', authUser.uid), defaultUserData);
        console.log('Created default user data with role: user');
        
        // Update cache
        userDataCache.set(authUser.uid, defaultUserData);
        
        return defaultUserData;
      }
      
      console.log('Login successful with role:', userData.role);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear cache on logout
      userDataCache.clear();
      console.log('User logged out, cache cleared');
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
