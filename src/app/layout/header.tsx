import Link from "next/link";
export default function Header() {
  return (
    <header className="flex flex-row gap-x-3 text-lg">
      <Link href="/" className="hover:text-blue-800 hover:underline">
        Home
      </Link>
      <Link href="/about" className="hover:text-blue-800 hover:underline">
        About
      </Link>
      <Link href="/programs" className="hover:text-blue-800 hover:underline">
        Programs
      </Link>
      <Link
        href="/faculty-profiles"
        className="hover:text-blue-800 hover:underline"
      >
        Faculty
      </Link>
      <Link href="/contact" className="hover:text-blue-800 hover:underline">
        Contact
      </Link>
      <Link
        href="/news-announcements"
        className="hover:text-blue-800 hover:underline"
      >
        News
      </Link>
    </header>
  );
}
