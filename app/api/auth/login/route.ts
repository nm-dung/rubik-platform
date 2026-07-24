import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedEmail || !expectedPassword) {
      return NextResponse.json({ error: 'Admin credentials are not configured.' }, { status: 500 });
    }

    if (email === expectedEmail && password === expectedPassword) {
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      const response = NextResponse.json({ success: true, token });
      response.cookies.set('rubik-admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
