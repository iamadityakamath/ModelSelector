import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Groq from 'groq-sdk';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// https://vitejs.dev/config/
const promptPath = join(process.cwd(), 'prompt', 'prompt.md');

const loadSystemPrompt = () => {
  try {
    return readFileSync(promptPath, 'utf8');
  } catch {
    return '';
  }
};

const groqApiPlugin = (): Plugin => ({
  name: 'groq-api-middleware',
  configureServer(server) {
    server.middlewares.use('/api/groq', (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }

      let requestBody = '';

      req.on('data', (chunk) => {
        requestBody += chunk;
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(requestBody || '{}') as {
            prompt?: string;
            apiKey?: string;
          };

          const prompt = parsed.prompt?.trim();
          const apiKey = parsed.apiKey?.trim().replace(/^Bearer\s+/i, '');

          if (!prompt) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Prompt is required.' }));
            return;
          }

          if (!apiKey) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'An API key is required.' }));
            return;
          }

          const groq = new Groq({ apiKey });
          const systemPrompt = loadSystemPrompt();

          const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
              ...(systemPrompt
                ? [
                    {
                      role: 'system' as const,
                      content: systemPrompt,
                    },
                  ]
                : []),
              {
                role: 'user' as const,
                content: prompt,
              },
            ],
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null,
          });

          const content = completion.choices[0]?.message?.content ?? '';

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ content }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown Groq error.';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), groqApiPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
