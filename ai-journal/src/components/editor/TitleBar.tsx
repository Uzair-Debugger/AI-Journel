'use client';

import React from 'react';

interface TitleBarProps {
  onSave: () => void;
  onPrint: () => void;
}

/**
 * Top title bar with document name and action buttons.
 * Kept separate so it can later accept a dynamic document title prop.
 */
export default function TitleBar({ onSave, onPrint }: TitleBarProps) {
  const btnCls =
    'bg-white/15 border border-white/30 text-white px-3 py-1 rounded text-[13px] cursor-pointer hover:bg-white/25 transition-colors';

  return (
    <div className="flex items-center justify-between bg-[#2b579a] text-white px-4 py-1.5 text-sm">
      <span className="font-semibold text-[15px]">📄 Document Editor</span>
      <div className="flex gap-2">
        <button className={btnCls} onClick={onSave} title="Save as HTML">
          💾 Save
        </button>
        <button className={btnCls} onClick={onPrint} title="Print (Ctrl+P)">
          🖨️ Print
        </button>
      </div>
    </div>
  );
}
