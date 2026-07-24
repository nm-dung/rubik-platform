import { NextRequest, NextResponse } from 'next/server';
import { getAdminLessons, createLesson } from '@/lib/services/adminService';

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

    const lessons = await getAdminLessons(true);
    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    console.error('Lessons admin fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const lesson = await createLesson(payload);

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Lessons admin create error:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
