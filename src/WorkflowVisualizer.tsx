import React, { useState, useEffect } from 'react';
import { Send, Wand2 } from 'lucide-react';
import { callWorkflowApi } from './services/workflowService'; // Import the new API call function

// --- Merged WorkflowNode component --- 

interface WorkflowNodeProps {
  title: string;
  active: boolean;
  loading: boolean;
  content: string;
  color: 'blue' | 'purple' | 'green';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  }
};

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  title,
  active,
  loading,
  content,
  color
}) => {
  const colors = colorMap[color];
  
  return (
    <div className="flex flex-col items-center mb-6 sm:mb-0 transition-all duration-300 flex-1 sm:mx-2"> {/* Added flex-1 and sm:mx-2 for spacing */}
      <div
        className={`flex items-center justify-center w-16 h-16 rounded-full ${
          active ? colors.bg : 'bg-slate-300'
        } text-white font-semibold mb-2 shadow-md transition-all duration-500 transform ${
          active ? 'scale-100' : 'scale-90 opacity-70'
        }`}
      >
        {loading ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          title
        )}
      </div>
      <div className="text-sm font-medium text-slate-700 mb-2">{title}</div> {/* Added mb-2 for spacing */}
      
      {active && (
        <div
          className={`mt-1 p-3 rounded-md ${colors.bgLight} ${colors.border} border ${colors.text} w-full text-sm transition-all duration-300 animate-fadeIn overflow-auto flex-grow`} /* Removed max-w, min-h, added flex-grow, adjusted mt */
        >
          {content || (loading ? 'Processing...' : 'Waiting for input...')}
        </div>
      )}
    </div>
  );
};

// --- End of Merged WorkflowNode component ---

const TASK_EXAMPLES = [
  "Generate concise meeting notes from a transcript",
  "Write a short blog post or product description",
  "Convert natural language to SQL queries",
  "Provide instant customer support replies",
  "Summarize news articles",
  "Analyze financial news for market trends",
  "Automate repetitive coding tasks",
  "Translate technical documents between English/Chinese",
  "Build a FastAPI image classification app",
  "Develop full-stack Node.js applications",
  "Summarize videos/multimodal documents",
  "Solve complex math problems",
  "Generate specialized scientific reports",
  "Draft detailed legal contracts",
  "Calculate sum of integers in a range (Python)",
  "Extract structured data from medical records",
  "Classify short text messages",
  "Review code snippets",
  "Transcribe voice-to-text instantly",
  "Debug complex algorithms"
];

const WorkflowVisualizer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [nodeData, setNodeData] = useState<Record<string, string>>({
    plan: '',
    think: '',
    output: ''
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({
    plan: false,
    think: false,
    output: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Generate session ID on component mount
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    // Reset previous results and set loading state
    setNodeData({ plan: '', think: '', output: '' });
    setActiveNodes([]);
    setIsProcessing(true);
    // Set loading for all nodes initially
    setLoading({ plan: true, think: true, output: true });
    setActiveNodes([0]); // Activate the first node (Plan)

    try {
      // Call the backend API with query and sessionId
      const result = await callWorkflowApi(query, sessionId);

      // 1. Update Plan immediately
      setNodeData(prev => ({ ...prev, plan: result.Plan }));
      setLoading(prev => ({ ...prev, plan: false }));

      // 2. Update Think after 2 seconds
      setTimeout(() => {
        setNodeData(prev => ({ ...prev, think: result.Think }));
        setActiveNodes(prev => [...prev, 1]); // Activate Think node
        setLoading(prev => ({ ...prev, think: false }));
      }, 2000);

      // 3. Update Output after 4 seconds (2 seconds after Think)
      setTimeout(() => {
        setNodeData(prev => ({ ...prev, output: result.response }));
        setActiveNodes(prev => [...prev, 2]); // Activate Output node
        setLoading(prev => ({ ...prev, output: false }));
        setIsProcessing(false); // End processing after final step
      }, 4000);

    } catch (error) {
      console.error('Error calling workflow API:', error);
      // Display an error message in all nodes
      setNodeData({
        plan: 'Error: Could not fetch plan.',
        think: 'Error: Could not fetch thought process.',
        output: 'Error: Could not fetch final response.'
      });
      setActiveNodes([0, 1, 2]); // Show all nodes with error messages
      // Reset loading and processing states on error
      setLoading({ plan: false, think: false, output: false });
      setIsProcessing(false);
    }
    // Removed finally block as state resets are handled within try/catch
  };

  const handleExampleClick = () => {
    if (TASK_EXAMPLES.length === 0) return;
    const randomIndex = Math.floor(Math.random() * TASK_EXAMPLES.length);
    setQuery(TASK_EXAMPLES[randomIndex]);
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/3">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Enter Your Query</h2>
            <div className="relative mb-4">
              <textarea
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="What would you like to process?"
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                type="submit"
                disabled={isProcessing || !query.trim()}
                className={`flex-grow py-3 px-4 flex items-center justify-center gap-2 rounded-md font-medium transition-all ${
                  isProcessing || !query.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Send size={18} />
                Process Query
              </button>
              <button
                type="button"
                onClick={handleExampleClick}
                disabled={isProcessing}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center justify-center transition-colors shadow-sm aspect-square"
                title="Get Example Query" // Add title for accessibility
              >
                <Wand2 size={18} />
              </button>
            </div>
          </form>
        </div>
        
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Process</h2>
          <div className="flex flex-col items-center">
            <div className="flex flex-col sm:flex-row justify-between items-start w-full mb-8 relative"> {/* Changed items-center to items-start */}
              {/* Connection lines */}
              <div className="hidden sm:block absolute top-8 left-0 right-0 h-0.5 bg-slate-200 -z-10"></div> {/* Adjusted top position */}
              
              {/* Workflow nodes */}
              <WorkflowNode
                title="Plan"
                active={activeNodes.includes(0)}
                loading={loading.plan}
                content={nodeData.plan}
                color="blue"
              />
              
              <WorkflowNode
                title="Think"
                active={activeNodes.includes(1)}
                loading={loading.think}
                content={nodeData.think}
                color="purple"
              />
              
              <WorkflowNode
                title="Output"
                active={activeNodes.includes(2)}
                loading={loading.output}
                content={nodeData.output}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualizer;