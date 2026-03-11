import './globals.css';
import { Inter } from 'next/font/google';
import { ModalProvider } from '@/components/providers/ModalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TraceWeave Console',
  description: 'API Debugging Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} no-scrollbar`}>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}