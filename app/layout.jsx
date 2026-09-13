import './globals.css'

export const metadata = {
  title: 'Affordable Car Sales | Used Cars in Middletown, OH',
  description:
    'Quality used cars, trucks, and SUVs in Middletown, Ohio. Fair prices, straight answers, flexible financing. Real cars. Real people. Same streets.',
}

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var isDark = stored ? stored === 'dark' : true;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
