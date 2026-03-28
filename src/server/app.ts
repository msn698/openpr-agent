import http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv } from '../config/env.js';
import { rulesSchema } from '../config/schema.js';
import { parseCommand } from '../core/commands.js';
import { buildFixPlan, formatFixPlan } from '../core/fixPlan.js';
import { evaluateAutofixPolicy } from '../core/autofixPolicy.js';
import { buildSafePatch, formatPatchSummary } from '../core/autofixPatch.js';
import { executeAutofixCommit } from '../github/autofixCommit.js';
import { getInstallationClient } from '../github/client.js';
import { buildReviewBody } from '../github/reviewFlow.js';
import { createModelAdapter } from '../models/factory.js';
import { assertNotReplay, verifySignature } from '../security/webhookGuard.js';

const replayStore = new Map<string, number>();

type RepoRef = { owner: { login: string }; name: string };
type PullRequestRef = { number: number };
type InstallationRef = { id: number };
type IssueRef = { number: number; pull_request?: Record<string, unknown> };
type CommentRef = { body?: string };

type PullRequestOpenedPayload = {
  action: string;
  installation?: InstallationRef;
  repository: RepoRef;
  pull_request: PullRequestRef;
};

type IssueCommentPayload = {
  action: string;
  installation?: InstallationRef;
  repository: RepoRef;
  issue: IssueRef;
  comment?: CommentRef;
};

export function createServer() {
  const env = loadEnv();
  const modelAdapter = createModelAdapter(env);

  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/webhooks/github') {
      write(res, 404, 'Not found');
      return;
    }

    const body = await readBody(req);

    try {
      const signature = req.headers['x-hub-signature-256'];
      const event = req.headers['x-github-event'];
      const deliveryId = req.headers['x-github-delivery'];

      if (typeof signature !== 'string' || !verifySignature(env.GITHUB_WEBHOOK_SECRET, body, signature)) {
        write(res, 401, 'Invalid signature');
        return;
      }

      if (typeof deliveryId !== 'string') {
        write(res, 400, 'Missing delivery id');
        return;
      }

      assertNotReplay(deliveryId, replayStore);

      if (event === 'pull_request') {
        const payload = JSON.parse(body) as PullRequestOpenedPayload;
        if (payload.action === 'opened') {
          await handlePullRequestOpened(payload, env.GITHUB_APP_ID, env.GITHUB_PRIVATE_KEY, modelAdapter);
        }
      }

      if (event === 'issue_comment') {
        const payload = JSON.parse(body) as IssueCommentPayload;
        if (payload.action === 'created') {
          await handleIssueComment(payload, env.GITHUB_APP_ID, env.GITHUB_PRIVATE_KEY);
        }
      }

      write(res, 200, 'ok');
    } catch (error) {
      console.error('[openpr] webhook handler error', error);
      write(res, 500, 'internal error');
    }
  });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function write(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(body);
}

async function handlePullRequestOpened(
  payload: PullRequestOpenedPayload,
  appId: string,
  privateKey: string,
  modelAdapter: ReturnType<typeof createModelAdapter>
) {
  const installationId = payload.installation?.id;
  if (!installationId) return;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pullNumber = payload.pull_request.number;

  const client = await getInstallationClient(appId, privateKey, installationId);
  const filesResponse = await client.pulls.listFiles({ owner, repo, pull_number: pullNumber, per_page: 100 });
  const changedFiles = filesResponse.data.map((f) => f.filename);

  const commentBody = await buildReviewBody({
    owner,
    repo,
    pullNumber,
    changedFiles,
    rules: rulesSchema.parse({}),
    model: modelAdapter
  });

  await client.issues.createComment({ owner, repo, issue_number: pullNumber, body: commentBody });
}

async function handleIssueComment(payload: IssueCommentPayload, appId: string, privateKey: string) {
  const installationId = payload.installation?.id;
  if (!installationId || !payload.issue.pull_request) return;

  const command = parseCommand(String(payload.comment?.body ?? ''));
  if (command.kind === 'none') return;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const issueNumber = payload.issue.number;
  const client = await getInstallationClient(appId, privateKey, installationId);

  if (command.kind === 'fix') {
    const filesResponse = await client.pulls.listFiles({ owner, repo, pull_number: issueNumber, per_page: 100 });
    const changedFiles = filesResponse.data.map((f) => f.filename);

    const policy = evaluateAutofixPolicy(changedFiles);
    if (!policy.allowed) {
      const blockedSummary = policy.blockedFiles.length
        ? `\n\nBlocked files:\n${policy.blockedFiles.map((f) => `- ${f}`).join('\n')}`
        : '';
      await client.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: `## OpenPR Autofix\n\n❌ ${policy.reason ?? 'Autofix denied by policy.'}${blockedSummary}`
      });
      return;
    }

    const plan = buildFixPlan(changedFiles);

    const patchCandidates = filesResponse.data.map((f) => ({
      path: f.filename,
      original: f.patch ?? ''
    }));
    const patchPreview = buildSafePatch(patchCandidates);

    try {
      const commitResult = await executeAutofixCommit({
        client,
        owner,
        repo,
        pullNumber: issueNumber
      });

      if (commitResult.status === 'committed') {
        await client.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: `${formatFixPlan(plan)}\n\n✅ Commit pushed: \`${commitResult.commitSha}\` on \`${commitResult.branch}\`\n- Changed files: ${commitResult.changedCount}\n- Skipped files: ${commitResult.skippedCount}`
        });
      } else if (commitResult.status === 'blocked') {
        await client.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: `${formatFixPlan(plan)}\n\n⛔ ${commitResult.reason}\nBranch: \`${commitResult.branch}\``
        });
      } else {
        await client.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: `${formatFixPlan(plan)}\n\n${formatPatchSummary(patchPreview)}\n\nℹ️ No deterministic safe edits required.`
        });
      }
    } catch (error) {
      await client.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: `${formatFixPlan(plan)}\n\n${formatPatchSummary(patchPreview)}\n\n❌ Autofix commit failed. ${error instanceof Error ? error.message : 'Unknown error.'}`
      });
    }
  }

  if (command.kind === 'review') {
    await client.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: '🔁 Re-review queued. (Next milestone: incremental diff-aware review pass.)'
    });
  }
}
