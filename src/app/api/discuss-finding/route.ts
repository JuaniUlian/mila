import { NextRequest, NextResponse } from 'next/server';
import { discussFindingAction } from '@/ai/flows/discuss-finding';

export async function POST(request: NextRequest) {
  console.log('📨 API ENDPOINT LLAMADO');
  
  try {
    const { history, finding } = await request.json();
    console.log('📝 Data recibida:', { historyLength: history?.length, findingId: finding?.id });

    if (!history || !finding) {
      console.log('❌ Missing data in request');
      return NextResponse.json({ error: 'Missing history or finding in request body' }, { status: 400 });
    }

    console.log('✅ Calling discussFindingAction...');
    const result = await discussFindingAction(history, finding);
    console.log('✅ Response ready');
    
    return result;

  } catch (error: unknown) {
    console.error('💥 Error in /api/discuss-finding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Server-side error processing discussion: ' + errorMessage }, { status: 500 });
  }
}