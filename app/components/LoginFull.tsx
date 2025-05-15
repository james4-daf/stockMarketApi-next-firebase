'use client';
import { Button } from './ui/button';
import GoogleLoginButton from './ui/googleLoginButton';

export default function LoginFull() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-3xl border  border-gray-800 w-full max-w-md p-10 space-y-6 relative">
        <GoogleLoginButton />

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <Button className="w-full">Sign in</Button>
        </div>
      </div>
    </div>
  );
}
