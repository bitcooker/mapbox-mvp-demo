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
        'bg-gray-600 text-white text-lg font-semibold py-2 px-10 drop-shadow-md hover:drop-shadow-2xl transition-all m-2 border rounded-full'
      )}
    >
      {children}
    </Link>
  );
};

export default MenuLink;
