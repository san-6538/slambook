import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SlambookTemplate } from '@/lib/models';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const params = await props.params;
    const { id } = params;
    // Public endpoint (friends read this to fill the form) — never expose the creator's email.
    const doc = await SlambookTemplate.findById(id).select('-ownerEmail');
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
