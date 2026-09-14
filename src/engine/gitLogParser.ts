import { GitCommit, FileDiff } from './types';

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

      if (hash) {
        commits.push({
          hash,
          author,
          email,
          date: dateStr,
          timestamp,
          message,
          diffs,
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
      return {
        hash: String(item.hash || ''),
        author: String(item.author || 'Unknown'),
        email: String(item.email || ''),
        date: dateStr,
        timestamp: Date.parse(dateStr) || Date.now(),
        message: String(item.message || ''),
        diffs,
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
