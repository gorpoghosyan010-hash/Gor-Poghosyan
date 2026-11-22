import { metaFor } from '../../content/seo';

export const metadata = metaFor('/booking');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
