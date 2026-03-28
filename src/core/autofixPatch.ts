import { applySafeAutofixes } from './autofixApply.js';

export type PatchCandidate = {
  path: string;
  original: string;
};

export type PatchResult = {
  changedFiles: Array<{ path: string; edits: string[]; content: string }>;
  skippedFiles: string[];
};

const TEXT_FILE_PATTERN = /\.(ts|tsx|js|jsx|json|md|yml|yaml|txt|css|scss|html)$/i;

export function buildSafePatch(candidates: PatchCandidate[]): PatchResult {
  const changedFiles: PatchResult['changedFiles'] = [];
  const skippedFiles: string[] = [];

  for (const candidate of candidates) {
    if (!TEXT_FILE_PATTERN.test(candidate.path)) {
      skippedFiles.push(candidate.path);
      continue;
    }

    const result = applySafeAutofixes(candidate.original);
    if (result.changed) {
      changedFiles.push({
        path: candidate.path,
        edits: result.edits,
        content: result.output
      });
    }
  }

  return { changedFiles, skippedFiles };
}

export function formatPatchSummary(result: PatchResult): string {
  const lines = ['## OpenPR Autofix Patch Summary', ''];

  if (result.changedFiles.length === 0) {
    lines.push('No safe deterministic edits were needed.');
  } else {
    lines.push(`Changed files: ${result.changedFiles.length}`);
    for (const file of result.changedFiles) {
      lines.push(`- ${file.path} (${file.edits.join(', ')})`);
    }
  }

  if (result.skippedFiles.length > 0) {
    lines.push('', `Skipped non-text/unsupported files: ${result.skippedFiles.length}`);
    for (const file of result.skippedFiles) {
      lines.push(`- ${file}`);
    }
  }

  return lines.join('\n');
}
