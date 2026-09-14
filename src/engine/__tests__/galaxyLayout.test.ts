import { describe, it, expect } from 'vitest';
import { buildGalaxyLayout } from '../galaxyLayout';
import { GitCommit } from '../types';

describe('galaxyLayout', () => {
  const mockCommits: GitCommit[] = [
    {
      hash: 'hash-001',
      author: 'Elena Rostova',
      email: 'elena@galaxy.dev',
      date: '2026-01-01T00:00:00Z',
      timestamp: 1735689600000,
      message: 'feat: init scheduler',
      diffs: [
        { path: 'src/core/scheduler.rs', additions: 100, deletions: 0, type: 'added' },
        { path: 'src/net/transport.rs', additions: 50, deletions: 0, type: 'added' },
      ],
    },
    {
      hash: 'hash-002',
      author: 'Marcus Vance',
      email: 'm.vance@galaxy.dev',
      date: '2026-01-02T00:00:00Z',
      timestamp: 1735776000000,
      message: 'fix: transport buffer',
      diffs: [
        { path: 'src/net/transport.rs', additions: 10, deletions: 5, type: 'modified' },
      ],
    },
  ];

  it('builds galaxy layout with files, directories, and authors', () => {
    const data = buildGalaxyLayout(mockCommits, 'TestRepo');

    expect(data.name).toBe('TestRepo');
    expect(data.files.size).toBe(2);
    expect(data.files.has('src/core/scheduler.rs')).toBe(true);
    expect(data.files.has('src/net/transport.rs')).toBe(true);

    const transportFile = data.files.get('src/net/transport.rs')!;
    expect(transportFile.commitCount).toBe(2);
    expect(transportFile.additions).toBe(60);
    expect(transportFile.deletions).toBe(5);

    expect(data.authors.size).toBe(2);
    expect(data.authors.has('Elena Rostova')).toBe(true);
    expect(data.authors.has('Marcus Vance')).toBe(true);

    // Verify 3D positions are valid numbers
    expect(transportFile.position).toHaveLength(3);
    expect(Number.isFinite(transportFile.position[0])).toBe(true);
    expect(Number.isFinite(transportFile.position[1])).toBe(true);
    expect(Number.isFinite(transportFile.position[2])).toBe(true);
  });
});
