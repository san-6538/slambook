"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RenderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RenderInner />
    </Suspense>
  );
}

function RenderInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/slambooks/${id}`)
        .then(res => res.json())
        .then(res => {
          if (!res.error) setData(res);
        });
    }
  }, [id]);

  if (!data) return <div className="min-h-screen"></div>;

  return (
    <div className="w-[1400px] h-[900px] bg-white flex p-8 gap-4 overflow-hidden">
      {/* Left Page */}
      <div className="flex-1 bg-[#fcfbf4] theme-scrapbook rounded-md shadow-sm border border-slate-200 p-12 relative">
        <div className="flex flex-col h-full">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-slate-800 mb-4 transform -rotate-2">
              {data.creatorName} & {data.friendName}
            </h2>
            <div className="inline-block px-4 py-1.5 bg-pink-100 text-pink-700 rounded-full text-lg font-bold transform rotate-1">
              {data.relationshipTitle}
            </div>
          </div>

          <div className="prose prose-slate max-w-none flex-1 space-y-6">
            {data.answers.slice(0, Math.ceil(data.answers.length / 2)).map((a: any, i: number) => (
              <div key={i} className="bg-white/60 p-4 rounded-xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-2">{a.question}</h4>
                <p className="text-slate-600 font-medium italic">"{a.answer}"</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-300">
            <p className="font-bold text-slate-600 text-center">Summary of Us</p>
            <p className="text-sm text-slate-500 text-center mt-2 italic">{data.summary.text}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {data.summary.keywords.map((kw: string, i: number) => (
                <span key={i} className="text-xs uppercase font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-sm">#{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Page */}
      <div className="flex-1 bg-[#fcfbf4] theme-scrapbook rounded-md shadow-sm border border-slate-200 p-12 relative flex flex-col">
        <div className="grid grid-cols-2 gap-6 mb-8">
          {data.media?.bestPhoto && (
            <div className="col-span-2 h-[300px] bg-slate-100 rounded-xl overflow-hidden shadow-sm transform rotate-1 border-[6px] border-white relative">
              <img src={data.media.bestPhoto} alt="Best" className="w-full h-full object-cover" />
            </div>
          )}
          {data.media?.chaoticMemory && (
            <div className="h-[200px] bg-slate-100 rounded-xl overflow-hidden shadow-sm transform -rotate-2 border-[6px] border-white relative">
              <img src={data.media.chaoticMemory} alt="Chaotic" className="w-full h-full object-cover" />
            </div>
          )}
          {data.media?.neverDelete && (
            <div className="h-[200px] bg-slate-100 rounded-xl overflow-hidden shadow-sm transform rotate-2 border-[6px] border-white relative">
              <img src={data.media.neverDelete} alt="Keeper" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="prose prose-slate max-w-none flex-1 space-y-6">
          {data.answers.slice(Math.ceil(data.answers.length / 2)).map((a: any, i: number) => (
            <div key={i} className="bg-white/60 p-4 rounded-xl shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-2">{a.question}</h4>
              <p className="text-slate-600 font-medium italic">"{a.answer}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
