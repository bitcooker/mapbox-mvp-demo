import React from 'react';
import clsx from 'clsx';

interface IProps {
  className?: string;
  children: React.ReactNode;
  onClick?(): void;
}
const OutlineButton: React.FC<IProps> = ({ className, onClick, children }) => {
  return (
    <div
      className={clsx(
        className,
        'cursor-pointer flex flex-col items-center justify-center border rounded-lg p-2'
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default OutlineButton;
