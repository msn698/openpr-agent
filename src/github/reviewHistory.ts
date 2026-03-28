import { decodeReviewState } from '../core/reviewState.js';
import type { Octokit } from '@octokit/rest';

export async function getLastReviewedCommitSha(params: {
  client: Octokit;
  owner: string;
  repo: string;
  issueNumber: number;
}): Promise<string | null> {
  const { client, owner, repo, issueNumber } = params;

  const comments = await client.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100
  });

  for (const comment of [...comments.data].reverse()) {
    const body = comment.body ?? '';
    if (!body.includes('OpenPR')) continue;

    const state = decodeReviewState(body);
    if (state?.lastReviewedCommitSha) {
      return state.lastReviewedCommitSha;
    }
  }

  return null;
}
