'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { Toaster } from 'react-hot-toast';

interface AuthContextType {
  user: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      <Toaster />
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
