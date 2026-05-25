'use client';
import React from 'react';
import Navbar from './components/Sections/Navbar';
import { ThemeProvider } from './components/ThemeProvider';
import { useAuth } from './hooks/useAuth';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <Navbar />
      {children}
    </ThemeProvider>
  );
}

export default AppContent;
