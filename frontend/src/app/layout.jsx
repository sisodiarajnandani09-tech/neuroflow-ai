import "./globals.css";

export const metadata = {
  title: "NeuroFlow AI",
  description: "AI Research Assistant",
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