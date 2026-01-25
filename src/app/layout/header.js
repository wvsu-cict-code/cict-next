import Link from "next/link";
export default function Header() {
  return (
    <header className="flex flex-row gap-x-3 text-lg">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/about" className="hover:underline">
        About
      </Link>
      <Link href="/programs" className="hover:underline">
        Programs
      </Link>
      <Link href="/faculty-profiles" className="hover:underline">
        Faculty
      </Link>
      <Link href="/contact" className="hover:underline">
        Contact
      </Link>
      <Link href="/news-announcements" className="hover:underline">
        News
      </Link>
    </header>
  );
}
