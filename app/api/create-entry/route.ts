import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SlambookEntry, SlambookTemplate } from '@/lib/models';

function generateSummary(answers: { question: string, answer: string }[], name: string): { text: string, keywords: string[] } {
  const concatenated = answers.map(a => a.answer).join(" ");
  const allWords = concatenated.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  
  const exclude = ['the', 'and', 'a', 'to', 'of', 'in', 'i', 'you', 'my', 'your', 'we', 'our', 'is', 'it', 'that', 'this', 'for', 'on', 'with', 'me', 'was', 'so'];
  const frequencies: Record<string, number> = {};
  allWords.forEach(w => {
    if (w.length > 3 && !exclude.includes(w)) {
      frequencies[w] = (frequencies[w] || 0) + 1;
    }
  });
  const keywords = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  const summaryText = `A vibrant collection of memories dedicated to ${name}. The recurring themes and inside jokes tell a beautiful story of connection and shared experiences. From the hilarious moments to the meaningful conversations, every answer reflects a unique bond.`;

  return { text: summaryText, keywords };
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      templateId,
      creatorName,
      friendName,
      yearsKnown,
      interactionFrequency,
      bondType,
      interests,
      personalityTraits,
      relationshipTitle,
      answers
      // NOTE: `media` is intentionally ignored — photos never reach the server.
    } = body;

    // The friend filling this in is NOT logged in — they inherit the creator's
    // ownership via the template, so the entry shows up on the creator's dashboard.
    const template = await SlambookTemplate.findById(templateId).select('ownerEmail');
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const summary = generateSummary(answers, creatorName);

    const newSlambookEntry = new SlambookEntry({
      templateId,
      ownerEmail: template.ownerEmail,
      creatorName,
      friendName,
      yearsKnown,
      interactionFrequency,
      bondType,
      interests,
      personalityTraits,
      relationshipTitle,
      answers,
      summary,
      theme: 'scrapbook'
    });

    const saved = await newSlambookEntry.save();

    // Return the summary so the client can embed it in the downloadable file.
    return NextResponse.json({ id: saved._id, summary, message: 'Created successfully' });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
