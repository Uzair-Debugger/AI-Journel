'use client';

import React, { useRef } from 'react';

interface ColorPickerProps {
  label: string;
  title: string;
  defaultValue?: string;
  onChange: (color: string) => void;
  /** Extra Tailwind classes for the label text */
  labelClassName?: string;
}

/**
 * Wraps a hidden <input type="color"> behind a visible label button.
 * Clicking the label triggers the native color picker.
 */
export default function ColorPicker({
  label,
  title,
  defaultValue = '#000000',
  onChange,
  labelClassName = '',
}: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <span
      title={title}
      onClick={() => inputRef.current?.click()}
      className={[
        'relative inline-flex items-center justify-center',
        'w-[30px] h-[26px] rounded border border-gray-300',
        'bg-white cursor-pointer font-bold text-[13px]',
        'hover:bg-gray-200 overflow-hidden select-none',
      ].join(' ')}
    >
      <span className={labelClassName}>{label}</span>
      <input
        ref={inputRef}
        type="color"
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        // Visually hidden but still interactive
        className="absolute opacity-0 w-full h-full cursor-pointer border-none p-0"
      />
    </span>
  );
}
