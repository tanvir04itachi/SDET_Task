import "@/app/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Blog Management App",
  description: "Next.js frontend for blog management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
