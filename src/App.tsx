import React from 'react';
import WorkflowVisualizer from './WorkflowVisualizer';
import { BarChart3, BrainCircuit, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_52%,_#e8eef7_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute left-[-6rem] top-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-40 h-72 w-72 rounded-full bg-emerald-400/12 blur-3xl" />

      <header className="relative z-10 flex w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/60 bg-white/70 px-5 py-4 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
              <BrainCircuit size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <Sparkles size={14} />
                Smart Model Selector
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Route every task to the right model, fast.
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            <BarChart3 size={16} className="text-sky-600" />
            Cost-aware, capability-aware, and built for clear decisions.
          </div>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 items-stretch justify-center px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <WorkflowVisualizer />
      </main>

      <footer className="relative z-10 w-full px-4 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2 rounded-3xl border border-white/60 bg-white/60 px-5 py-4 text-center text-sm text-slate-500 backdrop-blur-xl sm:flex-row">
          <span>Smart Model Selector</span>
          <span>Designed to make model choice feel visible instead of abstract.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;