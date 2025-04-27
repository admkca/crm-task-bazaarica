import Navbar from "./components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link
          href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
          rel='stylesheet'
        />
      </head>
      <body className='bg-light'>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
