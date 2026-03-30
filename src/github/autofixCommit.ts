import type { Octokit } from '@octokit/rest';
import { buildSafePatch } from '../core/autofixPatch.js';

export type CommitAutofixResult =
  | {
      status: 'committed';
      commitSha: string;
      branch: string;
      changedCount: number;
      skippedCount: number;
    }
  | {
      status: 'no_changes';
      branch: string;
      skippedCount: number;
    }
  | {
      status: 'blocked';
      reason: string;
      branch: string;
    }
  | {
      status: 'dry_run';
      branch: string;
      changedCount: number;
      skippedCount: number;
      previewCommitSha: string;
    };

export async function executeAutofixCommit(params: {
  client: Octokit;
  owner: string;
  repo: string;
  pullNumber: number;
  dryRun?: boolean;
}): Promise<CommitAutofixResult> {
  const { client, owner, repo, pullNumber, dryRun = false } = params;

  const pr = await client.pulls.get({ owner, repo, pull_number: pullNumber });
  const headRef = pr.data.head.ref;
  const headSha = pr.data.head.sha;
  const headRepoFullName = pr.data.head.repo?.full_name;
  const baseRepoFullName = pr.data.base.repo.full_name;

  if (!headRepoFullName || headRepoFullName !== baseRepoFullName) {
    return {
      status: 'blocked',
      reason: 'Autofix commit is blocked for fork-based PRs (write access/safety boundary).',
      branch: headRef
    };
  }

  const filesResponse = await client.pulls.listFiles({ owner, repo, pull_number: pullNumber, per_page: 100 });
  const filenames = filesResponse.data.map((f) => f.filename);

  const candidates: Array<{ path: string; original: string }> = [];

  for (const path of filenames) {
    if (path === '/dev/null') continue;
    try {
      const contentResponse = await client.repos.getContent({
        owner,
        repo,
        path,
        ref: headRef
      });

      if (!('content' in contentResponse.data) || typeof contentResponse.data.content !== 'string') {
        continue;
      }

      const decoded = Buffer.from(contentResponse.data.content, 'base64').toString('utf8');
      candidates.push({ path, original: decoded });
    } catch {
      continue;
    }
  }

  const patch = buildSafePatch(candidates);

  if (patch.changedFiles.length === 0) {
    return {
      status: 'no_changes',
      branch: headRef,
      skippedCount: patch.skippedFiles.length
    };
  }

  const baseCommit = await client.git.getCommit({ owner, repo, commit_sha: headSha });

  const treeItems: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }> = [];

  for (const file of patch.changedFiles) {
    const blob = await client.git.createBlob({
      owner,
      repo,
      content: file.content,
      encoding: 'utf-8'
    });

    treeItems.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blob.data.sha
    });
  }

  const newTree = await client.git.createTree({
    owner,
    repo,
    base_tree: baseCommit.data.tree.sha,
    tree: treeItems
  });

  const newCommit = await client.git.createCommit({
    owner,
    repo,
    message: 'chore(openpr): apply deterministic safe autofixes',
    tree: newTree.data.sha,
    parents: [headSha]
  });

  if (dryRun) {
    return {
      status: 'dry_run',
      branch: headRef,
      changedCount: patch.changedFiles.length,
      skippedCount: patch.skippedFiles.length,
      previewCommitSha: newCommit.data.sha
    };
  }

  await client.git.updateRef({
    owner,
    repo,
    ref: `heads/${headRef}`,
    sha: newCommit.data.sha,
    force: false
  });

  return {
    status: 'committed',
    commitSha: newCommit.data.sha,
    branch: headRef,
    changedCount: patch.changedFiles.length,
    skippedCount: patch.skippedFiles.length
  };
}
