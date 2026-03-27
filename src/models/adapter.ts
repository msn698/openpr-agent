export type ReviewInput = {
  changedFiles: string[];
  findingsSummary: string;
};

export type ReviewOutput = {
  summary: string;
  suggestedActions: string[];
};

export interface ModelAdapter {
  review(input: ReviewInput): Promise<ReviewOutput>;
}

export class MockAdapter implements ModelAdapter {
  async review(input: ReviewInput): Promise<ReviewOutput> {
    const hasSecrets = input.changedFiles.some((f) => f.includes('.env') || f.endsWith('.pem'));

    return {
      summary: hasSecrets
        ? 'Potential secret exposure risk detected. Review sensitive files before merge.'
        : 'No obvious high-risk signals found from changed file paths.',
      suggestedActions: [
        'Run full test suite before merge',
        'Require at least one human reviewer approval',
        'Use @openpr fix to request a safe patch attempt for flagged issues'
      ]
    };
  }
}
