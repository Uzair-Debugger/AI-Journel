'use client';

import React from 'react';
import { DocumentStats } from '@/types/editor';
import { ZoomLevel } from '@/types/editor';

interface StatusBarProps extends DocumentStats {
  zoom: ZoomLevel;
}

/**
 * Bottom status bar — mirrors Word's word count / page indicator.
 */
export default function StatusBar({ words, chars, pages, zoom }: StatusBarProps) {
  return (
    <div className="flex gap-6 bg-[#2b579a] text-white/85 px-4 py-1 text-xs select-none">
      <span>Page {pages}</span>
      <span>Words: {words}</span>
      <span>Characters: {chars}</span>
      <span>Zoom: {zoom}%</span>
    </div>
  );
}
