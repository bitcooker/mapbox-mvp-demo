import React from 'react';
import clsx from 'clsx';

interface IProps {
  className?: string;
  children: React.ReactNode;
  onClick?(): void;
}

const FillButton: React.FC<IProps> = ({ className, onClick, children }) => {
  return (
    <div
      className={clsx(
        className,
        'flex items-center justify-center py-1 px-2 transition-all bg-white rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200'
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default FillButton;
