import { describe, it, expect } from 'vitest';
import { parseNumstatGitLog, parseJsonGitLog, parseGitLog } from '../gitLogParser';

describe('gitLogParser', () => {
  const sampleNumstat = `
COMMIT_START
1122334455667788990011223344556677889900
Elena Rostova
elena@galaxy.dev
2026-01-15T12:00:00Z
feat(core): introduce zero-copy memory ring buffer
120	15	src/core/memory/ring_buffer.rs
10	2	src/core/mod.rs

COMMIT_START
aabbccddeeff00112233445566778899aabbccdd
Marcus Vance
m.vance@galaxy.dev
2026-01-16T14:30:00Z
fix(net): patch epoll race condition
45	12	src/net/socket/epoll.rs
-	-	assets/logo.png
`;

  it('parses raw numstat output correctly', () => {
    const commits = parseNumstatGitLog(sampleNumstat);
    expect(commits).toHaveLength(2);

    const first = commits[0];
    expect(first.hash).toBe('1122334455667788990011223344556677889900');
    expect(first.author).toBe('Elena Rostova');
    expect(first.diffs).toHaveLength(2);
    expect(first.diffs[0].path).toBe('src/core/memory/ring_buffer.rs');
    expect(first.diffs[0].additions).toBe(120);
    expect(first.diffs[0].deletions).toBe(15);

    const second = commits[1];
    expect(second.diffs).toHaveLength(2);
    // Binary file handling: - - assets/logo.png
    expect(second.diffs[1].path).toBe('assets/logo.png');
    expect(second.diffs[1].additions).toBe(0);
    expect(second.diffs[1].deletions).toBe(0);
  });

  it('parses JSON formatted git log', () => {
    const jsonSample = JSON.stringify([
      {
        hash: 'abc123',
        author: 'Kaelen Chen',
        email: 'k.chen@galaxy.dev',
        date: '2026-02-01T10:00:00Z',
        message: 'refactor: simplify allocator',
        diffs: [{ path: 'src/allocator.rs', additions: 30, deletions: 10, type: 'modified' }],
      },
    ]);

    const commits = parseJsonGitLog(jsonSample);
    expect(commits).toHaveLength(1);
    expect(commits[0].author).toBe('Kaelen Chen');
    expect(commits[0].diffs[0].additions).toBe(30);
  });

  it('auto detects format via parseGitLog', () => {
    const commits = parseGitLog(sampleNumstat);
    expect(commits).toHaveLength(2);
  });
});
