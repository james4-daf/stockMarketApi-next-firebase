'use client';

import { useAuth } from '@/app/hooks/useAuth';
// import { useAuth } from './hooks/useAuth';
import Login from '@/app/components/Login';
import { signOutFromGoogle } from '@/app/firebase/firebase';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  console.log('userData', user);
  return (
    !loading && (
      <div className="p-4">
        {user ? (
          <>
            <h1>{user?.displayName}</h1>
            <h1>{user?.email}</h1>

            <button
              className="flex items-center w-full px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              onClick={signOutFromGoogle}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Login />
          </>
        )}
      </div>
    )
  );
}
