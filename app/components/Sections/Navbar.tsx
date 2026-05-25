'use client';

import { ThemeToggle } from '@/app/components/ThemeToggle';
import { signOutFromGoogle } from '@/app/firebase/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SearchBar } from '../SearchBar';
import { MarketStatusPill } from './MarketStatusPill';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/watchlist', label: 'Home' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/notes', label: 'Notes' },
];

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const isActive =
    label === 'Watchlist'
      ? pathname === '/watchlist'
      : label === 'Notes'
        ? pathname.startsWith('/notes')
        : pathname === '/watchlist' || pathname === '/';

  return (
    <Link
      href={href}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-brand/60 text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {label}
    </Link>
  );
}

function UserAvatar({
  displayName,
  photoURL,
  onLogout,
}: {
  displayName: string;
  photoURL: string | null;
  onLogout: () => void;
}) {
  const initial = (displayName || 'U').charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-sm font-semibold text-white ring-2 ring-violet-200 dark:ring-violet-800"
        >
          {photoURL ? (
            <Image
              src={photoURL}
              alt="Profile"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>{displayName || 'My Account'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onLogout}
            className="cursor-pointer text-red-500"
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOutFromGoogle();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
        <Link href="/watchlist" className="shrink-0">
          <Image
            src="/tikrchecklogo.png"
            alt="TikrCheck Logo"
            height={30}
            width={100}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              href={link.href}
              label={link.label}
              pathname={pathname}
            />
          ))}
        </nav>

        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <MarketStatusPill />
          </div>
          <ThemeToggle />
          {user && (
            <UserAvatar
              displayName={user.displayName}
              photoURL={user.photoURL}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}

export default Navbar;
