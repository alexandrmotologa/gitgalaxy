import { useState } from 'react';
import { X, Upload, Terminal, Copy, Check, Sparkles, FileText, Globe, Loader2 } from 'lucide-react';
import { parseGitHubUrl, fetchGitHubRepoCommits } from '../engine/githubApiIngestion';
import { GitCommit } from '../engine/types';

interface GitUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadLog: (rawText: string, repoName?: string) => void;
  onLoadCommits: (commits: GitCommit[], repoName: string) => void;
  onLoadSample: () => void;
}

const EXPORT_COMMAND = `git log --pretty=format:'COMMIT_START%n%H%n%an%n%ae%n%ad%n%s' --date=iso-strict --numstat > gitgalaxy-log.txt`;

const PRESET_REPOS = [
  'alexandrmotologa/gitgalaxy',
  'facebook/react',
  'shadcn-ui/ui',
  'vercel/next.js',
];

export function GitUploaderModal({
  isOpen,
  onClose,
  onLoadLog,
  onLoadCommits,
  onLoadSample,
}: GitUploaderModalProps) {
  const [activeTab, setActiveTab] = useState<'github' | 'paste' | 'cli'>('github');
  const [inputText, setInputText] = useState('');
  const [repoName, setRepoName] = useState('');
  const [copied, setCopied] = useState(false);

  // GitHub URL stream state
  const [githubUrl, setGithubUrl] = useState('alexandrmotologa/gitgalaxy');
  const [githubToken, setGithubToken] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubProgress, setGithubProgress] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(EXPORT_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPaste = () => {
    if (!inputText.trim()) return;
    onLoadLog(inputText, repoName.trim() || 'Custom Repository');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onLoadLog(content, file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleGitHubFetch = async () => {
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      setGithubError('Please enter a valid GitHub repository e.g. "owner/repo" or full URL.');
      return;
    }

    setGithubError(null);
    setIsFetchingGithub(true);
    setGithubProgress('Connecting to GitHub API...');

    try {
      const commits = await fetchGitHubRepoCommits(
        parsed.owner,
        parsed.repo,
        40,
        githubToken || undefined,
        (loaded, total) => {
          setGithubProgress(`Streaming commits: ${loaded} / ${total}`);
        }
      );

      onLoadCommits(commits, `${parsed.owner}/${parsed.repo}`);
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'Failed to fetch from GitHub API.');
    } finally {
      setIsFetchingGithub(false);
      setGithubProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-galaxy-900 border border-cyan-500/40 rounded-2xl w-full max-w-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] text-gray-200 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Upload className="text-cyan-400" size={20} />
            <h2 className="text-base font-mono font-bold text-white">Import Repository into Galaxy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-gray-800 pb-3">
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe size={14} />
            <span>Direct GitHub URL</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText size={14} />
            <span>Paste / Drop File</span>
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'cli'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Terminal size={14} />
            <span>CLI Command</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'github' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 font-sans">
                Stream commits directly from any public GitHub repository without running commands:
              </p>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5">
                  GitHub Repository (owner/repo or full URL):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. facebook/react or alexandrmotologa/gitgalaxy"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    disabled={isFetchingGithub}
                    className="w-full p-2.5 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-cyan-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
                  />
                  <button
                    onClick={handleGitHubFetch}
                    disabled={isFetchingGithub || !githubUrl.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2"
                  >
                    {isFetchingGithub && <Loader2 size={14} className="animate-spin" />}
                    <span>{isFetchingGithub ? 'Streaming...' : 'Stream Galaxy'}</span>
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div>
                <span className="text-[11px] font-mono text-gray-500 block mb-1.5">Popular presets:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_REPOS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setGithubUrl(preset)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono text-gray-300 bg-gray-950 border border-gray-800 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional PAT */}
              <div>
                <label className="text-[11px] font-mono text-gray-500 block mb-1">
                  Optional GitHub Token (for higher rate limits):
                </label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-950/60 border border-gray-800 text-xs font-mono text-gray-400 placeholder-gray-700 focus:outline-none focus:border-gray-700"
                />
              </div>

              {/* Status / Error */}
              {githubProgress && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{githubProgress}</span>
                </div>
              )}

              {githubError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs font-mono text-rose-300">
                  {githubError}
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl p-5 text-center transition-colors bg-gray-950/40">
                <input
                  type="file"
                  accept=".txt,.json,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload size={24} className="text-cyan-400" />
                  <span className="text-xs font-mono font-medium text-gray-300">
                    Click to select or drag a Git log file here (.txt, .json, .log)
                  </span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-gray-400">Or paste raw log contents:</label>
                  <input
                    type="text"
                    placeholder="Repository Name (optional)"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
                <textarea
                  rows={5}
                  placeholder="COMMIT_START&#10;a1b2c3d4e5f...&#10;Ada Lovelace&#10;..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitPaste}
                  disabled={!inputText.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
                >
                  Visualize Pasted Log
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-300 font-sans">
                Run this command in any local Git repository terminal to export its complete commit history with line churn statistics:
              </p>
              <div className="relative">
                <pre className="p-3 bg-gray-950 rounded-xl border border-gray-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                  {EXPORT_COMMAND}
                </pre>
                <button
                  onClick={handleCopyCommand}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-colors"
                >
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-sans">
                Then switch to the "Paste / Drop File" tab and load the generated <code>gitgalaxy-log.txt</code> file.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-amber-400 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 transition-colors"
          >
            <Sparkles size={14} />
            <span>Load Bundled 500-Commit Demo</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
