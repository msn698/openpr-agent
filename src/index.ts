import 'dotenv/config';
import { Webhooks } from '@octokit/webhooks';
import { analyzeChangedFiles } from './core/analyzeDiff.js';
import { formatReviewComment } from './github/formatComment.js';
import { rulesSchema } from './config/schema.js';

const webhooks = new Webhooks({ secret: process.env.GITHUB_WEBHOOK_SECRET ?? 'dev-secret' });

webhooks.on('pull_request.opened', async ({ payload }) => {
  const changedFiles = payload.pull_request.changed_files;
  const files = Array.from({ length: Math.min(changedFiles, 5) }, (_, i) => `file-${i + 1}.ts`);
  const rules = rulesSchema.parse({});
  const findings = analyzeChangedFiles(files, rules);

  const comment = formatReviewComment(findings);
  console.log(`[openpr] ${payload.repository.full_name}#${payload.pull_request.number}`);
  console.log(comment);
});

export { webhooks };
