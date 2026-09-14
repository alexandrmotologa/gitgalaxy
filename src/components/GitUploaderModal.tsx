import { useState } from 'react';
import { X, Upload, Terminal, Copy, Check, Sparkles, FileText } from 'lucide-react';

interface GitUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadLog: (rawText: string, repoName?: string) => void;
  onLoadSample: () => void;
}

const EXPORT_COMMAND = `git log --pretty=format:'COMMIT_START%n%H%n%an%n%ae%n%ad%n%s' --date=iso-strict --numstat > gitgalaxy-log.txt`;

export function GitUploaderModal({
  isOpen,
  onClose,
  onLoadLog,
  onLoadSample,
}: GitUploaderModalProps) {
  const [inputText, setInputText] = useState('');
  const [repoName, setRepoName] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'cli'>('paste');

  if (!isOpen) return null;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(EXPORT_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-galaxy-900 border border-cyan-500/40 rounded-2xl w-full max-w-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] text-gray-200 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Upload className="text-cyan-400" size={20} />
            <h2 className="text-base font-mono font-bold text-white">Import Git Repository Log</h2>
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
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText size={14} />
            <span>Paste or Drop File</span>
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
            <span>Export CLI Command</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'cli' ? (
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
                Then switch to the "Paste or Drop File" tab and load the generated <code>gitgalaxy-log.txt</code> file.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Drop / Upload */}
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

              {/* Or Direct Paste */}
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
                  rows={6}
                  placeholder="COMMIT_START&#10;a1b2c3d4e5f...&#10;Ada Lovelace&#10;..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 resize-none"
                />
              </div>
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

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim()}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
            >
              Visualize Galaxy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
