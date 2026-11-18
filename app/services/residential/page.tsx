import Client from './Client';
import { getProjectsByCategory, toCard } from '../../../content/projects';

export default function Page() {
  return <Client projects={getProjectsByCategory('houses').map(toCard)} />;
}
