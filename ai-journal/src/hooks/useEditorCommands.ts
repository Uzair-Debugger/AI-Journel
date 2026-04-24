'use client';

import { useCallback } from 'react';
import { ActiveFormattingStates } from '@/types/editor';

/**
 * Abstracts document.execCommand calls.
 * Always re-focuses the editor before executing so commands apply correctly.
 */
export function useEditorCommands(
  editorRef: React.RefObject<HTMLDivElement | null>,
  onStateChange: () => void,
) {
  const exec = useCallback(
    (cmd: string, value: string | null = null) => {
      editorRef.current?.focus();
      // execCommand is deprecated but remains the only cross-browser
      // contenteditable formatting API without a full editor framework.
      document.execCommand(cmd, false, value ?? undefined);
      onStateChange();
    },
    [editorRef, onStateChange],
  );

  /** Reads current formatting state for toolbar active indicators */
  const readActiveStates = useCallback((): ActiveFormattingStates => {
    const cmds: (keyof ActiveFormattingStates)[] = [
      'bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript',
      'insertOrderedList', 'insertUnorderedList',
      'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
    ];
    return cmds.reduce((acc, cmd) => {
      acc[cmd] = document.queryCommandState(cmd);
      return acc;
    }, {} as ActiveFormattingStates);
  }, []);

  return { exec, readActiveStates };
}
