export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface WorkflowDecision {
  plan: string;
  think: string;
  model: string;
  tier: string;
  cost: string;
  reason: string;
  raw: string;
}

interface PartialWorkflowDecision {
  plan?: unknown;
  think?: unknown;
  model?: unknown;
  tier?: unknown;
  cost?: unknown;
  reason?: unknown;
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const stripMarkdownCodeFence = (content: string): string => {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fencedMatch ? fencedMatch[1].trim() : trimmed;
};

const extractFirstJsonObject = (content: string): string | null => {
  let inString = false;
  let escaped = false;
  let depth = 0;
  let start = -1;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;

      if (depth === 0 && start !== -1) {
        return content.slice(start, index + 1);
      }
    }
  }

  return null;
};

const parseDecision = (content: string): WorkflowDecision => {
  const cleaned = stripMarkdownCodeFence(content);
  const candidates = [cleaned, extractFirstJsonObject(cleaned)].filter(
    (candidate): candidate is string => Boolean(candidate)
  );

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as PartialWorkflowDecision;

      const plan = normalizeText(parsed.plan);
      const think = normalizeText(parsed.think);
      const model = normalizeText(parsed.model);
      const tier = normalizeText(parsed.tier);
      const cost = normalizeText(parsed.cost);
      const reason = normalizeText(parsed.reason);

      if (plan || think || model || tier || cost || reason) {
        return {
          plan,
          think,
          model,
          tier,
          cost,
          reason,
          raw: content,
        };
      }
    } catch {
      // Keep trying with alternate JSON candidates.
    }
  }

  return {
    plan: '',
    think: '',
    model: '',
    tier: '',
    cost: '',
    reason: '',
    raw: content,
  };
};

export const callGroqWorkflow = async (
  prompt: string,
  apiKey: string
): Promise<WorkflowDecision> => {
  const normalizedApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');

  if (!normalizedApiKey) {
    throw new Error('An API key is required.');
  }

  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      apiKey: normalizedApiKey,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json() as { content?: string; error?: string };
  const content = data.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(data.error || 'Groq response did not include any content.');
  }

  return parseDecision(content);
};