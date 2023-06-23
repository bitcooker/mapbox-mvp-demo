import React from 'react';
import MenuLink from '@/components/common/link/MenuLink';

const Home: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-semibold'>MapBox MVP</h1>
      <h5 className='mt-4 text-lg font-medium text-gray-500'>@bitcooker</h5>
      <div className='flex flex-col mt-5'>
        <MenuLink href='/demo1'>Demo 1</MenuLink>
        <MenuLink href='/demo2'>Demo 2</MenuLink>
      </div>
    </div>
  );
};

export default Home;
