import './globals.css';

export const metadata = { title: 'AttendX • Next.js', description: 'Class Attendance Management' };

export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
