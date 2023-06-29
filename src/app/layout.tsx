import React from 'react';
import './globals.css';
import Header from '@/components/layout/Header';
import { AuthProvider } from '@/libs/firebase/auth';

export const metadata = {
  title: 'MapBox MVP',
  description: 'Simple Map Utilizing Quadkey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/favicon.png' sizes='any' />
      </head>
      <body>
        <div className='flex flex-col h-full'>
          <AuthProvider>
            <Header />
            <div className='grow'>{children}</div>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
