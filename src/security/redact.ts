const SECRET_PATTERNS: RegExp[] = [
  /ghp_[A-Za-z0-9]{20,}/g,
  /sk-[A-Za-z0-9]{20,}/g,
  /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----[\s\S]*?-----END (RSA|EC|OPENSSH) PRIVATE KEY-----/g
];

export function redactSecrets(input: string): string {
  return SECRET_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, '[REDACTED_SECRET]'), input);
}
