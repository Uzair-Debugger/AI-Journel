'use client';

import React from 'react';

interface ToolButtonProps {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable toolbar button.
 * Accepts an `active` prop to show pressed/highlighted state.
 */
export default function ToolButton({
  title,
  active = false,
  disabled = false,
  onClick,
  children,
  className = '',
}: ToolButtonProps) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center',
        'h-[26px] min-w-[28px] px-[7px]',
        'rounded text-[13px] text-gray-700 whitespace-nowrap',
        'border border-transparent',
        'transition-colors duration-100',
        active
          ? 'bg-blue-100 border-blue-600 text-blue-700'
          : 'bg-transparent hover:bg-gray-200 hover:border-gray-400',
        disabled ? 'opacity-40 cursor-default' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
