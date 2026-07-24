import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('rubik-admin-token')?.value;
  
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    // Decode token (format: base64(email:timestamp))
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email] = decoded.split(':');

    return NextResponse.json({ 
      authenticated: true, 
      email,
      role: 'admin', // TODO: fetch from profiles table in full RBAC implementation
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
