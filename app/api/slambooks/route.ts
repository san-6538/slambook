import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SlambookEntry } from '@/lib/models';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const docs = await SlambookEntry.find({ ownerEmail: session.user.email }).sort({ createdAt: -1 });
    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
