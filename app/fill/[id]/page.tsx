"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowRight, ArrowLeft, Download, Check, Heart } from 'lucide-react';
import { determineRelationship } from '@/lib/relationship';
import { generateSlambookHtml, SlambookHtmlData } from '@/lib/generateSlambookHtml';

export default function FillPage() {
  const { id } = useParams();

  const [template, setTemplate] = useState<any>(null);
  const [step, setStep] = useState(0); // 0 = details, 1..N = questions, N+1 = media
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Once submitted, we hold the generated keepsake so the friend can (re)download it.
  const [finished, setFinished] = useState<SlambookHtmlData | null>(null);

  const [formData, setFormData] = useState({
    friendName: '',
    yearsKnown: 1,
    interactionFrequency: 'weekly',
    bondType: 'fun',
    interests: '',
    personalityTraits: ''
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [media, setMedia] = useState({ bestPhoto: '', chaoticMemory: '', neverDelete: '' });

  useEffect(() => {
    if (id) {
      fetch(`/api/templates/${id}`)
        .then(res => res.json())
        .then(res => {
          if (!res.error) setTemplate(res);
          setLoading(false);
        });
    }
  }, [id]);

  const handleImageUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMedia(prev => ({ ...prev, [key]: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadSlambook = (book: SlambookHtmlData) => {
    const html = generateSlambookHtml(book);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slambook-for-${book.creatorName}-by-${book.friendName}.html`
      .replace(/\s+/g, '-')
      .toLowerCase();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const submitAll = async () => {
    setIsSubmitting(true);

    const answersArr = Object.entries(answers).map(([q, a]) => ({ question: q, answer: a }));
    const relationshipTitle = determineRelationship(
      formData.yearsKnown,
      formData.interactionFrequency,
      formData.bondType
    );

    // Photos (media) are deliberately left OUT of this payload — they stay on this device.
    const finalPayload = {
      templateId: id,
      creatorName: template.creatorName,
      friendName: formData.friendName,
      yearsKnown: formData.yearsKnown,
      interactionFrequency: formData.interactionFrequency,
      bondType: formData.bondType,
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      personalityTraits: formData.personalityTraits.split(',').map(i => i.trim()).filter(Boolean),
      relationshipTitle,
      answers: answersArr
    };

    try {
      const res = await fetch('/api/create-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });
      const data = await res.json();
      if (data.id) {
        // Build the self-contained keepsake locally, with the photos embedded.
        const book: SlambookHtmlData = {
          creatorName: template.creatorName,
          friendName: formData.friendName,
          relationshipTitle,
          answers: answersArr,
          media,
          summary: data.summary || { text: '', keywords: [] }
        };
        downloadSlambook(book);
        setFinished(book);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!template) return <div className="min-h-screen flex items-center justify-center">Template not found</div>;

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 text-center"
        >
          <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-outfit text-slate-800 mb-2">Slambook ready!</h1>
          <p className="text-slate-500 mb-2">
            Your slambook for <span className="font-semibold text-slate-700">{template.creatorName}</span> has
            been downloaded as a file.
          </p>
          <p className="text-slate-500 mb-8 text-sm">
            Your photos stay on <span className="font-semibold">your device</span> — they&apos;re embedded inside
            that file and were never uploaded. Just send the file to {template.creatorName} (WhatsApp, email,
            AirDrop…) and they can open it on any device.
          </p>

          <button
            onClick={() => downloadSlambook(finished)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition mb-3"
          >
            <Download className="w-4 h-4" /> Download again
          </button>

          <div className="flex items-center justify-center gap-2 text-pink-400 mt-6">
            <Heart className="w-5 h-5 fill-pink-400" />
          </div>
        </motion.div>
      </div>
    );
  }

  const totalSteps = template.questions.length + 1; // details + questions + media
  const isDetailsStep = step === 0;
  const isMediaStep = step === totalSteps;
  const currentQIndex = step - 1;
  const currentQ = template.questions[currentQIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-10 md:pt-20 px-4 pb-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-outfit text-slate-800">For {template.creatorName}</h1>
          <p className="text-slate-500 text-sm">Fill out this slambook memory lane</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 min-h-[450px] flex flex-col relative">
          <AnimatePresence mode="wait">
            {isDetailsStep && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col space-y-4"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-2">About You</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                  <input required autoFocus type="text" value={formData.friendName} onChange={e => setFormData({...formData, friendName: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. Sam" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Years Known: {formData.yearsKnown}</label>
                  <input type="range" min="0" max="20" value={formData.yearsKnown} onChange={e => setFormData({...formData, yearsKnown: parseInt(e.target.value)})} className="w-full accent-pink-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Interaction</label>
                    <select value={formData.interactionFrequency} onChange={e => setFormData({...formData, interactionFrequency: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition bg-white">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="rarely">Rarely</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bond Type</label>
                    <select value={formData.bondType} onChange={e => setFormData({...formData, bondType: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition bg-white">
                      <option value="fun">Fun</option>
                      <option value="casual">Casual</option>
                      <option value="deep">Deep</option>
                      <option value="special">Special</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {!isDetailsStep && !isMediaStep && (
              <motion.div
                key={`q-${currentQIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="text-sm font-medium text-indigo-500 mb-4">Question {currentQIndex + 1} of {template.questions.length}</div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 font-outfit mb-8 leading-tight">
                  {currentQ.question}
                </h2>
                <textarea 
                  autoFocus
                  value={answers[currentQ.question] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.question]: e.target.value }))}
                  className="w-full flex-1 min-h-[150px] p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none text-lg bg-slate-50/50"
                  placeholder="Pour your heart out..."
                />
              </motion.div>
            )}

            {isMediaStep && (
              <motion.div
                key="media"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col space-y-6"
              >
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-800 font-outfit mb-2">Picture Perfect</h2>
                  <p className="text-slate-500">Add some photos that define your bond.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'bestPhoto', label: 'Best photo of us', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { key: 'chaoticMemory', label: 'Most chaotic memory', color: 'text-amber-500', bg: 'bg-amber-50' },
                    { key: 'neverDelete', label: 'One I\'ll never delete', color: 'text-pink-500', bg: 'bg-pink-50' }
                  ].map((item) => (
                    <div key={item.key} className="relative group rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden aspect-square flex flex-col items-center justify-center p-4 hover:border-slate-400 transition bg-slate-50">
                      {media[item.key as keyof typeof media] ? (
                        <img src={media[item.key as keyof typeof media]} alt="uploaded" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className={`flex flex-col items-center text-center gap-2 ${item.color}`}>
                          <div className={`p-3 rounded-full ${item.bg}`}>
                            <Camera className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{item.label}</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(item.key, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => setStep(prev => Math.max(0, prev - 1))}
              disabled={step === 0}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-30"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {!isMediaStep ? (
              <button 
                onClick={() => {
                  if (step === 0 && !formData.friendName.trim()) return;
                  if (step > 0 && !answers[currentQ.question]?.trim()) return; // Must answer current Q
                  setStep(prev => prev + 1);
                }}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/10"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={submitAll}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition shadow-lg shadow-pink-500/20 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? 'Crafting Slambook...' : 'Complete Slambook'}
              </button>
            )}
          </div>
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 rounded-t-3xl overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
