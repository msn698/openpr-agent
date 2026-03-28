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

abstract class HttpModelAdapter implements ModelAdapter {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly model: string,
    private readonly authHeader = 'Authorization'
  ) {}

  async review(input: ReviewInput): Promise<ReviewOutput> {
    const prompt = [
      'You are an AI code review assistant. Return strict JSON with keys summary and suggestedActions (string array).',
      `Changed files: ${input.changedFiles.join(', ')}`,
      `Findings summary: ${input.findingsSummary}`
    ].join('\n');

    const body = this.buildRequest(prompt);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        [this.authHeader]: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Model API error: ${response.status}`);
    }

    const parsed = await this.parseResponse(response);
    return {
      summary: parsed.summary || 'No summary returned by model.',
      suggestedActions:
        parsed.suggestedActions?.length > 0
          ? parsed.suggestedActions
          : ['Run tests and request human reviewer confirmation before merge.']
    };
  }

  protected abstract buildRequest(prompt: string): Record<string, unknown>;
  protected abstract parseResponse(response: Response): Promise<{ summary: string; suggestedActions: string[] }>;

  protected get modelName(): string {
    return this.model;
  }
}

export class OpenAIAdapter extends HttpModelAdapter {
  constructor(apiKey: string, model = 'gpt-4o-mini') {
    super(apiKey, 'https://api.openai.com/v1/chat/completions', model);
  }

  protected buildRequest(prompt: string): Record<string, unknown> {
    return {
      model: this.modelName,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return JSON only: {"summary":"...","suggestedActions":["..."]}' },
        { role: 'user', content: prompt }
      ]
    };
  }

  protected async parseResponse(response: Response): Promise<{ summary: string; suggestedActions: string[] }> {
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? '{}';
    return JSON.parse(content) as { summary: string; suggestedActions: string[] };
  }
}

export class AnthropicAdapter extends HttpModelAdapter {
  constructor(apiKey: string, model = 'claude-3-5-haiku-latest') {
    super(apiKey, 'https://api.anthropic.com/v1/messages', model, 'x-api-key');
  }

  protected buildRequest(prompt: string): Record<string, unknown> {
    return {
      model: this.modelName,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
      system: 'Return JSON only: {"summary":"...","suggestedActions":["..."]}'
    };
  }

  protected async parseResponse(response: Response): Promise<{ summary: string; suggestedActions: string[] }> {
    const json = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };
    const content = json.content?.[0]?.text ?? '{}';
    return JSON.parse(content) as { summary: string; suggestedActions: string[] };
  }
}

export class LocalOllamaAdapter implements ModelAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string
  ) {}

  async review(input: ReviewInput): Promise<ReviewOutput> {
    const prompt = [
      'Return JSON only: {"summary":"...","suggestedActions":["..."]}',
      `Changed files: ${input.changedFiles.join(', ')}`,
      `Findings summary: ${input.findingsSummary}`
    ].join('\n');

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false, format: 'json' })
    });

    if (!response.ok) {
      throw new Error(`Local model API error: ${response.status}`);
    }

    const json = (await response.json()) as { response?: string };
    const parsed = JSON.parse(json.response ?? '{}') as { summary?: string; suggestedActions?: string[] };

    return {
      summary: parsed.summary ?? 'No summary returned by local model.',
      suggestedActions:
        parsed.suggestedActions && parsed.suggestedActions.length > 0
          ? parsed.suggestedActions
          : ['Run tests and request human reviewer confirmation before merge.']
    };
  }
}
