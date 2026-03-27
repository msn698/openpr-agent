import type { RulesConfig } from '../config/schema.js';

export type Finding = {
  severity: 'low' | 'medium' | 'high';
  file: string;
  message: string;
};

export function analyzeChangedFiles(files: string[], rules: RulesConfig): Finding[] {
  const findings: Finding[] = [];

  if (files.length > rules.maxFiles) {
    findings.push({
      severity: 'medium',
      file: '*',
      message: `PR is too large (${files.length} files). Consider splitting to improve review quality.`
    });
  }

  for (const file of files) {
    for (const blocked of rules.blockedPatterns) {
      const token = blocked.replace('*', '');
      if (token && file.includes(token)) {
        findings.push({
          severity: 'high',
          file,
          message: `Potential sensitive file pattern detected (${blocked}).`
        });
      }
    }
  }

  return findings;
}

export function summarizeFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'No obvious high-signal issues found.';
  return findings
    .map((f, idx) => `${idx + 1}. [${f.severity.toUpperCase()}] ${f.file} — ${f.message}`)
    .join('\n');
}
