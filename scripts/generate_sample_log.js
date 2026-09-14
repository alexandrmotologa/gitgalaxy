import fs from 'fs';
import path from 'path';

const authors = [
  { name: 'Elena Rostova', email: 'elena.rostova@galaxy.dev' },
  { name: 'Marcus Vance', email: 'm.vance@galaxy.dev' },
  { name: 'Kaelen Chen', email: 'k.chen@galaxy.dev' },
  { name: 'Amina Al-Mansoor', email: 'amina.m@galaxy.dev' },
  { name: 'Lukas Weber', email: 'l.weber@galaxy.dev' },
  { name: 'Devon Park', email: 'devon.p@galaxy.dev' },
  { name: 'Sophia Taylor', email: 's.taylor@galaxy.dev' },
];

const files = [
  'src/core/scheduler.rs',
  'src/core/dispatcher.rs',
  'src/core/memory/ring_buffer.rs',
  'src/core/memory/allocator.rs',
  'src/core/threads/worker_pool.rs',
  'src/net/transport.rs',
  'src/net/protocol/quic.rs',
  'src/net/protocol/grpc.rs',
  'src/net/socket/epoll.rs',
  'src/net/packet/compressor.rs',
  'src/storage/wal.rs',
  'src/storage/lsm_tree.rs',
  'src/storage/sst_table.rs',
  'src/storage/compaction.rs',
  'src/storage/cache/arc_cache.rs',
  'src/storage/cache/lru.rs',
  'src/api/gateway.ts',
  'src/api/routes/clusters.ts',
  'src/api/routes/metrics.ts',
  'src/api/routes/auth.ts',
  'src/api/middleware/rate_limit.ts',
  'src/api/middleware/telemetry.ts',
  'src/crypto/signatures.rs',
  'src/crypto/encryption.rs',
  'src/crypto/zkp/snarks.rs',
  'src/crypto/keys/vault.rs',
  'src/cluster/consensus/raft.rs',
  'src/cluster/membership/gossip.rs',
  'src/cluster/replication/stream.rs',
  'src/cluster/election/leader.rs',
  'src/metrics/prometheus.rs',
  'src/metrics/latency_histogram.rs',
  'src/metrics/tracing/opentelemetry.rs',
  'docs/architecture.md',
  'docs/api_reference.md',
  'docs/rfc/004_distributed_wal.md',
  'docs/benchmarks/throughput.md',
  'tests/unit/scheduler_test.rs',
  'tests/unit/wal_test.rs',
  'tests/unit/quic_test.rs',
  'tests/integration/cluster_chaos_test.rs',
  'tests/integration/gateway_load_test.ts',
  'benches/allocator_bench.rs',
  'benches/compression_bench.rs',
  'scripts/deploy_k8s.sh',
  'scripts/benchmark_cluster.py',
  'Dockerfile',
  'Cargo.toml',
  'package.json',
  'README.md',
];

const commitTypes = ['feat', 'fix', 'refactor', 'perf', 'docs', 'test', 'chore'];
const scopes = ['core', 'net', 'storage', 'api', 'crypto', 'cluster', 'metrics', 'bench'];

const descriptions = [
  'introduce zero-copy ring buffer with memory barrier synchronization',
  'patch epoll race condition under socket spike load',
  'implement segmented write ahead log with asynchronous fsync',
  'optimize QUIC frame serialization reducing allocation overhead',
  'rework LSM tree level compaction threshold algorithm',
  'introduce adaptive replacement cache for hot SST blocks',
  'stabilize Raft leader election timeout with exponential jitter',
  'expand rate limiting token bucket algorithm for API gateway',
  'add zero-knowledge proof verification pipeline for block transactions',
  'eliminate redundant hash computations during gossip propagation',
  'tune SIMD vectorization for compression compressor',
  'add distributed tracing traceparent propagation to headers',
  'prevent deadlock during concurrent worker pool shutdown',
  'speed up allocator chunk reclamation by 38%',
  'implement strict monotonic clock fallbacks for timestamp calculation',
  'reduce memory churn in gRPC streaming deserialization',
  'harden key rotation in vault storage against concurrent writes',
  'support batched vector commits in consensus layer',
  'improve cache line alignment for task dispatcher queue',
  'fix file descriptor leak in idle socket connection pool',
];

function generateHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

const totalCommits = 500;
const startDate = new Date('2025-08-01T08:00:00Z').getTime();
const endDate = new Date('2026-03-10T18:00:00Z').getTime();
const timeStep = (endDate - startDate) / totalCommits;

const commits = [];

for (let i = 0; i < totalCommits; i++) {
  const author = authors[Math.floor(Math.random() * authors.length)];
  const cType = commitTypes[Math.floor(Math.random() * commitTypes.length)];
  const scope = scopes[Math.floor(Math.random() * scopes.length)];
  const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
  const commitTime = new Date(startDate + i * timeStep + (Math.random() - 0.5) * timeStep * 0.8);

  const numFiles = Math.floor(Math.random() * 4) + 1;
  const diffs = [];
  const chosenFiles = new Set();

  for (let f = 0; f < numFiles; f++) {
    // Focus churn on certain files (e.g. wal.rs, scheduler.rs, gateway.ts)
    const isHotspot = Math.random() < 0.45;
    let chosen = files[Math.floor(Math.random() * files.length)];
    if (isHotspot) {
      const hotspots = ['src/core/scheduler.rs', 'src/storage/wal.rs', 'src/net/transport.rs', 'src/api/gateway.ts'];
      chosen = hotspots[Math.floor(Math.random() * hotspots.length)];
    }

    if (!chosenFiles.has(chosen)) {
      chosenFiles.add(chosen);
      const isInitial = i < 20;
      const additions = isInitial ? Math.floor(Math.random() * 180) + 20 : Math.floor(Math.random() * 80) + 1;
      const deletions = isInitial ? 0 : Math.floor(Math.random() * 40);

      diffs.push({
        path: chosen,
        additions,
        deletions,
        type: isInitial ? 'added' : (deletions > additions * 2 ? 'deleted' : 'modified'),
      });
    }
  }

  commits.push({
    hash: generateHash(),
    author: author.name,
    email: author.email,
    date: commitTime.toISOString(),
    timestamp: commitTime.getTime(),
    message: `${cType}(${scope}): ${desc}`,
    diffs,
  });
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'sample_git_log.json'), JSON.stringify(commits, null, 2));
console.log(`Successfully generated ${commits.length} commits in public/sample_git_log.json`);
