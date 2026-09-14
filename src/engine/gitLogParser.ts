import { GitCommit, FileDiff, BranchTrajectory } from './types';

/**
 * Parses raw text produced by:
 * git log --pretty=format:'COMMIT_START%n%H%n%an%n%ae%n%ad%n%s' --date=iso-strict --numstat
 */
export function parseNumstatGitLog(rawText: string): GitCommit[] {
  const commits: GitCommit[] = [];
  const lines = rawText.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === 'COMMIT_START') {
      const hash = lines[i + 1]?.trim() || '';
      const author = lines[i + 2]?.trim() || 'Unknown';
      const email = lines[i + 3]?.trim() || '';
      const dateStr = lines[i + 4]?.trim() || '';
      const message = lines[i + 5]?.trim() || '';

      const diffs: FileDiff[] = [];
      i += 6;

      while (i < lines.length && lines[i].trim() !== 'COMMIT_START') {
        const diffLine = lines[i].trim();
        if (diffLine) {
          const parts = diffLine.split(/\s+/);
          if (parts.length >= 3) {
            const addStr = parts[0];
            const delStr = parts[1];
            // Path can contain spaces, so join remainder
            const filePath = parts.slice(2).join(' ');

            const additions = addStr === '-' ? 0 : parseInt(addStr, 10) || 0;
            const deletions = delStr === '-' ? 0 : parseInt(delStr, 10) || 0;

            diffs.push({
              path: sanitizeFilePath(filePath),
              additions,
              deletions,
              type: additions > 0 && deletions === 0 ? 'added' : 'modified',
            });
          }
        }
        i++;
      }

      const timestamp = Date.parse(dateStr) || Date.now();
      const branch = inferBranch(message);

      if (hash) {
        commits.push({
          hash,
          author,
          email,
          date: dateStr,
          timestamp,
          message,
          diffs,
          branch,
        });
      }
    } else {
      i++;
    }
  }

  // Ensure chronological order (oldest commit first)
  commits.sort((a, b) => a.timestamp - b.timestamp);
  return commits;
}

/**
 * Parses structured JSON git log export.
 */
export function parseJsonGitLog(jsonContent: string): GitCommit[] {
  try {
    const raw = JSON.parse(jsonContent);
    if (!Array.isArray(raw)) return [];

    const commits: GitCommit[] = raw.map((item: Record<string, unknown>) => {
      const diffs: FileDiff[] = Array.isArray(item.diffs)
        ? (item.diffs as Record<string, unknown>[]).map((d) => ({
            path: sanitizeFilePath(String(d.path || '')),
            additions: Number(d.additions) || 0,
            deletions: Number(d.deletions) || 0,
            type: (d.type as 'added' | 'modified' | 'deleted') || 'modified',
          }))
        : [];

      const dateStr = String(item.date || '');
      const msg = String(item.message || '');
      const branch = typeof item.branch === 'string' && item.branch.length > 0
        ? item.branch
        : inferBranch(msg);

      return {
        hash: String(item.hash || ''),
        author: String(item.author || 'Unknown'),
        email: String(item.email || ''),
        date: dateStr,
        timestamp: Date.parse(dateStr) || Date.now(),
        message: msg,
        diffs,
        branch,
      };
    });

    commits.sort((a, b) => a.timestamp - b.timestamp);
    return commits;
  } catch (err) {
    console.error('Failed to parse JSON git log:', err);
    return [];
  }
}

/**
 * Auto-detects and parses either JSON or numstat format.
 */
export function parseGitLog(content: string): GitCommit[] {
  const trimmed = content.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return parseJsonGitLog(trimmed);
  }
  return parseNumstatGitLog(trimmed);
}

/**
 * Cleans git path renames such as `src/{old => new}/index.ts` to `src/new/index.ts`.
 */
function sanitizeFilePath(rawPath: string): string {
  // Handle `{old => new}` rename pattern
  if (rawPath.includes('=>')) {
    const renameMatch = rawPath.match(/(.*?)\{(?:.*?)\s*=>\s*(.*?)\}(.*)/);
    if (renameMatch) {
      return (renameMatch[1] + renameMatch[2] + renameMatch[3]).replace(/\/\//g, '/');
    }
  }
  return rawPath.replace(/\\/g, '/');
}

/**
 * Infers git branch based on commit message semantics and merge strings.
 */
export function inferBranch(message: string): string {
  const prMatch = message.match(/Merge pull request #\d+ from ([\w\-./]+)/i);
  if (prMatch && prMatch[1]) {
    return prMatch[1].replace(/^(?:origin\/|refs\/heads\/)/, '');
  }

  const branchMatch = message.match(/Merge branch '([\w\-./]+)'/i);
  if (branchMatch && branchMatch[1]) {
    return branchMatch[1].replace(/^(?:origin\/|refs\/heads\/)/, '');
  }

  const lower = message.toLowerCase();
  if (lower.startsWith('feat') || lower.includes('(feat') || lower.includes('feature/')) {
    return 'feature/core';
  }
  if (lower.startsWith('fix') || lower.includes('(fix') || lower.includes('bugfix/') || lower.includes('patch')) {
    return 'bugfix/patch';
  }
  if (lower.startsWith('refactor') || lower.includes('(refactor')) {
    return 'refactor/engine';
  }
  if (lower.startsWith('perf') || lower.includes('(perf')) {
    return 'perf/optimization';
  }
  if (lower.startsWith('chore') || lower.includes('(chore') || lower.startsWith('docs')) {
    return 'chore/infra';
  }

  return 'main';
}

/**
 * Groups commits into visual branch trajectories with distinct galactic orbits and colors.
 */
export function extractUniqueBranches(commits: GitCommit[]): BranchTrajectory[] {
  const branchCounts = new Map<string, number>();
  commits.forEach((c) => {
    const b = c.branch || 'main';
    branchCounts.set(b, (branchCounts.get(b) || 0) + 1);
  });

  const branchColors: Record<string, string> = {
    'main': '#00f0ff', // Cyber cyan
    'master': '#00f0ff',
    'feature/core': '#c084fc', // Violet / magenta
    'bugfix/patch': '#f59e0b', // Amber
    'refactor/engine': '#10b981', // Emerald
    'perf/optimization': '#38bdf8', // Sky
    'chore/infra': '#ec4899', // Rose
  };

  const trajectories: BranchTrajectory[] = [];
  let index = 0;

  // Always ensure 'main' is first at root orbit
  const sortedBranches = Array.from(branchCounts.entries()).sort((a, b) => {
    if (a[0] === 'main' || a[0] === 'master') return -1;
    if (b[0] === 'main' || b[0] === 'master') return 1;
    return b[1] - a[1];
  });

  sortedBranches.slice(0, 7).forEach(([name, count]) => {
    const color = branchColors[name] || getSeededColor(name);
    const radius = 16 + index * 10;
    const tiltAngle = (index * 0.22) * (index % 2 === 0 ? 1 : -1);

    trajectories.push({
      name,
      color,
      radius,
      tiltAngle,
      commitCount: count,
    });
    index++;
  });

  return trajectories;
}

function getSeededColor(str: string): string {
  const hues = [190, 270, 45, 150, 330, 210, 80];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hue = hues[Math.abs(hash) % hues.length];
  return `hsl(${hue}, 85%, 60%)`;
}
