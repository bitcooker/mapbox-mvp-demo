import React from 'react';

const Header: React.FC = () => {
  return (
    <div className='p-5 bg-white border backdrop-blur-lg drop-shadow-sm'>
      <div className='flex justify-between'>
        <h1 className='text-4xl font-semibold text-gray-600'>Demo</h1>
      </div>
    </div>
  );
};

export default Header;
