import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getVotes, addVote, clearVotes } from '@/lib/storage';
import { voteSchema } from '@/lib/validation';

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
    const body = await request.json();

    // Validate with Zod
    const validation = voteSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, choice, birthDate, birthTime, weight, height, hairColor, eyeColor } = validation.data;

    const vote = addVote({ 
      name: name.trim(), 
      email: email && email.trim() !== '' ? email.trim() : undefined,
      choice,
      birthDate: birthDate && birthDate.trim() !== '' ? birthDate.trim() : undefined,
      birthTime: birthTime && birthTime.trim() !== '' ? birthTime.trim() : undefined,
      weight,
      height,
      hairColor: hairColor && hairColor.trim() !== '' ? hairColor.trim() : undefined,
      eyeColor: eyeColor && eyeColor.trim() !== '' ? eyeColor.trim() : undefined
    });
    
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
