'use client';
import { Eye, Search, UserCog } from 'lucide-react';

import { signOutFromGoogle } from '@/app/firebase/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Login from '../Login';
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
    title: 'Search',
    url: '#',
    icon: Search,
  },
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
          <div className="mb-6  ">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
