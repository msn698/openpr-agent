export type AutofixResult = {
  changed: boolean;
  output: string;
  edits: string[];
};

/**
 * Deterministic low-risk autofixes only.
 */
export function applySafeAutofixes(input: string): AutofixResult {
  let output = input;
  const edits: string[] = [];

  const trimmedTrailingWhitespace = output
    .split('\n')
    .map((line) => line.replace(/[\t ]+$/g, ''))
    .join('\n');

  if (trimmedTrailingWhitespace !== output) {
    edits.push('trim-trailing-whitespace');
    output = trimmedTrailingWhitespace;
  }

  const normalizedFinalNewline = output.endsWith('\n') ? output : `${output}\n`;
  if (normalizedFinalNewline !== output) {
    edits.push('ensure-final-newline');
    output = normalizedFinalNewline;
  }

  return {
    changed: edits.length > 0,
    output,
    edits
  };
}
