import { metaFor } from '../../content/seo';

export const metadata = metaFor('/about');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
