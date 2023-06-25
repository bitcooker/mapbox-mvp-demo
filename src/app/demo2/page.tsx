'use client';
import React from 'react';
import { SnackbarProvider } from 'notistack';
import MainMap from '@/components/pages/demo2/MainMap';

export default function Demo2Page() {
  return (
    <div className='flex flex-col h-full'>
      <div className='flex justify-between h-full m-3'>
        <div className='w-[30%] h-full bg-white border rounded-lg drop-shadow-md'></div>
        <div className='w-full p-1 mx-3 bg-white border rounded-lg overflow-clip drop-shadow-md'>
          <MainMap />
        </div>
      </div>
      <SnackbarProvider />
    </div>
  );
}
