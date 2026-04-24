import Editor from '@/components/editor/Editor';

/**
 * Root page — renders the full-screen document editor.
 * Editor itself is a Client Component ('use client') so this
 * Server Component just acts as a thin shell.
 */
export default function Page() {
  return <Editor />;
}
