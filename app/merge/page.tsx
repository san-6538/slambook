"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { getMedia, SlambookMedia } from '@/lib/slambookStore';

interface MergedEntry {
  entry: any;
  media: SlambookMedia;
}

export default function MergePage() {
  const [entries, setEntries] = useState<MergedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/slambooks')
      .then(res => res.json())
      .then(async (res) => {
        if (Array.isArray(res)) {
          const merged = await Promise.all(
            res.map(async (entry: any) => {
              let media: SlambookMedia = {};
              try { media = (await getMedia(entry._id)) || {}; } catch { /* none on this device */ }
              return { entry, media };
            })
          );
          setEntries(merged);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Preparing your book…</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500 px-4 text-center">
        <p>No slambooks to merge yet.</p>
        <Link href="/dashboard" className="text-indigo-600 font-medium">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      {/* Print rules: each slambook starts on its own page; toolbar hidden when printing. */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          .slam-spread { break-after: page; page-break-after: always; box-shadow: none !important; }
          .slam-spread:last-child { break-after: auto; page-break-after: auto; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="text-sm text-slate-500 hidden sm:block">{entries.length} slambook{entries.length > 1 ? 's' : ''} · use "Save as PDF" in the print dialog</div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition text-sm font-medium"
        >
          <Printer className="w-4 h-4" /> Download as PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {entries.map(({ entry, media }) => (
          <Spread key={entry._id} data={entry} media={media} />
        ))}
      </div>
    </div>
  );
}

function Spread({ data, media }: { data: any; media: SlambookMedia }) {
  const half = Math.ceil((data.answers?.length || 0) / 2);
  const left = (data.answers || []).slice(0, half);
  const right = (data.answers || []).slice(half);
  const hasPhotos = media.bestPhoto || media.chaoticMemory || media.neverDelete;

  return (
    <div className="slam-spread bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="bg-[#fcfbf4] theme-scrapbook p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 transform -rotate-2">
            {data.creatorName} &amp; {data.friendName}
          </h2>
          <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-bold transform rotate-1">
            {data.relationshipTitle}
          </span>
        </div>

        {hasPhotos && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {media.bestPhoto && (
              <div className="col-span-2 aspect-video bg-slate-100 rounded-xl overflow-hidden border-4 border-white shadow-md">
                <img src={media.bestPhoto} alt="Best" className="w-full h-full object-cover" />
              </div>
            )}
            {media.chaoticMemory && (
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border-4 border-white shadow-md">
                <img src={media.chaoticMemory} alt="Chaotic" className="w-full h-full object-cover" />
              </div>
            )}
            {media.neverDelete && (
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden border-4 border-white shadow-md">
                <img src={media.neverDelete} alt="Keeper" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {[left, right].map((col, ci) => (
            <div key={ci} className="space-y-4">
              {col.map((a: any, i: number) => (
                <div key={i} className="bg-white/60 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-2 text-sm">{a.question}</h4>
                  <p className="text-slate-600 italic text-sm">"{a.answer}"</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {data.summary?.text && (
          <div className="mt-8 pt-6 border-t border-slate-300">
            <p className="text-sm font-bold text-slate-600 text-center">Summary of Us</p>
            <p className="text-xs text-slate-500 text-center mt-2 italic">{data.summary.text}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {(data.summary.keywords || []).map((kw: string, i: number) => (
                <span key={i} className="text-[10px] uppercase font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-sm">#{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
