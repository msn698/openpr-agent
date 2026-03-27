import { redactSecrets } from '../security/redact.js';
import type { Finding } from '../core/analyzeDiff.js';

export function formatReviewComment(findings: Finding[]): string {
  const header = '## OpenPR Agent Review\n';
  const body =
    findings.length === 0
      ? '✅ No obvious high-risk issues in changed file list.'
      : findings
          .map((f) => `- **${f.severity.toUpperCase()}** \
\
\`${f.file}\`: ${f.message}`)
          .join('\n');

  return redactSecrets(`${header}\n${body}\n\n_Reply with_ \`@openpr fix\` _to request an autofix attempt._`);
}
