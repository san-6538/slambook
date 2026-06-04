"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Copy, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ShareInner />
    </Suspense>
  );
}

function ShareInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (id) {
      // Filled slambooks appear on the dashboard via account ownership — no localStorage needed.
      setShareUrl(`${window.location.origin}/fill/${id}`);
    }
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!id) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50"
      >
        <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Share2 className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold font-outfit text-slate-800 mb-2">Template Ready!</h1>
        <p className="text-slate-500 mb-8">Send this link to your friends. Their filled slambooks will automatically appear in your dashboard.</p>

        <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-xl mb-8 border border-slate-200">
          <input 
            readOnly 
            value={shareUrl} 
            className="flex-1 bg-transparent text-sm text-slate-600 outline-none px-2"
          />
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 justify-center w-full px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
