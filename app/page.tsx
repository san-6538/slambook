"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const startCreating = () => {
    if (session?.user) router.push('/create');
    else signIn('google', { callbackUrl: '/create' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl text-center space-y-8"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
          ✨ preserving memories 
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 font-outfit">
          Capture the unspoken <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">connections</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto">
          Slambook helps you craft a beautiful, personalized, and deep digital memory lane for the people who matter most.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <motion.button
            onClick={startCreating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-colors"
          >
            {session?.user ? 'Start Creating' : 'Sign in to Start'}
          </motion.button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium text-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              My Slambooks
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
