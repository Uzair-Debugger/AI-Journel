import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Journal — Document Editor',
  description: 'MS Word-like document editor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
