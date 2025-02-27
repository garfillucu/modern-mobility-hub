
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
      return userDataCache.get(userId) || null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        // Store in cache
        userDataCache.set(userId, userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Start with auth user info immediately
        setUser(user);
        
        // Then enhance with Firestore data
        const userData = await fetchUserData(user.uid);
        if (userData) {
          setUser(prev => ({ 
            ...prev as User, 
            role: userData.role
          }));
        }
      } else {
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
      
      // Store in cache immediately
      userDataCache.set(user.uid, userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<UserData> => {
    try {
      const { user: authUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user data immediately after login
      const userData = await fetchUserData(authUser.uid);
      if (!userData) {
        throw new Error('User data not found');
      }
      
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
