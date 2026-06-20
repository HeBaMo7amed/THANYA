import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [isloggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();
  const logout = async () => {
    setIsLoggingOut(true);
    setUser(null);
    queryClient.clear();
   
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout , isloggingOut , setIsLoggingOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);