"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Check, RefreshCw, ArrowRight } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

export default function QuestionBuilder() {
  const router = useRouter();
  const { status } = useSession();
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const name = sessionStorage.getItem('slambookCreatorName');
    if (!name) {
      router.push('/create');
      return;
    }
    setCreatorName(name);
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearsKnown: 5, interactionFrequency: 'daily', bondType: 'fun' }) // mock context for suggestions
      });
      const result = await res.json();
      
      const newSuggestions = result.questions.filter(
        (q: any) => !selectedQuestions.find(sq => sq.question === q.question)
      );
      setSuggestions(newSuggestions);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const MAX_QUESTIONS = 30;
  const MIN_QUESTIONS = 10;

  const toggleQuestion = (q: any) => {
    if (selectedQuestions.find(sq => sq.question === q.question)) {
      setSelectedQuestions(selectedQuestions.filter(sq => sq.question !== q.question));
    } else {
      if (selectedQuestions.length < MAX_QUESTIONS) {
        setSelectedQuestions([...selectedQuestions, q]);
        setSuggestions(suggestions.filter(s => s.question !== q.question));
      }
    }
  };

  const addCustomQuestion = () => {
    if (customQuestion.trim() && selectedQuestions.length < MAX_QUESTIONS) {
      setSelectedQuestions([...selectedQuestions, { question: customQuestion.trim(), tags: ['custom'] }]);
      setCustomQuestion('');
    }
  };

  const generateTemplate = async () => {
    if (selectedQuestions.length < MIN_QUESTIONS) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/create-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorName, questions: selectedQuestions })
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/share?id=${data.id}`);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  }
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-600">Please sign in to build a slambook.</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/create' })}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!creatorName) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4 flex justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col md:h-[80vh] md:sticky md:top-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 font-outfit mb-2">Build Your Template</h2>
            <p className="text-sm text-slate-500">Pick 10–30 meaningful questions for your friends to answer. Add your own below to go beyond the suggestions.</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-[180px] max-h-[40vh] md:max-h-none">
            {selectedQuestions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-4 text-center">
                <p>No questions selected yet.</p>
                <p className="mt-2">Pick from suggestions or create your own.</p>
              </div>
            ) : (
              selectedQuestions.map((q, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i} 
                  className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-start gap-4"
                >
                  <p className="text-slate-700 text-sm font-medium">{q.question}</p>
                  <button onClick={() => toggleQuestion(q)} className="text-indigo-400 hover:text-indigo-600 mt-0.5">
                    <Check className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Progress: {selectedQuestions.length}/{MAX_QUESTIONS}</span>
              <div className="flex-1 ml-4 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all" style={{ width: `${Math.min(100, (selectedQuestions.length / MAX_QUESTIONS) * 100)}%` }} />
              </div>
            </div>
            {selectedQuestions.length < MIN_QUESTIONS && (
              <p className="text-xs text-slate-400 mb-4">Pick at least {MIN_QUESTIONS} questions to continue ({MIN_QUESTIONS - selectedQuestions.length} more).</p>
            )}
            <button
              onClick={generateTemplate}
              disabled={selectedQuestions.length < MIN_QUESTIONS || isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Link...' : 'Generate Shareable Link'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 font-outfit">Suggestions</h3>
              <button 
                onClick={fetchQuestions}
                className="text-slate-400 hover:text-indigo-500 transition flex items-center gap-1.5 text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
            
            <div className="space-y-3 min-h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading ideas...</div>
              ) : suggestions.length === 0 ? (
                <div className="text-sm text-slate-500">No more suggestions right now. Try refreshing!</div>
              ) : (
                suggestions.map((q, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={i} 
                    onClick={() => toggleQuestion(q)}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-slate-700 text-sm">{q.question}</p>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 bg-gradient-to-b from-white to-pink-50/30">
            <h3 className="font-bold text-slate-800 font-outfit mb-4">Add your own question</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={customQuestion} 
                onChange={e => setCustomQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomQuestion()}
                className="flex-1 p-3 flex text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition bg-white" 
                placeholder="What is your favorite memory..." 
              />
              <button 
                onClick={addCustomQuestion}
                className="px-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
