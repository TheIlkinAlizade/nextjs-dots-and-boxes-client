import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import AnimatedBackground from '@/components/AnimatedBackground';

const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-poppins' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Dots and Boxes',
  description: 'Play Online Dots and Boxes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} font-sans text-white`}>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}