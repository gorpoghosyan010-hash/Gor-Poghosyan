import { metaFor } from '../../content/seo';

export const metadata = metaFor('/calculator');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
