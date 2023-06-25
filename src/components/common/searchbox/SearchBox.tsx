'use client';
import React, { useState, useEffect } from 'react';
import SearchIcon from '@/components/common/icons/SearchIcon';
import FillButton from '@/components/common/button/FillButton';

const SearchBox: React.FC = () => {
  const [isOptionMenuOpen, setIsPotionMenuOpen] = useState(false);

  return (
    <div className='absolute top-0 left-[50%] translate-x-[-50%] px-4 py-1 bg-white border drop-shadow-sm rounded-full mt-2'>
      <div className='flex items-center justify-between'>
        <SearchIcon className='w-8 h-8 stroke-gray-500' />
        <input
          type='text'
          className=' text-gray-600 text-base rounded-lg outline-none block w-full p-2.5'
          placeholder='Search'
          required
        />
        <span className='bg-gray-300 w-[1px] h-6 mx-2'></span>
        <FillButton>Quadkey</FillButton>
      </div>
      <div className='absolute bottom-0 right-0 pt-2 pr-2 translate-y-[100%]'>
        <div className='p-1 bg-white rounded-md drop-shadow-sm'>
          <FillButton className='rounded-none'>Quadkey</FillButton>
          <FillButton className='rounded-none'>Lat/Lng</FillButton>
          <FillButton className='rounded-none'>Address</FillButton>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
