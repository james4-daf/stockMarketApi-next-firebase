'use client';
import React from 'react';
import Navbar from './components/Sections/Navbar';

import { useAuth } from './hooks/useAuth';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    // If user is not authenticated, return null or a loading state
    return children;
    // or <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

export default AppContent;
