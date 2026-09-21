import { metaFor } from '../../content/seo';

export const metadata = metaFor('/projects');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
