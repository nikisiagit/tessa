import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  revalidatePath('/');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
