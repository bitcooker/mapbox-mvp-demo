'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { useAuth } from '@/libs/firebase/auth';
import {
  signInWithGoogleHandler,
  signOutHandler,
} from '@/libs/firebase/authentication';
import FillButton from '@/components/common/button/FillButton';
import MenuIcon from '@/components/common/icons/MenuIcon';

const Header: React.FC = () => {
  return (
    <div className='z-50 p-2 bg-white border backdrop-blur-lg drop-shadow-sm'>
      <div className='flex items-center justify-between item'>
        <Logo />
        <Profile />
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const profileMenuRef = useDetectClickOutside({
    onTriggered: () => {
      setIsMenuOpen(false);
    },
  });

  const handleOnProfileClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthButtonClick = async () => {
    if (user) {
      setIsMenuOpen(false);
      await signOutHandler();
    } else {
      setIsMenuOpen(false);
      await signInWithGoogleHandler();
    }
  };

  return (
    <div className='relative'>
      <div
        className='flex items-center py-1 transition-all bg-white border rounded-full cursor-pointer hover:drop-shadow'
        onClick={handleOnProfileClick}
      >
        <div className='flex items-center'>
          {user ? (
            <h2 className='ml-3 mr-2 font-semibold text-md'>
              {user.displayName}
            </h2>
          ) : (
            <MenuIcon className='w-5 h-5 mx-5 stroke-gray-600' />
          )}
          <Image
            src={user ? user.photoURL : '/images/user.png'}
            width={40}
            height={40}
            alt={user ? user.displayName : 'User'}
            className='mr-2 border rounded-full overflow-clip'
          />
        </div>
      </div>
      {isMenuOpen && (
        <div
          ref={profileMenuRef}
          className='absolute -bottom-2 right-0 py-2 bg-white drop-shadow-sm border rounded-md translate-y-[100%] w-48 mr-1'
        >
          <FillButton className='rounded-none' onClick={handleAuthButtonClick}>
            {user ? 'Logout' : 'Login'}
          </FillButton>
        </div>
      )}
    </div>
  );
};

const Logo: React.FC = () => {
  return (
    <Link href='/' className='relative'>
      <Image
        src='/images/logo.png'
        width={100}
        height={30}
        alt='Logo'
        className='rounded-full opacity-50 drop-shadow-md'
      />
    </Link>
  );
};

export default Header;
