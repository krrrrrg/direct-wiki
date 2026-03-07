import "./globals.css";

export const metadata = {
  title: "직영점 대응 위키",
  description: "하카코리아 직영점 대응 위키",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
