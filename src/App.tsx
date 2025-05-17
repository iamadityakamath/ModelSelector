import React from 'react';
import WorkflowVisualizer from './WorkflowVisualizer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
      <header className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Smart Model Selector</h1>
        <p className="text-slate-600">Automatically selects the optimal AI model for any task, balancing cost and capability.</p>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <WorkflowVisualizer />
      </main>
      
      <footer className="p-4 text-center text-slate-500 text-sm">
        © 2025 Smart Model Selector - Select optimal models for your AI needs.
      </footer>
    </div>
  );
}

export default App;