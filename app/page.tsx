import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import HomeAuthRedirect from './components/landing/HomeAuthRedirect';
import JsonLd from './components/landing/JsonLd';
import LandingInteractivity from './components/landing/LandingInteractivity';
import LandingPage from './components/landing/LandingPage';
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site';
import './landing.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/tikrchecklogo.png',
        width: 512,
        height: 512,
        alt: 'TikrCheck logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/tikrchecklogo.png'],
  },
};

export default function Home() {
  return (
    <HomeAuthRedirect>
      <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <JsonLd />
        <LandingPage />
        <LandingInteractivity />
      </div>
    </HomeAuthRedirect>
  );
}
