
import { NextRequest, NextResponse } from 'next/server';
import { discussFindingAction } from '@/ai/flows/discuss-finding';

export async function POST(request: NextRequest) {
  try {
    const { history, finding } = await request.json();

    if (!history || !finding) {
      return NextResponse.json({ error: 'Missing history or finding in request body' }, { status: 400 });
    }

    return await discussFindingAction(history, finding);

  } catch (error: any) {
    console.error('Error in /api/discuss-finding:', error);
    return NextResponse.json({ error: 'Server-side error processing discussion' }, { status: 500 });
  }
}
