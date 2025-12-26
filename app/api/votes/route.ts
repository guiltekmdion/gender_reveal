import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getVotes, addVote, clearVotes } from '@/lib/storage';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function GET() {
  try {
    const votes = getVotes();
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, choice } = await request.json();

    if (!name || !choice) {
      return NextResponse.json(
        { error: 'Name and choice are required' },
        { status: 400 }
      );
    }

    if (choice !== 'girl' && choice !== 'boy') {
      return NextResponse.json(
        { error: 'Choice must be "girl" or "boy"' },
        { status: 400 }
      );
    }

    const vote = addVote({ name: name.trim(), choice });
    
    return NextResponse.json(vote);
  } catch (error) {
    console.error('Add vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    clearVotes();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear votes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
