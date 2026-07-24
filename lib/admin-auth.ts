/**
 * Admin Auth Utilities
 * Client-side helpers for checking admin status and redirecting
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role?: string;
}

/**
 * Hook to check admin authentication status
 */
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser({
            authenticated: true,
            userId: data.userId,
            email: data.email,
            role: data.role,
          });
        } else {
          setUser({ authenticated: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser({ authenticated: false });
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser({ authenticated: false });
    const locale = window.location.pathname.split('/')[1] || 'en';
    router.push(`/${locale}/admin/login`);
  };

  return { user, loading, logout };
}

/**
 * Server-side function to check admin role
 */
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Admin verification failed:', error);
    return false;
  }
}
