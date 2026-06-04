"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, User } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

export default function CreateTemplate() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [creatorName, setCreatorName] = useState('');

  // Prefill the creator's name from their account (still editable).
  useEffect(() => {
    if (session?.user?.name) setCreatorName(prev => prev || session.user!.name!);
  }, [session]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  }
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-600">Please sign in to create a slambook.</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/create' })}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim()) return;
    
    sessionStorage.setItem('slambookCreatorName', creatorName.trim());
    // Since we don't know the friend's name yet, we will just use a generic title for question builder
    sessionStorage.setItem('slambookRelationship', 'Friend');
    router.push('/questions');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 px-2 flex flex-col items-center">
          <div className="text-sm font-medium text-slate-500 mb-2">Step 1 of 2</div>
          <h1 className="text-3xl font-bold font-outfit text-slate-800">Create a Slambook Template</h1>
          <p className="text-slate-500 text-center mt-2">Set up a template to share with your friends so they can fill it for you.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-500 mb-2">
              <User className="w-6 h-6" />
              <h2 className="text-2xl font-bold text-slate-800">Your Identity</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What is your name?</label>
                <input required autoFocus type="text" value={creatorName} onChange={e => setCreatorName(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. Alex" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-8 flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition">
                Next: Build Questions <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
