export type FileChangeType = 'added' | 'modified' | 'deleted';

export interface FileDiff {
  path: string;
  additions: number;
  deletions: number;
  type: FileChangeType;
}

export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  date: string;
  timestamp: number;
  message: string;
  diffs: FileDiff[];
  branch?: string;
}

export interface BranchTrajectory {
  name: string;
  color: string;
  radius: number;
  tiltAngle: number;
  commitCount: number;
}

export interface SupernovaEvent {
  id: string;
  position: [number, number, number];
  color: string;
  maxRadius: number;
  startTime: number;
  duration: number;
  label?: string;
}

export interface GitAuthor {
  name: string;
  email: string;
  commitCount: number;
  color: string;
  beaconPosition: [number, number, number];
}

export interface FileNode {
  id: string;
  path: string;
  filename: string;
  directory: string;
  position: [number, number, number];
  size: number;
  heat: number;
  additions: number;
  deletions: number;
  commitCount: number;
  lastModifiedCommitHash?: string;
  topAuthor?: string;
  authors?: string[];
  extension: string;
}

export interface DirectoryNode {
  id: string;
  name: string;
  path: string;
  position: [number, number, number];
  radius: number;
  fileIds: string[];
  color: string;
}

export interface LaserBeam {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  progress: number;
  duration: number;
  startTime: number;
  fileName: string;
}

export interface Shockwave {
  id: string;
  position: [number, number, number];
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
  startTime: number;
}

export interface RepositoryData {
  name: string;
  commits: GitCommit[];
  files: Map<string, FileNode>;
  directories: Map<string, DirectoryNode>;
  authors: Map<string, GitAuthor>;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentCommitIndex: number;
  speed: number;
  totalCommits: number;
  currentDate: string;
  activeCommit?: GitCommit;
}
