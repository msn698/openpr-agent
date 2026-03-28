export type AutofixPolicyDecision = {
  allowed: boolean;
  blockedFiles: string[];
  reason?: string;
};

const FORBIDDEN_PATH_PARTS = ['.env', '.pem', '.key', 'id_rsa', 'secrets', 'credentials'];

export function evaluateAutofixPolicy(files: string[], maxFiles = 25): AutofixPolicyDecision {
  if (files.length > maxFiles) {
    return {
      allowed: false,
      blockedFiles: [],
      reason: `Autofix limited to ${maxFiles} files; PR has ${files.length}.`
    };
  }

  const blockedFiles = files.filter((f) => FORBIDDEN_PATH_PARTS.some((part) => f.toLowerCase().includes(part)));

  if (blockedFiles.length > 0) {
    return {
      allowed: false,
      blockedFiles,
      reason: 'Autofix blocked for sensitive or credential-related paths.'
    };
  }

  return {
    allowed: true,
    blockedFiles: []
  };
}
