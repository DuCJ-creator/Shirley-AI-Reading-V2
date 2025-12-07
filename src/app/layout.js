// src/app/layout.js
import './globals.css';

export const metadata = {
  title: 'Shirley\'s AI Reading Coach',
  description: 'A bilingual reading coach with Christmas-themed metallic ornaments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
