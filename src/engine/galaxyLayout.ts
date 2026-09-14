import { GitCommit, FileNode, DirectoryNode, GitAuthor, RepositoryData } from './types';

// Palette of neon cyber colors for authors and directory nebulae
const AUTHOR_COLORS = [
  '#00f0ff', // Cyber cyan
  '#f43f5e', // Neon rose
  '#a855f7', // Electric purple
  '#10b981', // Emerald
  '#f59e0b', // Solar amber
  '#3b82f6', // Cobalt blue
  '#ec4899', // Hot pink
  '#14b8a6', // Teal
];

const DIRECTORY_COLORS = [
  '#38bdf8',
  '#818cf8',
  '#c084fc',
  '#f472b6',
  '#fb923c',
  '#4ade80',
  '#2dd4bf',
];

/**
 * Builds the 3D spatial layout and repository state from an array of commits.
 */
export function buildGalaxyLayout(commits: GitCommit[], repoName: string = 'Repository Universe'): RepositoryData {
  const fileStatsMap = new Map<
    string,
    {
      additions: number;
      deletions: number;
      commitCount: number;
      lastCommitHash: string;
      authors: Map<string, number>;
    }
  >();

  const authorCounts = new Map<string, { count: number; email: string }>();

  // Aggregate stats across all commits
  for (const commit of commits) {
    const authorName = commit.author || 'Unknown';
    const existingAuthor = authorCounts.get(authorName) || { count: 0, email: commit.email };
    existingAuthor.count++;
    authorCounts.set(authorName, existingAuthor);

    for (const diff of commit.diffs) {
      const stats = fileStatsMap.get(diff.path) || {
        additions: 0,
        deletions: 0,
        commitCount: 0,
        lastCommitHash: commit.hash,
        authors: new Map(),
      };

      stats.additions += diff.additions;
      stats.deletions += diff.deletions;
      stats.commitCount += 1;
      stats.lastCommitHash = commit.hash;

      const authorFreq = stats.authors.get(authorName) || 0;
      stats.authors.set(authorName, authorFreq + 1);

      fileStatsMap.set(diff.path, stats);
    }
  }

  // Identify unique directories
  const directoriesMap = new Map<string, DirectoryNode>();
  const dirFileGroups = new Map<string, string[]>();

  for (const filePath of fileStatsMap.keys()) {
    const parts = filePath.split('/');
    const dirPath = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';

    if (!dirFileGroups.has(dirPath)) {
      dirFileGroups.set(dirPath, []);
    }
    dirFileGroups.get(dirPath)!.push(filePath);
  }

  // Layout directories in concentric rings around galactic center
  const uniqueDirs = Array.from(dirFileGroups.keys());
  const dirRadiusStep = 35;

  uniqueDirs.forEach((dirPath, idx) => {
    let position: [number, number, number] = [0, 0, 0];

    if (dirPath !== 'root') {
      const goldenAngle = idx * 2.39996; // ~137.5 degrees in radians
      const dist = 30 + Math.sqrt(idx + 1) * dirRadiusStep;
      const x = Math.cos(goldenAngle) * dist;
      const z = Math.sin(goldenAngle) * dist;
      // Slight vertical wobble for depth
      const y = Math.sin(idx * 1.5) * 8;
      position = [x, y, z];
    }

    const color = DIRECTORY_COLORS[idx % DIRECTORY_COLORS.length];
    const fileIds = dirFileGroups.get(dirPath) || [];

    directoriesMap.set(dirPath, {
      id: dirPath,
      name: dirPath === 'root' ? '/' : dirPath.split('/').pop() || dirPath,
      path: dirPath,
      position,
      radius: Math.max(12, Math.sqrt(fileIds.length) * 8),
      fileIds,
      color,
    });
  });

  // Position file nodes orbiting their respective directory centers
  const filesMap = new Map<string, FileNode>();

  for (const [dirPath, filePaths] of dirFileGroups.entries()) {
    const dir = directoriesMap.get(dirPath)!;
    const count = filePaths.length;

    filePaths.forEach((filePath, fIdx) => {
      const stats = fileStatsMap.get(filePath)!;
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      const extension = filename.includes('.') ? filename.split('.').pop() || '' : '';

      // Determine top author
      let topAuthor = 'Unknown';
      let maxContrib = 0;
      for (const [auth, cnt] of stats.authors.entries()) {
        if (cnt > maxContrib) {
          maxContrib = cnt;
          topAuthor = auth;
        }
      }

      // Orbital distribution around directory center
      const angle = (fIdx / Math.max(1, count)) * Math.PI * 2 + (fIdx % 2 ? 0.3 : 0);
      const orbitDist = 6 + (fIdx % 4) * 4 + Math.sqrt(fIdx) * 3;
      const fx = dir.position[0] + Math.cos(angle) * orbitDist;
      const fz = dir.position[2] + Math.sin(angle) * orbitDist;
      const fy = dir.position[1] + ((fIdx % 3) - 1) * 2.5;

      // Base size derived from change volume
      const totalChanges = stats.additions + stats.deletions;
      const size = Math.min(3.2, Math.max(0.6, Math.log10(totalChanges + 10) * 0.7));

      filesMap.set(filePath, {
        id: filePath,
        path: filePath,
        filename,
        directory: dirPath,
        position: [fx, fy, fz],
        size,
        heat: 0.1, // Initial calm heat
        additions: stats.additions,
        deletions: stats.deletions,
        commitCount: stats.commitCount,
        lastModifiedCommitHash: stats.lastCommitHash,
        topAuthor,
        authors: Array.from(stats.authors.keys()),
        extension,
      });
    });
  }

  // Layout author observation beacons along outer perimeter
  const authorsMap = new Map<string, GitAuthor>();
  const authorNames = Array.from(authorCounts.keys());
  const authorOrbitRadius = 160;

  authorNames.forEach((name, idx) => {
    const angle = (idx / Math.max(1, authorNames.length)) * Math.PI * 2;
    const x = Math.cos(angle) * authorOrbitRadius;
    const z = Math.sin(angle) * authorOrbitRadius;
    const y = 25 + Math.sin(idx) * 10;

    const color = AUTHOR_COLORS[idx % AUTHOR_COLORS.length];
    const data = authorCounts.get(name)!;

    authorsMap.set(name, {
      name,
      email: data.email,
      commitCount: data.count,
      color,
      beaconPosition: [x, y, z],
    });
  });

  return {
    name: repoName,
    commits,
    files: filesMap,
    directories: directoriesMap,
    authors: authorsMap,
  };
}
