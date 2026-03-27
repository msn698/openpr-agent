export type FixPlan = {
  riskLevel: 'low' | 'medium' | 'high';
  steps: string[];
  blocked: boolean;
  reason?: string;
};

export function buildFixPlan(changedFiles: string[]): FixPlan {
  const hasSensitiveFiles = changedFiles.some((f) => f.includes('.env') || f.endsWith('.pem') || f.endsWith('.key'));

  if (hasSensitiveFiles) {
    return {
      riskLevel: 'high',
      blocked: true,
      reason: 'Sensitive file patterns detected. Manual review is required before autofix.',
      steps: ['Remove or rotate any leaked secret immediately', 'Push sanitized changes before requesting @openpr fix']
    };
  }

  const riskLevel: FixPlan['riskLevel'] = changedFiles.length > 40 ? 'medium' : 'low';

  return {
    riskLevel,
    blocked: false,
    steps: [
      'Create bot branch from current PR head',
      'Apply minimal safe changes for flagged findings',
      'Run lint + tests',
      'Push patch commit and post summary comment'
    ]
  };
}

export function formatFixPlan(plan: FixPlan): string {
  const header = `## OpenPR Autofix Plan (${plan.riskLevel.toUpperCase()} risk)`;

  if (plan.blocked) {
    return [header, '', `❌ Blocked: ${plan.reason ?? 'Policy restriction.'}`, '', ...plan.steps.map((s) => `- ${s}`)].join('\n');
  }

  return [header, '', '✅ Ready to execute safe autofix.', '', ...plan.steps.map((s) => `- ${s}`)].join('\n');
}
