
import { NextRequest, NextResponse } from 'next/server';
import { discussFindingAction } from '@/ai/flows/discuss-finding';

export async function POST(request: NextRequest) {
  console.log('API Route /api/discuss-finding called.');
  
  try {
    const body = await request.json();
    const { history, finding } = body;
    
    console.log('Received data:', { 
        historyLength: history?.length, 
        findingId: finding?.id,
        lastMessage: history?.[history.length - 1] 
    });

    if (!history || !finding) {
      console.error('Missing data in request body:', body);
      return NextResponse.json({ error: 'Missing history or finding in request body' }, { status: 400 });
    }

    console.log('Calling discussFindingAction...');
    const resultText = await discussFindingAction(history, finding);
    console.log('Action response received, sending back to client.');
    
    // Respond with a simple JSON object containing the text
    return NextResponse.json({ reply: resultText });

  } catch (error: unknown) {
    console.error('💥 Error in /api/discuss-finding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Server-side error processing discussion: ' + errorMessage }, { status: 500 });
  }
}
