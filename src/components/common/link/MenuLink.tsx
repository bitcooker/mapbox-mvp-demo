import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

interface IProps {
  className?: string;
  href: string;
  children: React.ReactNode;
}

const MenuLink: React.FC<IProps> = ({ className, href, children }) => {
  return (
    <Link
      href={href}
      className={clsx(
        className,
        'bg-gray-800 text-white text-base font-semibold py-2 px-4 m-2 hover:bg-gray-600 rounded-lg'
      )}
    >
      {children}
    </Link>
  );
};

export default MenuLink;
