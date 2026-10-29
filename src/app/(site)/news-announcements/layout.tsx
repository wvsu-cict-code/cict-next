import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News',
  description: 'Stay updated with the latest news, events, and announcements from the College of Information and Communications Technology.',
  alternates: {
    canonical: '/news-announcements',
  },
  openGraph: {
    title: 'Newss',
    description: 'Stay updated with the latest news, events, and announcements from the College of Information and Communications Technology.',
  },
};

export default function NewsAnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;}
