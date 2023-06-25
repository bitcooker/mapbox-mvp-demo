import React from 'react';
import './globals.css';
import Header from '@/components/layout/Header';

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
      <body className='flex flex-col min-h-[100vh]'>
        <Header />
        {children}
      </body>
    </html>
  );
}
