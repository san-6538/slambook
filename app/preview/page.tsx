"use client";
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Share2, Heart } from 'lucide-react';
import { getMedia, SlambookMedia } from '@/lib/slambookStore';

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading your memory lane...</div>}>
      <PreviewInner />
    </Suspense>
  );
}

function PreviewInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);
  const [media, setLocalMedia] = useState<SlambookMedia>({});
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/slambooks/${id}`)
        .then(res => res.json())
        .then(res => {
          if (!res.error) setData(res);
        });
      // Photos live only on this device (imported from the friend's keepsake file).
      getMedia(id).then(m => { if (m) setLocalMedia(m); }).catch(() => {});
    }
  }, [id]);

  const handleDownload = () => {
    window.print();
  };

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Loading your memory lane...</div>;
  }

  // Two page layout: left page and right page
  return (
    <div className="min-h-screen bg-slate-200 py-8 md:py-12 px-4 flex flex-col items-center custom-scrollbar">
      {/* Top Banner Actions */}
      <div className="max-w-5xl w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8 bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="font-bold text-lg md:text-xl font-outfit text-slate-800">Your Slambook</h1>
        <div className="flex gap-3">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition text-sm font-medium">
            <Share2 className="w-4 h-4" /> Share Link
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Book Layout */}
      <div ref={printRef} className={`w-full max-w-5xl flex flex-col md:flex-row gap-4 aspect-auto md:aspect-[2/1.4] bg-transparent`}>
        
        {/* Left Page */}
        <div className="flex-1 bg-[#fcfbf4] theme-scrapbook rounded-l-md rounded-r-sm shadow-2xl p-8 md:p-12 relative overflow-hidden ring-1 ring-black/5">
          {/* Subtle binding shadow */}
          <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col h-full">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-slate-800 mb-2 transform -rotate-2">
                {data.creatorName} & {data.friendName}
              </h2>
              <div className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-bold transform rotate-1">
                {data.relationshipTitle}
              </div>
            </div>

            <div className="prose prose-sm prose-slate max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {data.answers.slice(0, Math.ceil(data.answers.length / 2)).map((a: any, i: number) => (
                <div key={i} className="bg-white/60 p-4 rounded-xl shadow-sm border border-slate-200 backdrop-blur-sm transform transition hover:-translate-y-0.5">
                  <h4 className="font-bold text-slate-700 mb-2">{a.question}</h4>
                  <p className="text-slate-600 font-medium italic">"{a.answer}"</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-300">
              <p className="text-sm font-bold text-slate-600 text-center">Summary of Us</p>
              <p className="text-xs text-slate-500 text-center mt-2 italic">{data.summary.text}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 mt-auto">
                {data.summary.keywords.map((kw: string, i: number) => (
                  <span key={i} className="text-[10px] uppercase font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-sm">#{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Page */}
        <div className="flex-1 bg-[#fcfbf4] theme-scrapbook rounded-r-md rounded-l-sm shadow-2xl p-8 md:p-12 relative overflow-hidden ring-1 ring-black/5">
          <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col h-full">
            {!media.bestPhoto && !media.chaoticMemory && !media.neverDelete && (
              <div className="mb-8 p-4 rounded-xl bg-pink-50 border border-pink-100 text-center">
                <p className="text-sm font-bold text-pink-600">📷 Photos live in the file your friend sent you</p>
                <p className="text-xs text-slate-500 mt-1">
                  To keep photos private and free, they were never uploaded. Import the keepsake file your friend
                  sent from your dashboard to add the photos here (they stay on this device).
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {media.bestPhoto && (
                <div className="col-span-2 aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-md transform rotate-1 border-4 border-white relative">
                  <img src={media.bestPhoto} alt="Best" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs font-bold rounded backdrop-blur-sm">Best Photo</div>
                </div>
              )}
              {media.chaoticMemory && (
                <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-md transform -rotate-2 border-4 border-white relative">
                  <img src={media.chaoticMemory} alt="Chaotic" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded backdrop-blur-sm">Chaotic</div>
                </div>
              )}
              {media.neverDelete && (
                <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-md transform rotate-2 border-4 border-white relative">
                  <img src={media.neverDelete} alt="Keeper" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded backdrop-blur-sm">Keeper</div>
                </div>
              )}
            </div>

            <div className="prose prose-sm prose-slate max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {data.answers.slice(Math.ceil(data.answers.length / 2)).map((a: any, i: number) => (
                <div key={i} className="bg-white/60 p-4 rounded-xl shadow-sm border border-slate-200 backdrop-blur-sm transform transition hover:-translate-y-0.5">
                  <h4 className="font-bold text-slate-700 mb-2">{a.question}</h4>
                  <p className="text-slate-600 font-medium italic">"{a.answer}"</p>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8 flex justify-center pb-2">
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
