import React from 'react';
import MenuLink from '@/components/common/link/MenuLink';
import MapAnimation from '@/components/common/animations/MapAnimation';

const Home: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full -mt-20 '>
      <div className='relative'>
        <MapAnimation />
        <div className='absolute bottom-[50%] translate-y-[50%] left-0 w-full '>
          <h1 className='text-4xl font-semibold text-center text-gray-600'>
            MapBox MVP
          </h1>
          <h5 className='mt-4 text-lg font-medium text-center text-gray-500'>
            @bitcooker
          </h5>
        </div>
      </div>
      <div className='flex flex-col mt-1'>
        <MenuLink href='/main'>Start</MenuLink>
      </div>
    </div>
  );
};

export default Home;
