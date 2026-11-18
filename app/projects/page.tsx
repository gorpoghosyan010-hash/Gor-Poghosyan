import ProjectsArchive from '../../components/ProjectsArchive';
import { getProjects, toCard } from '../../content/projects';

export default function Projects() {
  return <ProjectsArchive projects={getProjects().map(toCard)} />;
}
