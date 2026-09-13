import './globals.css'

export const metadata = {
  title: 'Affordable Car Sales',
  description: 'Quality used cars at affordable prices.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
