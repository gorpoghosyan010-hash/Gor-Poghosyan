import HomePage from '../components/HomePage';
import { getFeaturedCards } from '../content/projects';

export default function Home() {
  return <HomePage featured={getFeaturedCards()} />;
}
