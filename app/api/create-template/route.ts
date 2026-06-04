import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SlambookTemplate } from '@/lib/models';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const {
      creatorName,
      questions
    } = body;

    const newTemplate = new SlambookTemplate({
      ownerEmail: session.user.email,
      creatorName,
      questions
    });

    const saved = await newTemplate.save();

    return NextResponse.json({ id: saved._id, message: 'Template created successfully' });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
