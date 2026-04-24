'use client';

import React, { useState, useRef, useEffect } from 'react';
import ToolButton from './ToolButton';

interface TablePickerProps {
  onInsert: (rows: number, cols: number) => void;
}

const GRID = 8;

export default function TablePicker({ onInsert }: TablePickerProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState({ r: 0, c: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const grid = Array.from({ length: GRID }, (_, r) =>
    Array.from({ length: GRID }, (_, c) => ({ r: r + 1, c: c + 1 })),
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <ToolButton title="Insert Table" onClick={() => setOpen((v) => !v)}>
        ⊞ Table
      </ToolButton>

      {open && (
        <div className="absolute top-[30px] left-0 z-50 bg-white border border-gray-300 rounded shadow-lg p-2">
          <p className="text-center text-xs text-gray-500 mb-1.5">
            {hovered.r} × {hovered.c}
          </p>
          {grid.map((row, ri) => (
            <div key={ri} className="flex gap-[3px] mb-[3px]">
              {row.map((cell) => (
                <div
                  key={`${cell.r}-${cell.c}`}
                  onMouseEnter={() => setHovered({ r: cell.r, c: cell.c })}
                  onClick={() => {
                    onInsert(cell.r, cell.c);
                    setOpen(false);
                  }}
                  className={[
                    'w-[18px] h-[18px] border cursor-pointer',
                    cell.r <= hovered.r && cell.c <= hovered.c
                      ? 'bg-blue-100 border-blue-600'
                      : 'bg-white border-gray-300',
                  ].join(' ')}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
