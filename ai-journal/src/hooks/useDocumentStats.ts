'use client';

import { useCallback } from 'react';
import { DocumentStats } from '@/types/editor';
import { PAGE } from '@/constants/editor';

/**
 * Derives word count, character count, and page count from the editor DOM.
 * Page count is calculated by dividing total scroll height by one page's
 * content height (PAGE.HEIGHT minus top+bottom padding).
 */
export function useDocumentStats() {
  const computeStats = useCallback(
    (editorContainer: HTMLDivElement | null): DocumentStats => {
      if (!editorContainer) return { words: 0, chars: 0, pages: 1 };

      // Collect text from all page divs
      const allText = Array.from(
        editorContainer.querySelectorAll<HTMLDivElement>('.page-content'),
      )
        .map((p) => p.innerText)
        .join(' ');

      const trimmed = allText.trim();
      const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
      const chars = trimmed.length;

      // Count rendered page divs
      const pages = editorContainer.querySelectorAll('.page-content').length;

      return { words, chars, pages };
    },
    [],
  );

  return { computeStats };
}
