import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';

const Layout: React.FC = () => {
  const {user}=useAuth();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <header className="sticky top-0 z-50">
       { user?.role !== 'Paramedic' && 
        <Navbar />}
      </header>

      <main className="container mx-auto p-5 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
