export type ReviewState = {
  lastReviewedCommitSha?: string;
};

const STATE_MARKER_PREFIX = '<!-- openpr:state ';
const STATE_MARKER_SUFFIX = ' -->';

export function encodeReviewState(state: ReviewState): string {
  return `${STATE_MARKER_PREFIX}${JSON.stringify(state)}${STATE_MARKER_SUFFIX}`;
}

export function decodeReviewState(commentBody: string): ReviewState | null {
  const start = commentBody.indexOf(STATE_MARKER_PREFIX);
  if (start === -1) return null;

  const end = commentBody.indexOf(STATE_MARKER_SUFFIX, start + STATE_MARKER_PREFIX.length);
  if (end === -1) return null;

  const raw = commentBody.slice(start + STATE_MARKER_PREFIX.length, end);

  try {
    const parsed = JSON.parse(raw) as ReviewState;
    return parsed;
  } catch {
    return null;
  }
}

export function buildReviewFooter(commitSha: string): string {
  return encodeReviewState({ lastReviewedCommitSha: commitSha });
}
