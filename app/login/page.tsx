import type { Metadata } from 'next';
import LoginFull from '../components/LoginFull';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to TIKR check to access your watchlist, filings, and notes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginFull />;
}
