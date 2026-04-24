'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Toolbar from '@/components/toolbar/Toolbar';
import TitleBar from './TitleBar';
import StatusBar from './StatusBar';
import EditorCanvas, { EditorCanvasHandle } from './EditorCanvas';
import { useDocumentStats } from '@/hooks/useDocumentStats';
import { ActiveFormattingStates, DocumentStats, ZoomLevel } from '@/types/editor';
import { FONT_SIZES, PT_TO_EXEC_LEVEL } from '@/constants/editor';

export default function Editor() {
  // ── Refs ──────────────────────────────────────────────────────────────────
  const activePageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<EditorCanvasHandle>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeStates, setActiveStates] = useState<Partial<ActiveFormattingStates>>({});
  const [fontName, setFontName] = useState('Arial');
  const [fontSize, setFontSize] = useState(12);
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [stats, setStats] = useState<DocumentStats>({ words: 0, chars: 0, pages: 1 });

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const updateActiveStates = useCallback(() => {
    try {
      const cmds: (keyof ActiveFormattingStates)[] = [
        'bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript',
        'insertOrderedList', 'insertUnorderedList',
        'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
      ];
      const states = cmds.reduce((acc, cmd) => {
        try {
          acc[cmd] = document.queryCommandState(cmd);
        } catch {
          acc[cmd] = false;
        }
        return acc;
      }, {} as ActiveFormattingStates);
      setActiveStates(states);

      try {
        const fn = document.queryCommandValue('fontName')?.replace(/['"]/g, '') || 'Arial';
        setFontName(fn);
        const sz = parseInt(document.queryCommandValue('fontSize'));
        if (sz && !isNaN(sz)) setFontSize(FONT_SIZES[sz - 1] ?? 12);
      } catch {
        setFontName('Arial');
        setFontSize(12);
      }
    } catch (error) {
      console.error('Error updating active states:', error);
    }
  }, []);

  // Wrap execCommand — always focuses the active page first
  const execOnActivePage = useCallback((cmd: string, value: string | null = null) => {
    const page = activePageRef.current;
    if (page) {
      page.focus();
    }
    document.execCommand(cmd, false, value ?? undefined);
    updateActiveStates();
  }, [updateActiveStates]);

  const { computeStats } = useDocumentStats();

  const refreshStats = useCallback(() => {
    setStats(computeStats(canvasRef.current?.container ?? null));
  }, [computeStats]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFontChange = useCallback((name: string) => {
    setFontName(name);
    execOnActivePage('fontName', name);
  }, [execOnActivePage]);

  const handleSizeChange = useCallback((size: number) => {
    setFontSize(size);
    const idx = FONT_SIZES.indexOf(size as typeof FONT_SIZES[number]);
    const level = PT_TO_EXEC_LEVEL(idx);
    execOnActivePage('fontSize', String(level));
    // Override the browser's coarse font-size with exact pt value
    document.querySelectorAll<HTMLFontElement>('font[size]').forEach((el) => {
      if (Number(el.getAttribute('size')) === level) {
        el.style.fontSize = `${size}pt`;
        el.removeAttribute('size');
      }
    });
  }, [execOnActivePage]);

  const handleInsertTable = useCallback((rows: number, cols: number) => {
    let html = '<table border="1" style="border-collapse:collapse;width:100%;margin:8px 0">';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="padding:6px;min-width:40px">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</table><br>';
    execOnActivePage('insertHTML', html);
  }, [execOnActivePage]);

  const handleInsertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) execOnActivePage('insertImage', url);
  }, [execOnActivePage]);

  const handleInsertLink = useCallback(() => {
    const url = prompt('Enter URL:', 'https://');
    if (url) execOnActivePage('createLink', url);
  }, [execOnActivePage]);

  const handleInsertHR = useCallback(() => {
    execOnActivePage('insertHTML', '<hr style="margin:8px 0">');
  }, [execOnActivePage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains('page-content')) {
      activePageRef.current = target;
    }

    if (e.ctrlKey) {
      const map: Record<string, string> = {
        b: 'bold',
        i: 'italic',
        u: 'underline',
        z: 'undo',
        y: 'redo',
      };
      if (map[e.key]) {
        e.preventDefault();
        execOnActivePage(map[e.key]);
      }
      if (e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      execOnActivePage('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }, [execOnActivePage]);

  const handleSave = useCallback(() => {
    const container = canvasRef.current?.container;
    if (!container) return;
    const html = container.innerHTML;
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body style="font-family:Arial;padding:40px">${html}</body></html>`,
      ],
      { type: 'text/html' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains('page-content')) {
      activePageRef.current = target;
    }
  }, []);

  const handleContentChange = useCallback(() => {
    refreshStats();
  }, [refreshStats]);

  // Initial focus + default font
  useEffect(() => {
    const timer = setTimeout(() => {
      canvasRef.current?.focusLastPage();
      execOnActivePage('fontName', 'Arial');
      execOnActivePage('fontSize', '3');
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen" onFocus={handleFocus}>
      <TitleBar onSave={handleSave} onPrint={() => window.print()} />

      <Toolbar
        exec={execOnActivePage}
        activeStates={activeStates}
        fontName={fontName}
        fontSize={fontSize}
        onFontChange={handleFontChange}
        onSizeChange={handleSizeChange}
        onForeColor={(c) => execOnActivePage('foreColor', c)}
        onBackColor={(c) => execOnActivePage('hiliteColor', c)}
        onInsertTable={handleInsertTable}
        onInsertImage={handleInsertImage}
        onInsertLink={handleInsertLink}
        onInsertHR={handleInsertHR}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <EditorCanvas
        ref={canvasRef}
        zoom={zoom}
        onSelectionChange={updateActiveStates}
        onContentChange={handleContentChange}
        onKeyDown={handleKeyDown}
      />

      <StatusBar {...stats} zoom={zoom} />
    </div>
  );
}