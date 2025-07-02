import { Button } from '@/app/components/ui/button';
import { signOutFromGoogle } from '@/app/firebase/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOutIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SearchBar } from '../SearchBar';

function UserMenu({ handleLogout }: { handleLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <UserIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>
              <UserIcon />
            </span>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-500 cursor-pointer"
          >
            <span>
              <LogOutIcon />
            </span>
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOutFromGoogle();
    router.push('/'); // Redirect to home after logout
  };
  return (
    <div className="bg-brand p-2 sticky top-0 z-50  ">
      <div className="flex items-center justify-between gap-6">
        <Link href="/" className="top-0 z-50 p-2">
          <Image
            src="/informiumText.png"
            alt="Informium Logo"
            height={30}
            width={100}
            className=""
            priority
          />
        </Link>
        <div className="max-w-5xl w-full">
          <SearchBar />
        </div>
        <UserMenu handleLogout={handleLogout} />
      </div>
    </div>
  );
}

export default Navbar;
