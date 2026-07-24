import { NextRequest, NextResponse } from 'next/server';
import { getUserRole } from '@/lib/services/adminService';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const role = await getUserRole(userId);
    const isAdmin = role === 'admin' || role === 'coach';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ authenticated: true, role }, { status: 200 });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
