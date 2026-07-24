import { NextRequest, NextResponse } from 'next/server';
import { getAdminAlgorithms, createAlgorithm } from '@/lib/services/adminService';

// Verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const token = request.cookies.get('rubik-admin-token')?.value;
  return Boolean(token);
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const algorithms = await getAdminAlgorithms(true);
    return NextResponse.json(algorithms, { status: 200 });
  } catch (error) {
    console.error('Algorithms admin fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch algorithms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const algorithm = await createAlgorithm(payload);

    return NextResponse.json(algorithm, { status: 201 });
  } catch (error) {
    console.error('Algorithms admin create error:', error);
    return NextResponse.json({ error: 'Failed to create algorithm' }, { status: 500 });
  }
}
