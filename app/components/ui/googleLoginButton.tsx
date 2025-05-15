import Image from 'next/image';
import React from 'react';
import { signInWithGoogle } from '../../firebase/firebase';

const GoogleLoginButton = () => {
  return (
    <div>
      <button
        onClick={signInWithGoogle}
        className="px-4 py-2 border flex items-center gap-2 border-slate-200 dark:border-slate-700 rounded-lg
          text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500
          hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150"
      >
        <Image
          className="w-6 h-6"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          loading="lazy"
          alt="google logo"
          width="96"
          height="96"
        />
        <span>Login with Google</span>
      </button>
    </div>
  );
};

export default GoogleLoginButton;
