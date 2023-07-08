import React from 'react';
import clsx from 'clsx';

interface IProps {
  variant: string;
  className?: string;
  children: React.ReactNode;
  onClick?(e?: React.MouseEvent<HTMLDivElement>): void;
}

const Button: React.FC<IProps> = ({
  variant,
  className,
  onClick,
  children,
}) => {
  let basicClassName = '';
  switch (variant) {
    case 'basic':
      basicClassName =
        'cursor-pointer flex flex-col items-center justify-center';
      break;
    case 'fill':
      basicClassName =
        'flex items-center justify-center py-1 px-2 transition-all bg-white rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200';
      break;
    case 'outline':
      basicClassName =
        'cursor-pointer flex flex-col items-center justify-center border rounded-lg p-2';
      break;
  }
  return (
    <div className={clsx(className, basicClassName)} onClick={onClick}>
      {children}
    </div>
  );
};

export default Button;
