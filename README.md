# Smart Model Selector

Smart Model Selector is a React + TypeScript app that helps route a task to the most suitable model tier and model choice. The UI presents the workflow in three stages:

- Plan
- Think
- Output

The app uses a server-side Vite middleware route to call Groq, and the system prompt is loaded from `prompt/prompt.md`.

## Live Website

Hosted at:

https://modelselection.kamathaditya.com/

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Groq SDK
- Lucide React icons

## Project Structure

- `src/App.tsx`: App shell layout and page chrome
- `src/WorkflowVisualizer.tsx`: Main UI, task input, workflow cards, setup guide modal
- `src/services/groqService.ts`: Frontend service for calling `/api/groq`
- `vite.config.ts`: Vite config and Groq server middleware endpoint
- `prompt/prompt.md`: System prompt used by the Groq request

## Prerequisites

- Node.js 18+ (recommended)
- npm
- A Groq API key

## Installation

1. Clone the repository.
2. Open the project folder.
3. Install dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open the local URL printed in the terminal (usually http://localhost:5173, or another port if 5173 is already in use).

## Build for Production

```bash
npm run build
```

This compiles TypeScript and creates production assets in the `dist` folder.

## Preview Production Build Locally

```bash
npm run preview
```

## How the API Flow Works

1. User enters a task and API key in the UI.
2. Frontend sends `{ prompt, apiKey }` to `/api/groq`.
3. Vite middleware in `vite.config.ts`:
   - loads system prompt from `prompt/prompt.md`
   - calls Groq server-side with Groq SDK
   - returns response content as JSON
4. Frontend parses response and renders Plan, Think, Model, Tier, Cost, and Reason.

## Notes

- API key is required in the UI before generating a workflow.
- API key is stored in browser local storage for convenience.
- The backend call to Groq is server-side in development middleware, not directly from the browser.

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Create production build
- `npm run preview`: Preview production build
- `npm run lint`: Run lint checks
