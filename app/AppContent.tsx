'use client';
import React, { useState } from 'react';
import { AppSidebar } from './components/Sections/AppSidebar';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
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
      <SidebarProvider>
        <SidebarTrigger />
        <AppSidebar />
        {children}
      </SidebarProvider>
    </div>
  );
}

export default AppContent;
