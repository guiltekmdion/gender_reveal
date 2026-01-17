import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getVotes, addVote, clearVotes } from '@/lib/storage';
import { voteSchema } from '@/lib/validation';
import { normalizeTime, normalizeDate, normalizeColor } from '@/lib/normalization';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    // Support mock data via ?mock=1
    const searchParams = request.nextUrl.searchParams;
    const mockMode = searchParams.get('mock') === '1';
    
    let votes;
    if (mockMode) {
      const { generateMockVotes } = await import('@/lib/stats/mock-data');
      votes = generateMockVotes();
    } else {
      votes = getVotes();
    }
    
    // Headers pour éviter le cache (données live)
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    // Optionnel: Support ETag pour détecter les changements
    const etag = `"${votes.length}-${votes.length > 0 ? votes[0].timestamp : 0}"`;
    headers.set('ETag', etag);
    
    // Si le client a le même ETag, retourner 304 Not Modified
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers });
    }
    
    return NextResponse.json(votes, { headers });
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

    const { name, email, choice, message, birthDate, birthTime, weight, height, hairColor, eyeColor } = validation.data;

    // Normaliser les données avant stockage
    const normalizedBirthDate = birthDate ? normalizeDate(birthDate.trim()) : undefined;
    const normalizedBirthTime = birthTime ? normalizeTime(birthTime.trim()) : undefined;
    const normalizedHairColor = hairColor ? normalizeColor(hairColor.trim()) : undefined;
    const normalizedEyeColor = eyeColor ? normalizeColor(eyeColor.trim()) : undefined;

    const vote = addVote({ 
      name: name.trim(), 
      email: email && email.trim() !== '' ? email.trim() : undefined,
      choice,
      message: message && message.trim() !== '' ? message.trim() : undefined,
      birthDate: normalizedBirthDate || undefined,
      birthTime: normalizedBirthTime || undefined,
      weight,
      height,
      hairColor: normalizedHairColor || undefined,
      eyeColor: normalizedEyeColor || undefined
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
