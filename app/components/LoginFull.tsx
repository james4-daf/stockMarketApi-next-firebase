'use client';
import { signInAnonymously } from 'firebase/auth';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { auth } from '../firebase/firebase';
import { Button } from './ui/button';
import GoogleLoginButton from './ui/googleLoginButton';

export default function LoginFull() {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <div className="flex items-center justify-center min-h-screen px-8">
      <div className="bg-brand rounded-3xl border  border-gray-800 w-full  p-10 space-y-6 relative max-w-sm">
        <div className="flex justify-center ">
          <Image
            src="/informiumLogo.png"
            alt="Informium Logo"
            width={150}
            height={100}
            className=""
          />
        </div>
        <div className="justify-center flex mb-6">
          <GoogleLoginButton />
        </div>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-black"></div>
          <span className="mx-4 text-black-500 text-lg font-semibold">Or</span>
          <div className="flex-grow border-t border-black"></div>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <Button className="w-full">Sign in</Button>
          {pathname === '/guest' && (
            <Button
              className="w-full"
              variant="outline"
              onClick={async () => {
                try {
                  await signInAnonymously(auth);
                } catch (error: unknown) {
                  if (error instanceof Error) {
                    alert('Guest login failed: ' + error.message);
                  } else {
                    alert('Guest login failed.');
                  }
                }
              }}
            >
              Continue as Guest
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
