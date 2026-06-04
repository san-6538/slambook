import { NextResponse } from 'next/server';
import { determineRelationship } from '@/lib/relationship';
import { getRecommendedQuestions } from '@/lib/questionPool';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { yearsKnown, interactionFrequency, bondType } = body;

    const relationshipTitle = determineRelationship(yearsKnown, interactionFrequency, bondType);

    // Recommend questions from the curated pool, tailored to the relationship.
    const questions = getRecommendedQuestions(relationshipTitle, 5);

    return NextResponse.json({
      relationshipTitle,
      questions
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
