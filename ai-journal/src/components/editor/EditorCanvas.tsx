'use client';

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { PAGE } from '@/constants/editor';

export interface EditorCanvasHandle {
  container: HTMLDivElement | null;
  focusLastPage: () => void;
}

interface EditorCanvasProps {
  zoom: number;
  onSelectionChange: () => void;
  onContentChange: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const PAGE_CONTENT_HEIGHT = PAGE.HEIGHT - PAGE.PADDING_Y * 2; // 864px

const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(
  ({ zoom, onSelectionChange, onContentChange, onKeyDown }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isProcessingRef = useRef(false);
    // Track registered pages to avoid listener leaks
    const registeredPagesRef = useRef<Set<HTMLDivElement>>(new Set());

    useImperativeHandle(ref, () => ({
      get container() {
        return containerRef.current;
      },
      focusLastPage() {
        const pages = containerRef.current?.querySelectorAll<HTMLDivElement>('.page-content');
        if (pages?.length) {
          const last = pages[pages.length - 1];
          last.focus();
          placeCursorAtEnd(last);
        }
      },
    }));

    const placeCursorAtEnd = (el: HTMLDivElement) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    const placeCursorAtStart = (el: HTMLDivElement) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    const addPage = useCallback((): HTMLDivElement => {
      const wrapper = document.createElement('div');
      wrapper.className = 'page-wrapper';

      const content = document.createElement('div');
      content.className = 'page-content';
      content.contentEditable = 'true';
      content.spellcheck = true;
      content.setAttribute('data-placeholder', 'Continue typing…');

      wrapper.appendChild(content);
      containerRef.current?.appendChild(wrapper);
      return content;
    }, []);

    const addPageAfter = useCallback((wrapper: HTMLElement): HTMLDivElement => {
      const newWrapper = document.createElement('div');
      newWrapper.className = 'page-wrapper';

      const content = document.createElement('div');
      content.className = 'page-content';
      content.contentEditable = 'true';
      content.spellcheck = true;
      content.setAttribute('data-placeholder', 'Continue typing…');

      newWrapper.appendChild(content);

      const next = wrapper.nextElementSibling;
      if (next) {
        containerRef.current?.insertBefore(newWrapper, next);
      } else {
        containerRef.current?.appendChild(newWrapper);
      }
      return content;
    }, []);

    /**
     * Core pagination: if a page overflows, push overflow nodes to the next page.
     * Runs recursively until no page overflows.
     */
    const checkOverflow = useCallback((pageContent: HTMLDivElement) => {
      if (isProcessingRef.current) return;
      if (pageContent.scrollHeight <= PAGE_CONTENT_HEIGHT) return;

      isProcessingRef.current = true;

      try {
        const wrapper = pageContent.parentElement as HTMLElement;

        // Get or create next page
        let nextWrapper = wrapper.nextElementSibling as HTMLElement | null;
        let nextContent: HTMLDivElement;

        if (nextWrapper?.classList.contains('page-wrapper')) {
          nextContent = nextWrapper.querySelector<HTMLDivElement>('.page-content')!;
        } else {
          nextContent = addPageAfter(wrapper);
        }

        // Move child nodes from the end of this page to the start of the next
        // until this page no longer overflows
        while (pageContent.scrollHeight > PAGE_CONTENT_HEIGHT) {
          const children = pageContent.childNodes;
          if (children.length === 0) break;

          const lastChild = children[children.length - 1];

          // Skip empty trailing <br> nodes that browsers inject
          if (
            lastChild.nodeType === Node.ELEMENT_NODE &&
            (lastChild as HTMLElement).tagName === 'BR' &&
            pageContent.childNodes.length > 1
          ) {
            pageContent.removeChild(lastChild);
            continue;
          }

          // Move the last child to the front of the next page
          nextContent.insertBefore(lastChild, nextContent.firstChild);
        }

        onContentChange();

        // Recursively check if the next page also overflows
        if (nextContent.scrollHeight > PAGE_CONTENT_HEIGHT) {
          checkOverflow(nextContent);
        }
      } finally {
        isProcessingRef.current = false;
      }
    }, [addPageAfter, onContentChange]);

    /**
     * If a page (non-first) has room, pull content back from the next page.
     * Also removes a page if it's completely empty and not the first.
     */
    const checkUnderflow = useCallback((pageContent: HTMLDivElement) => {
      if (isProcessingRef.current) return;

      const wrapper = pageContent.parentElement as HTMLElement;
      const container = containerRef.current;
      if (!container) return;

      const isFirst = wrapper === container.firstElementChild;

      // Check if this page is empty and not the first → remove it
      if (!isFirst) {
        const text = pageContent.innerText ?? '';
        const hasOnlyBr =
          pageContent.childNodes.length === 1 &&
          (pageContent.firstChild as HTMLElement)?.tagName === 'BR';
        const isEmpty = text.trim() === '' && (pageContent.childNodes.length === 0 || hasOnlyBr);

        if (isEmpty) {
          isProcessingRef.current = true;
          const prevWrapper = wrapper.previousElementSibling as HTMLElement | null;
          const prevContent = prevWrapper?.querySelector<HTMLDivElement>('.page-content');

          wrapper.remove();
          onContentChange();

          // Focus previous page at end
          if (prevContent) {
            prevContent.focus();
            placeCursorAtEnd(prevContent);
          }

          isProcessingRef.current = false;
          return;
        }
      }

      // Pull content from next page back if there's space on this page
      const nextWrapper = wrapper.nextElementSibling as HTMLElement | null;
      if (!nextWrapper?.classList.contains('page-wrapper')) return;
      const nextContent = nextWrapper.querySelector<HTMLDivElement>('.page-content');
      if (!nextContent || nextContent.childNodes.length === 0) return;

      isProcessingRef.current = true;

      try {
        while (nextContent.firstChild) {
          const firstChild = nextContent.firstChild;
          pageContent.appendChild(firstChild);

          // If we exceeded the page height, put it back
          if (pageContent.scrollHeight > PAGE_CONTENT_HEIGHT) {
            nextContent.insertBefore(firstChild, nextContent.firstChild);
            break;
          }
        }

        // If next page is now empty, remove it
        const nextText = nextContent.innerText?.trim() ?? '';
        const nextEmpty =
          nextText === '' &&
          (nextContent.childNodes.length === 0 ||
            (nextContent.childNodes.length === 1 &&
              (nextContent.firstChild as HTMLElement)?.tagName === 'BR'));

        if (nextEmpty) {
          nextWrapper.remove();
        }

        onContentChange();
      } finally {
        isProcessingRef.current = false;
      }
    }, [onContentChange]);

    const handleInput = useCallback((e: Event) => {
      const page = e.target as HTMLDivElement;
      checkOverflow(page);
      checkUnderflow(page);
      onContentChange();
    }, [checkOverflow, checkUnderflow, onContentChange]);

    const handleSelectionChange = useCallback(() => {
      onSelectionChange();
    }, [onSelectionChange]);

    /**
     * Attach listeners to a page only once, tracked via registeredPagesRef.
     */
    const attachListeners = useCallback((page: HTMLDivElement) => {
      if (registeredPagesRef.current.has(page)) return;
      registeredPagesRef.current.add(page);
      page.addEventListener('input', handleInput);
      page.addEventListener('keyup', handleSelectionChange);
      page.addEventListener('mouseup', handleSelectionChange);
    }, [handleInput, handleSelectionChange]);

    // MutationObserver: only attach to *new* page-content nodes
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Attach to any already-existing pages
      container.querySelectorAll<HTMLDivElement>('.page-content').forEach(attachListeners);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const el = node as HTMLElement;
            if (el.classList.contains('page-content')) {
              attachListeners(el as HTMLDivElement);
            }
            // Also check descendants (e.g. wrapper added with content inside)
            el.querySelectorAll<HTMLDivElement>('.page-content').forEach(attachListeners);
          });

          // Clean up removed pages from our tracking set
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const el = node as HTMLElement;
            if (el.classList.contains('page-content')) {
              registeredPagesRef.current.delete(el as HTMLDivElement);
            }
            el.querySelectorAll<HTMLDivElement>('.page-content').forEach((p) => {
              registeredPagesRef.current.delete(p);
            });
          });
        }
      });

      observer.observe(container, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        // Clean up all listeners
        registeredPagesRef.current.forEach((page) => {
          page.removeEventListener('input', handleInput);
          page.removeEventListener('keyup', handleSelectionChange);
          page.removeEventListener('mouseup', handleSelectionChange);
        });
        registeredPagesRef.current.clear();
      };
    }, [attachListeners, handleInput, handleSelectionChange]);

    // Seed the first page on mount
    useEffect(() => {
      if (!containerRef.current) return;
      if (containerRef.current.querySelector('.page-wrapper')) return;

      const firstPage = addPage();
      setTimeout(() => {
        firstPage.focus();
        placeCursorAtEnd(firstPage);
      }, 0);
    }, [addPage]);

    return (
      /* Scroll container — NO zoom here, zoom only on inner pages */
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[#f0f0f0] py-8 flex flex-col items-center"
      >
        {/* Zoom is applied here so scrollbar is unaffected */}
        <div
          ref={containerRef}
          className="flex flex-col items-center gap-8 origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            // Keep layout space consistent so scroll height scales properly
            marginBottom: `${(zoom / 100 - 1) * 100}%`,
          }}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  },
);

EditorCanvas.displayName = 'EditorCanvas';
export default EditorCanvas;