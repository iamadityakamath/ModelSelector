import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Clock3,
  Cpu,
  ExternalLink,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { callGroqWorkflow } from './services/groqService';

interface WorkflowNodeProps {
  title: string;
  description: string;
  active: boolean;
  loading: boolean;
  content: string;
  tone: 'blue' | 'violet' | 'emerald';
  icon: React.ReactNode;
}

const toneMap = {
  blue: {
    ring: 'from-sky-500 via-blue-500 to-cyan-500',
    badge: 'bg-sky-100 text-sky-700',
  },
  violet: {
    ring: 'from-violet-500 via-fuchsia-500 to-pink-500',
    badge: 'bg-violet-100 text-violet-700',
  },
  emerald: {
    ring: 'from-emerald-500 via-teal-500 to-cyan-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
};

const TASK_EXAMPLES = [
  'Generate concise meeting notes from a transcript',
  'Write a short blog post or product description',
  'Convert natural language to SQL queries',
  'Provide instant customer support replies',
  'Summarize news articles',
  'Analyze financial news for market trends',
  'Automate repetitive coding tasks',
  'Translate technical documents between English and Chinese',
  'Build a FastAPI image classification app',
  'Develop a full-stack Node.js application',
  'Summarize videos or multimodal documents',
  'Solve complex math problems',
  'Generate specialized scientific reports',
  'Draft detailed legal contracts',
  'Calculate the sum of integers in a range with Python',
  'Extract structured data from medical records',
  'Classify short text messages',
  'Review code snippets',
  'Transcribe voice to text instantly',
  'Debug complex algorithms',
];

const STEP_COPY = [
  'The selector breaks the task into a route and constraints.',
  'Reasoning expands the tradeoffs, risk, and model fit.',
  'A final answer is assembled with a clear recommendation.',
];

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  title,
  description,
  active,
  loading,
  content,
  tone,
  icon,
}) => {
  const theme = toneMap[tone];

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border bg-white/85 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-300 ${
        active ? 'border-slate-200 translate-y-0' : 'border-slate-200/70 opacity-80'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.ring}`} />
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.ring} text-white shadow-lg shadow-slate-900/10`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.badge}`}>
              {loading ? 'In progress' : active ? 'Ready' : 'Waiting'}
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-slate-950/20">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <Sparkles size={13} />
          Live state
        </div>
        <p className="whitespace-pre-wrap leading-6 text-slate-100">
          {content || (loading ? 'Processing task...' : 'Waiting for input to start the workflow.')}
        </p>
      </div>
    </article>
  );
};

const WorkflowVisualizer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [apiKey, setApiKey] = useState(() => window.localStorage.getItem('modelSelectorApiKey') ?? '');
  const [apiKeyError, setApiKeyError] = useState('');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [nodeData, setNodeData] = useState<Record<string, string>>({
    plan: '',
    think: '',
    output: '',
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({
    plan: false,
    think: false,
    output: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('modelSelectorApiKey', apiKey);
  }, [apiKey]);

  const resetWorkflow = () => {
    setNodeData({ plan: '', think: '', output: '' });
    setActiveNodes([]);
    setLoading({ plan: false, think: false, output: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || isProcessing) {
      return;
    }

    if (!apiKey.trim()) {
      setApiKeyError('An API key is required before you can generate a workflow.');
      return;
    }

    setApiKeyError('');

    resetWorkflow();
    setIsProcessing(true);
    setLoading({ plan: true, think: true, output: true });
    setActiveNodes([0]);

    try {
      const groqResponse = await callGroqWorkflow(query, apiKey);

      setNodeData({
        plan: 'Prompt sent to Groq for workflow generation.',
        think: 'Model response received and being prepared for display.',
        output: groqResponse,
      });
      setActiveNodes([0, 1, 2]);
      setLoading({ plan: false, think: false, output: false });
      setIsProcessing(false);
    } catch (error) {
      console.error('Error calling workflow API:', error);
      setNodeData({
        plan: 'The prompt could not be sent to Groq.',
        think: 'The response could not be generated.',
        output: 'Check the API key and try again.',
      });
      setActiveNodes([0, 1, 2]);
      setLoading({ plan: false, think: false, output: false });
      setIsProcessing(false);
    }
  };

  const handleExampleClick = () => {
    if (TASK_EXAMPLES.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * TASK_EXAMPLES.length);
    setQuery(TASK_EXAMPLES[randomIndex]);
  };

  const handleClear = () => {
    if (isProcessing) {
      return;
    }

    setQuery('');
    resetWorkflow();
  };

  return (
    <div className="grid w-full gap-6 lg:min-h-[calc(100vh-14.5rem)] lg:grid-cols-[minmax(340px,38vw)_minmax(0,1fr)]">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-7 lg:h-full">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                API access
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Set your API key</h2>
            </div>

            <button
              type="button"
              onClick={() => setShowSetupGuide(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <BookOpen size={14} />
              Setup guide
            </button>
          </div>

          <div className="mt-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              API key required
            </label>
            <input
              className="w-full border-0 bg-transparent px-2 py-1 text-[15px] leading-7 text-slate-900 outline-none placeholder:text-slate-400"
              type="password"
              placeholder="Paste your API key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (apiKeyError) {
                  setApiKeyError('');
                }
              }}
              autoComplete="off"
              spellCheck={false}
              disabled={isProcessing}
            />
            <p className="px-2 pt-2 text-xs leading-5 text-slate-500">
              Saved locally in this browser and attached to each workflow request.
            </p>
            {apiKeyError ? <p className="px-2 pt-2 text-xs font-medium text-rose-600">{apiKeyError}</p> : null}
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <Bot size={14} />
                Task input
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Describe what you want to do.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The selector will turn a natural-language request into a visible plan, reasoning pass, and final recommendation.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-500 sm:block">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
            <textarea
              className="min-h-40 w-full resize-none border-0 bg-transparent p-2 text-[15px] leading-7 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Paste the prompt you want to send to Groq."
              rows={6}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold shadow-lg shadow-sky-600/20 transition-all ${
                isProcessing || !query.trim()
                  ? 'cursor-not-allowed bg-slate-200 text-slate-500 shadow-none'
                  : 'bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800'
              }`}
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {isProcessing ? 'Processing task' : 'Generate workflow'}
            </button>

            <button
              type="button"
              onClick={handleExampleClick}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Try an example task"
            >
              <Wand2 size={18} />
              Surprise me
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isProcessing && query.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent px-4 py-3.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
          </form>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <Clock3 size={14} />
            What happens next
          </div>
          <div className="mt-4 grid gap-3">
            {STEP_COPY.map((copy, index) => (
              <div key={copy} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showSetupGuide ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowSetupGuide(false)}>
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="setup-guide-title"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Setup guide</p>
                <h3 id="setup-guide-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  How to create a Groq API key
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowSetupGuide(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                aria-label="Close setup guide"
              >
                <X size={16} />
              </button>
            </div>

            <ol className="space-y-3 text-sm leading-6 text-slate-700">
              <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                1. Go to{' '}
                <a
                  href="https://console.groq.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4"
                >
                  https://console.groq.com/
                  <ExternalLink size={14} />
                </a>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">2. Create an account</li>
              <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">3. Click on API key</li>
              <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">4. Generate API key</li>
            </ol>
          </div>
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-6 lg:h-full">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              <BrainCircuit size={14} />
              Workflow preview
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">See the model decision unfold.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Three stages show the path from analysis to recommendation, with each panel updating as results arrive.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
              <Cpu size={13} className="text-sky-600" />
              Cost aware
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
              <ArrowRight size={13} className="text-violet-600" />
              Sequential stages
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <WorkflowNode
            title="Plan"
            description="Breaks down the request and picks a practical route for the model stack."
            active={activeNodes.includes(0)}
            loading={loading.plan}
            content={nodeData.plan}
            tone="blue"
            icon={<BrainCircuit size={20} />}
          />

          <WorkflowNode
            title="Think"
            description="Expands the tradeoffs, constraints, and task-specific reasoning."
            active={activeNodes.includes(1)}
            loading={loading.think}
            content={nodeData.think}
            tone="violet"
            icon={<Sparkles size={20} />}
          />

          <WorkflowNode
            title="Output"
            description="Produces the final recommendation or response for the task."
            active={activeNodes.includes(2)}
            loading={loading.output}
            content={nodeData.output}
            tone="emerald"
            icon={<ShieldCheck size={20} />}
          />
        </div>
      </section>
    </div>
  );
};

export default WorkflowVisualizer;
