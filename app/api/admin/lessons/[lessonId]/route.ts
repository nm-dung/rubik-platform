import { NextRequest, NextResponse } from 'next/server';
import { updateLesson, deleteLesson } from '@/lib/services/adminService';

// Verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const token = request.cookies.get('rubik-admin-token')?.value;
  return Boolean(token);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;
    const payload = await request.json();
    const lesson = await updateLesson(lessonId, payload);

    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    console.error('Lessons admin update error:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;
    await deleteLesson(lessonId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Lessons admin delete error:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
