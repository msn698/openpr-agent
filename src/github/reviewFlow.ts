import { analyzeChangedFiles, summarizeFindings } from '../core/analyzeDiff.js';
import type { RulesConfig } from '../config/schema.js';
import { formatReviewComment } from './formatComment.js';
import type { ModelAdapter } from '../models/adapter.js';

export type ReviewFlowInput = {
  owner: string;
  repo: string;
  pullNumber: number;
  changedFiles: string[];
  rules: RulesConfig;
  model: ModelAdapter;
};

export async function buildReviewBody(input: ReviewFlowInput): Promise<string> {
  const findings = analyzeChangedFiles(input.changedFiles, input.rules);
  const findingsSummary = summarizeFindings(findings);

  const modelOutput = await input.model.review({
    changedFiles: input.changedFiles,
    findingsSummary
  });

  const base = formatReviewComment(findings);
  const extras = [
    '',
    '### AI Summary',
    modelOutput.summary,
    '',
    '### Suggested Actions',
    ...modelOutput.suggestedActions.map((s) => `- ${s}`)
  ].join('\n');

  return `${base}\n${extras}`;
}
