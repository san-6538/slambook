"use client";
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogOut, BookText } from 'lucide-react';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-800 font-outfit">
          <BookText className="w-5 h-5 text-pink-500" />
          Slambook
        </Link>

        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <div className="w-20 h-8 rounded-lg bg-slate-100 animate-pulse" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5">
                My Slambooks
              </Link>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || 'You'} className="w-8 h-8 rounded-full border border-slate-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="text-sm font-medium text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                className="hidden sm:block text-sm font-medium text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                GitHub
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
