import React from 'react';
import clsx from 'clsx';

interface IProps {
  className?: string;
  children: React.ReactNode;
}

const FillButton: React.FC<IProps> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        className,
        'px-3 py-1 transition-all bg-white rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200'
      )}
    >
      {children}
    </div>
  );
};

export default FillButton;
