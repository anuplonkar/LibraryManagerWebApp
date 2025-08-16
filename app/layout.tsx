import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Library Lite", description: "Free-tier library manager" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">Urban Discovery</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/books" className="hover:underline">Books</Link>
              <Link href="/members" className="hover:underline">Members</Link>
              <Link href="/loans" className="hover:underline">Loans</Link>
              <Link href="/auth" className="hover:underline">Sign in</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
