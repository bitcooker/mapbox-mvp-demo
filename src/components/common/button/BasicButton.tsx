import React from 'react';
import clsx from 'clsx';

interface IProps {
  className?: string;
  children: React.ReactNode;
  onClick?(): void;
}
const BasicButton: React.FC<IProps> = ({ className, onClick, children }) => {
  return (
    <div
      className={clsx(
        className,
        'cursor-pointer flex flex-col items-center justify-center'
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BasicButton;
