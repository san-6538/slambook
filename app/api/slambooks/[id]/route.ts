import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SlambookEntry } from '@/lib/models';
import { auth } from '@/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await props.params;
    const doc = await SlambookEntry.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (doc.ownerEmail !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await props.params;
    const doc = await SlambookEntry.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (doc.ownerEmail !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await doc.deleteOne();
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
