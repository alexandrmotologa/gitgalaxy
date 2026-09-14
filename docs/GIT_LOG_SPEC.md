# Git log format specification

GitGalaxy accepts two input formats: structured JSON and formatted numstat text.

## Format 1: Formatted numstat text (recommended for CLI)

Generate this format from any Git repository using this terminal command:

```bash
git log --pretty=format:'COMMIT_START%n%H%n%an%n%ae%n%ad%n%s' --date=iso-strict --numstat > gitgalaxy-log.txt
```

### Structure breakdown

Each commit block begins with the marker `COMMIT_START`, followed by 5 metadata lines:

1. Commit SHA hash (40 hexadecimal characters)
2. Author name
3. Author email
4. ISO-8601 strict date (`YYYY-MM-DDTHH:MM:SSZ`)
5. Commit subject line

Following the metadata, one line per modified file lists additions, deletions, and the relative path:

```
COMMIT_START
a1b2c3d4e5f678901234567890abcdef12345678
Ada Lovelace
ada@example.com
2026-03-15T14:20:00Z
feat(core): introduce parallel AST walker
142	12	src/compiler/astWalker.ts
5	0	src/compiler/types.ts
```

Binary files with `-	-	path/to/asset.png` are safely parsed with zero line changes.

## Format 2: JSON array

GitGalaxy also accepts a direct JSON payload matching this schema:

```json
[
  {
    "hash": "a1b2c3d4e5f678901234567890abcdef12345678",
    "author": "Ada Lovelace",
    "email": "ada@example.com",
    "date": "2026-03-15T14:20:00Z",
    "message": "feat(core): introduce parallel AST walker",
    "diffs": [
      {
        "path": "src/compiler/astWalker.ts",
        "additions": 142,
        "deletions": 12,
        "type": "modified"
      },
      {
        "path": "src/compiler/types.ts",
        "additions": 5,
        "deletions": 0,
        "type": "added"
      }
    ]
  }
]
```

## Parsing edge cases

The parser handles:

- Binary files where git displays `-` instead of numeric lines.
- Rename operations formatted as `path/{old => new}/file.ts`.
- Multiline commit messages and special unicode characters in author names or commit titles.
