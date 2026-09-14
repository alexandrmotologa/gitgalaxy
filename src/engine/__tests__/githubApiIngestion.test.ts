import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../githubApiIngestion';

describe('githubApiIngestion', () => {
  it('parses various GitHub URL and shorthand inputs', () => {
    expect(parseGitHubUrl('facebook/react')).toEqual({ owner: 'facebook', repo: 'react' });
    expect(parseGitHubUrl('https://github.com/torvalds/linux')).toEqual({
      owner: 'torvalds',
      repo: 'linux',
    });
    expect(parseGitHubUrl('https://github.com/alexandrmotologa/gitgalaxy.git/')).toEqual({
      owner: 'alexandrmotologa',
      repo: 'gitgalaxy',
    });
  });

  it('returns null for invalid inputs', () => {
    expect(parseGitHubUrl('')).toBeNull();
    expect(parseGitHubUrl('justastring')).toBeNull();
  });
});
