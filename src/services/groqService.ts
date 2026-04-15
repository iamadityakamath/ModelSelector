export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const callGroqWorkflow = async (
  prompt: string,
  apiKey: string
): Promise<string> => {
  const normalizedApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');

  if (!normalizedApiKey) {
    throw new Error('An API key is required.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${normalizedApiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      reasoning_effort: 'medium',
      stop: null,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Groq response did not include any content.');
  }

  return content;
};