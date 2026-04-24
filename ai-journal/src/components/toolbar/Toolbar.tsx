'use client';

import React from 'react';
import ToolButton from './ToolButton';
import ColorPicker from './ColorPicker';
import TablePicker from './TablePicker';
import { ActiveFormattingStates, ZoomLevel } from '@/types/editor';
import { FONTS, FONT_SIZES, ZOOM_LEVELS } from '@/constants/editor';

interface ToolbarProps {
  exec: (cmd: string, value?: string | null) => void;
  activeStates: Partial<ActiveFormattingStates>;
  fontName: string;
  fontSize: number;
  onFontChange: (font: string) => void;
  onSizeChange: (size: number) => void;
  onForeColor: (color: string) => void;
  onBackColor: (color: string) => void;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertImage: () => void;
  onInsertLink: () => void;
  onInsertHR: () => void;
  zoom: ZoomLevel;
  onZoomChange: (z: ZoomLevel) => void;
}

/** Thin vertical divider between toolbar groups */
function Sep() {
  return <span className="inline-block w-px h-[22px] bg-gray-300 mx-1" />;
}

export default function Toolbar({
  exec, activeStates, fontName, fontSize,
  onFontChange, onSizeChange, onForeColor, onBackColor,
  onInsertTable, onInsertImage, onInsertLink, onInsertHR,
  zoom, onZoomChange,
}: ToolbarProps) {
  const selectCls =
    'h-[26px] text-[13px] border border-gray-300 rounded px-1 bg-white focus:outline-none';

  return (
    <div className="bg-[#f3f3f3] border-b border-gray-300 px-2 py-1 flex flex-col gap-0.5 sticky top-0 z-40">

      {/* ── Row 1: History · Font · Size · Formatting · Color ── */}
      <div className="flex items-center flex-wrap gap-0.5">
        <ToolButton title="Undo (Ctrl+Z)" onClick={() => exec('undo')}>↩</ToolButton>
        <ToolButton title="Redo (Ctrl+Y)" onClick={() => exec('redo')}>↪</ToolButton>
        <Sep />

        {/* Font family */}
        <select
          className={`${selectCls} w-[150px]`}
          value={fontName}
          onChange={(e) => onFontChange(e.target.value)}
          title="Font Family"
        >
          {FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          className={`${selectCls} w-[60px]`}
          value={fontSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          title="Font Size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <Sep />

        <ToolButton title="Bold (Ctrl+B)" active={activeStates.bold} onClick={() => exec('bold')}>
          <b>B</b>
        </ToolButton>
        <ToolButton title="Italic (Ctrl+I)" active={activeStates.italic} onClick={() => exec('italic')}>
          <i>I</i>
        </ToolButton>
        <ToolButton title="Underline (Ctrl+U)" active={activeStates.underline} onClick={() => exec('underline')}>
          <u>U</u>
        </ToolButton>
        <ToolButton title="Strikethrough" active={activeStates.strikeThrough} onClick={() => exec('strikeThrough')}>
          <s>S</s>
        </ToolButton>
        <ToolButton title="Superscript" active={activeStates.superscript} onClick={() => exec('superscript')}>
          x²
        </ToolButton>
        <ToolButton title="Subscript" active={activeStates.subscript} onClick={() => exec('subscript')}>
          x₂
        </ToolButton>

        <Sep />

        <ColorPicker label="A" title="Text Color" defaultValue="#000000" onChange={onForeColor} />
        <ColorPicker
          label="H"
          title="Highlight Color"
          defaultValue="#ffff00"
          onChange={onBackColor}
          labelClassName="text-yellow-700"
        />

        <Sep />
        <ToolButton title="Clear Formatting" onClick={() => exec('removeFormat')}>🚫</ToolButton>
      </div>

      {/* ── Row 2: Alignment · Lists · Headings · Insert · Zoom ── */}
      <div className="flex items-center flex-wrap gap-0.5">
        <ToolButton title="Align Left"    active={activeStates.justifyLeft}   onClick={() => exec('justifyLeft')}>⬅</ToolButton>
        <ToolButton title="Align Center"  active={activeStates.justifyCenter} onClick={() => exec('justifyCenter')}>↔</ToolButton>
        <ToolButton title="Align Right"   active={activeStates.justifyRight}  onClick={() => exec('justifyRight')}>➡</ToolButton>
        <ToolButton title="Justify"       active={activeStates.justifyFull}   onClick={() => exec('justifyFull')}>☰</ToolButton>

        <Sep />

        <ToolButton title="Bullet List"   active={activeStates.insertUnorderedList} onClick={() => exec('insertUnorderedList')}>• List</ToolButton>
        <ToolButton title="Numbered List" active={activeStates.insertOrderedList}   onClick={() => exec('insertOrderedList')}>1. List</ToolButton>
        <ToolButton title="Indent"  onClick={() => exec('indent')}>→ Indent</ToolButton>
        <ToolButton title="Outdent" onClick={() => exec('outdent')}>← Outdent</ToolButton>

        <Sep />

        <ToolButton title="Heading 1"  onClick={() => exec('formatBlock', 'h1')}>H1</ToolButton>
        <ToolButton title="Heading 2"  onClick={() => exec('formatBlock', 'h2')}>H2</ToolButton>
        <ToolButton title="Heading 3"  onClick={() => exec('formatBlock', 'h3')}>H3</ToolButton>
        <ToolButton title="Paragraph"  onClick={() => exec('formatBlock', 'p')}>¶</ToolButton>
        <ToolButton title="Blockquote" onClick={() => exec('formatBlock', 'blockquote')}>&ldquo; &rdquo;</ToolButton>
        <ToolButton title="Code Block" onClick={() => exec('formatBlock', 'pre')}>&lt;/&gt;</ToolButton>

        <Sep />

        <ToolButton title="Horizontal Rule" onClick={onInsertHR}>─ HR</ToolButton>
        <ToolButton title="Insert Link"     onClick={onInsertLink}>🔗 Link</ToolButton>
        <ToolButton title="Insert Image"    onClick={onInsertImage}>🖼 Image</ToolButton>
        <ToolButton title="Unlink"          onClick={() => exec('unlink')}>🔗✕</ToolButton>

        <Sep />
        <TablePicker onInsert={onInsertTable} />

        <Sep />

        {/* Zoom selector */}
        <select
          className={`${selectCls} w-[70px]`}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value) as ZoomLevel)}
          title="Zoom"
        >
          {ZOOM_LEVELS.map((z) => (
            <option key={z} value={z}>{z}%</option>
          ))}
        </select>
      </div>
    </div>
  );
}
