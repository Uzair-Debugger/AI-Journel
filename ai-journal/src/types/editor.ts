// ─── Shared TypeScript interfaces & types for the editor ───────────────────

export interface ActiveFormattingStates {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  superscript: boolean;
  subscript: boolean;
  insertOrderedList: boolean;
  insertUnorderedList: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  justifyFull: boolean;
}

export interface DocumentStats {
  words: number;
  chars: number;
  pages: number;
}

export interface EditorCommandHandler {
  /** Wraps document.execCommand with focus management */
  exec: (cmd: string, value?: string | null) => void;
}

export type ZoomLevel = 50 | 75 | 90 | 100 | 110 | 125 | 150 | 175 | 200;
