'use client';
import { Eye, LogOut, Search, UserCog } from 'lucide-react';

import { signOutFromGoogle } from '@/app/firebase/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';

// Menu items.
const items = [
  {
    title: 'Watchlist',
    url: '/watchlist',
    icon: Eye,
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: UserCog,
  },
];

export function AppSidebar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOutFromGoogle();
    router.push('/'); // Redirect to home after logout
  };

  // While loading, prevent flicker
  if (loading) return null;

  // Show login if not authenticated
  if (!user) return null;
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Image
                  src={'/informiumLogo.png'}
                  alt={'Informium logo'}
                  width={200}
                  height={120}
                />
                {/*<span className="text-base font-semibold">Informium</span>*/}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <button
            className="flex items-center w-full px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Logout</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
