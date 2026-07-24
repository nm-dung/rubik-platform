import { NextRequest, NextResponse } from 'next/server';
import { updateAlgorithm, deleteAlgorithm } from '@/lib/services/adminService';

// Verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const token = request.cookies.get('rubik-admin-token')?.value;
  return Boolean(token);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ algorithmId: string }> }
) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { algorithmId } = await params;
    const payload = await request.json();
    const algorithm = await updateAlgorithm(algorithmId, payload);

    return NextResponse.json(algorithm, { status: 200 });
  } catch (error) {
    console.error('Algorithms admin update error:', error);
    return NextResponse.json({ error: 'Failed to update algorithm' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ algorithmId: string }> }
) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { algorithmId } = await params;
    await deleteAlgorithm(algorithmId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Algorithms admin delete error:', error);
    return NextResponse.json({ error: 'Failed to delete algorithm' }, { status: 500 });
  }
}
