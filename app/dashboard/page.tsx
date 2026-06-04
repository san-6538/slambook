"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { BookText, Eye, Calendar, Trash2, Upload, ImageIcon, Layers } from 'lucide-react';
import { setMedia, deleteMedia, hasMedia, parseKeepsakeHtml } from '@/lib/slambookStore';

export default function Dashboard() {
  const { status } = useSession();
  const [slambooks, setSlambooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [withPhotos, setWithPhotos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setLoading(false);
      return;
    }

    fetch('/api/slambooks')
      .then(res => res.json())
      .then(async (res) => {
        if (Array.isArray(res)) {
          setSlambooks(res);
          // Figure out which entries already have photos imported on this device.
          const flags: Record<string, boolean> = {};
          await Promise.all(
            res.map(async (sb: any) => {
              try { flags[sb._id] = await hasMedia(sb._id); } catch { flags[sb._id] = false; }
            })
          );
          setWithPhotos(flags);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-600">Sign in to see your slambooks.</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const handleDelete = async (id: string, friendName: string) => {
    if (!window.confirm(`Delete the slambook from ${friendName || 'this friend'}? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/slambooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSlambooks(prev => prev.filter(sb => sb._id !== id));
        try { await deleteMedia(id); } catch { /* local cleanup is best-effort */ }
      } else {
        alert('Could not delete this slambook. Please try again.');
      }
    } catch {
      alert('Could not delete this slambook. Please try again.');
    }
    setDeletingId(null);
  };

  const handleImport = async (id: string, friendName: string, file: File) => {
    setImportingId(id);
    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        alert(
          "That's a PDF. To recover the photos automatically, import the .html keepsake file your friend downloaded — PDFs can't carry the embedded photos for re-import."
        );
        return;
      }
      const text = await file.text();
      const parsed = parseKeepsakeHtml(text);
      if (!parsed) {
        alert("This file doesn't look like a slambook keepsake. Import the .html file your friend downloaded.");
        return;
      }
      if (
        parsed.friendName && friendName &&
        parsed.friendName.trim().toLowerCase() !== friendName.trim().toLowerCase() &&
        !window.confirm(`This file is from "${parsed.friendName}", but this slambook is from "${friendName}". Import anyway?`)
      ) {
        return;
      }
      const media = parsed.media || {};
      if (!media.bestPhoto && !media.chaoticMemory && !media.neverDelete) {
        alert('No photos were found in that file.');
        return;
      }
      await setMedia(id, media);
      setWithPhotos(prev => ({ ...prev, [id]: true }));
    } catch {
      alert('Could not read this file.');
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 font-outfit mb-2">My Slambooks</h1>
            <p className="text-slate-500 text-sm md:text-base">Your collection of preserved memories and deep connections.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {slambooks.length > 0 && (
              <Link href="/merge">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition">
                  <Layers className="w-4 h-4" /> Merge &amp; PDF
                </button>
              </Link>
            )}
            <Link href="/create">
              <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/10">
                Create New
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : slambooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 flex flex-col items-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <BookText className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No slambooks yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">Start crafting a beautiful memory lane for a friend.</p>
            <Link href="/create">
              <button className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20">
                Start Creating
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slambooks.map((sb, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={sb._id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-pink-200 transition group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{sb.friendName}</h3>
                    <p className="text-sm text-pink-500 font-medium">{sb.relationshipTitle}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-pink-50 transition">
                    <BookText className="w-5 h-5 text-slate-400 group-hover:text-pink-500" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-slate-500 gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(sb.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 italic">
                    "{sb.summary?.text}"
                  </p>
                </div>

                <div className="mb-4">
                  {withPhotos[sb._id] ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <ImageIcon className="w-3.5 h-3.5" /> Photos added
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                      <ImageIcon className="w-3.5 h-3.5" /> No photos yet
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/preview?id=${sb._id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition text-sm font-medium">
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </Link>

                  <label
                    title="Import the file your friend sent back to add their photos"
                    className={`flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition text-sm font-medium cursor-pointer ${importingId === sb._id ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="sm:hidden">{importingId === sb._id ? 'Importing…' : 'Import file'}</span>
                    <input
                      type="file"
                      accept=".html,.htm,text/html,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImport(sb._id, sb.friendName, f);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <button
                    onClick={() => handleDelete(sb._id, sb.friendName)}
                    disabled={deletingId === sb._id}
                    aria-label="Delete slambook"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
